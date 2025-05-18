import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { AuthUser } from "../types/types";
import { formatUser } from "../utils/utils";
import { fetchUserProfile } from "../hooks/auth/profileService";
import * as authService from "../hooks/auth/authService";

type UserRole = "lender" | "borrower";

interface UnifiedAuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  role: UserRole;
  setRole: (role: UserRole) => void;
}

const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined);

export function UnifiedAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem("userRole");
    return (saved as UserRole) || "borrower";
  });

  const navigate = useNavigate();
  const mountedRef = useRef(true);

  useEffect(() => {
    localStorage.setItem("userRole", role);
  }, [role]);

  useEffect(() => {
    setLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mountedRef.current) return;

      if (session) {
        setSession(session);
        try {
          const { profile } = await fetchUserProfile(session.user.id);
          const formattedUser = formatUser(session.user, session);
          setUser(formattedUser);
        } catch (error) {
          console.error("Error fetching user profile:", error);
          const formattedUser = formatUser(session.user, session);
          setUser(formattedUser);
        }
      } else {
        setSession(null);
        setUser(null);
      }
      if (mountedRef.current) setLoading(false);
    });

    // Check for existing session on mount
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session) {
          setSession(session);
          try {
            const { profile } = await fetchUserProfile(session.user.id);
            const formattedUser = formatUser(session.user, session);
            setUser(formattedUser);
          } catch (error) {
            console.error("Error fetching user profile:", error);
            const formattedUser = formatUser(session.user, session);
            setUser(formattedUser);
          }
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };

    checkSession();

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      if (data.session) {
        setSession(data.session);
        try {
          const { profile } = await fetchUserProfile(data.session.user.id);
          const formattedUser = formatUser(data.session.user, data.session);
          setUser(formattedUser);
          navigate('/dashboard');
        } catch (error) {
          console.error("Error fetching user profile:", error);
          const formattedUser = formatUser(data.session.user, data.session);
          setUser(formattedUser);
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao entrar.");
      throw error;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [navigate]);

  const signInWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth-callback`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Erro ao entrar com Google.");
      throw error;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  const signInWithGithub = useCallback(async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth-callback`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Erro ao entrar com GitHub.");
      throw error;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear local state
      setUser(null);
      setSession(null);
      
      // Clear role from localStorage
      localStorage.removeItem("userRole");
      
      // Navigate after state is cleared
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || "Erro ao sair.");
      throw error;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [navigate]);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      const userId = data.user?.id;
      if (!userId) throw new Error("User ID não disponível após signUp.");

      // Create profile
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([{ id: userId, full_name: fullName }]);

      if (profileError) throw profileError;

      toast.info("Verifique seu e-mail para confirmar o cadastro.");
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar conta.");
      throw error;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [navigate]);

  const value = useMemo(() => ({
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithGithub,
    role,
    setRole
  }), [user, session, loading, signIn, signUp, signOut, signInWithGoogle, signInWithGithub, role]);

  return (
    <UnifiedAuthContext.Provider value={value}>
      {children}
    </UnifiedAuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(UnifiedAuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a UnifiedAuthProvider");
  }
  return context;
}