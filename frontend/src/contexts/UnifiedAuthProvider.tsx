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
    console.log("UnifiedAuthProvider: Starting initialization");
    setLoading(true);
    let mounted = true;
    let initialCheckComplete = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) {
        console.log("UnifiedAuthProvider: Component unmounted, ignoring auth state change");
        return;
      }

      // Skip auth state changes until initial check is complete
      if (!initialCheckComplete) {
        console.log("UnifiedAuthProvider: Skipping auth state change - initial check not complete");
        return;
      }

      console.log('UnifiedAuthProvider: Auth state changed:', event, session);

      if (event === 'SIGNED_OUT' || !session) {
        console.log("UnifiedAuthProvider: User signed out or no session");
        setUser(null);
        setSession(null);
        localStorage.removeItem("userRole");
        if (mounted) setLoading(false);
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log("UnifiedAuthProvider: User signed in or token refreshed");
        if (session) {
          setSession(session);
          try {
            console.log("UnifiedAuthProvider: Fetching user profile");
            const { profile } = await fetchUserProfile(session.user.id);
            const formattedUser = formatUser(session.user, session);
            console.log("UnifiedAuthProvider: Setting user state", formattedUser);
            setUser(formattedUser);
          } catch (error) {
            console.error("UnifiedAuthProvider: Error fetching user profile:", error);
            const formattedUser = formatUser(session.user, session);
            setUser(formattedUser);
          }
        }
      }
      
      if (mounted) {
        console.log("UnifiedAuthProvider: Setting loading to false");
        setLoading(false);
      }
    });

    // Initial session check
    console.log("UnifiedAuthProvider: Checking initial session");
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) {
        console.log("UnifiedAuthProvider: Component unmounted during session check");
        return;
      }

      if (session) {
        console.log("UnifiedAuthProvider: Found existing session");
        setSession(session);
        fetchUserProfile(session.user.id)
          .then(({ profile }) => {
            if (!mounted) return;
            console.log("UnifiedAuthProvider: Fetched user profile");
            const formattedUser = formatUser(session.user, session);
            setUser(formattedUser);
          })
          .catch((error) => {
            console.error("UnifiedAuthProvider: Error fetching user profile:", error);
            if (!mounted) return;
            const formattedUser = formatUser(session.user, session);
            setUser(formattedUser);
          })
          .finally(() => {
            if (mounted) {
              console.log("UnifiedAuthProvider: Setting loading to false after profile fetch");
              setLoading(false);
              initialCheckComplete = true;
            }
          });
      } else {
        console.log("UnifiedAuthProvider: No existing session");
        setSession(null);
        setUser(null);
        if (mounted) {
          setLoading(false);
          initialCheckComplete = true;
        }
      }
    });

    return () => {
      console.log("UnifiedAuthProvider: Cleaning up");
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      // Clear any existing session first
      await supabase.auth.signOut({ scope: 'local' });
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      if (data.session) {
        setSession(data.session);
        try {
          const { profile } = await fetchUserProfile(data.session.user.id);
          const formattedUser = formatUser(data.session.user, data.session);
          setUser(formattedUser);
          navigate('/dashboard', { replace: true });
        } catch (error) {
          console.error("Error fetching user profile:", error);
          const formattedUser = formatUser(data.session.user, data.session);
          setUser(formattedUser);
          navigate('/dashboard', { replace: true });
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
      // Clear local state first
      setUser(null);
      setSession(null);
      localStorage.removeItem("userRole");
      
      // Sign out from Supabase with scope: 'local'
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) throw error;
      
      // Navigate after everything is cleared
      navigate('/');
    } catch (error: any) {
      console.error('Sign out error:', error);
      // Even if there's an error, we should still clear local state and navigate
      setUser(null);
      setSession(null);
      localStorage.removeItem("userRole");
      navigate('/');
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

      // Check if profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      // Only create profile if it doesn't exist
      if (!existingProfile) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert([{ id: userId, full_name: fullName }]);

        if (profileError) throw profileError;
      }

      toast.info("Verifique seu e-mail para confirmar o cadastro.");
      navigate('/login');
    } catch (error: any) {
      if (error.code === '23505') {
        toast.error("Este e-mail já está cadastrado.");
      } else {
        toast.error(error.message || "Erro ao criar conta.");
      }
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