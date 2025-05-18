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
        const formattedUser = formatUser(session.user, session);
        setUser(formattedUser);

        if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
          const { profile } = await fetchUserProfile(session.user.id);
          if (mountedRef.current) {
            setUser(prev => (prev ? { ...prev, ...profile } : null));
          }
        }
      } else {
        setSession(null);
        setUser(null);
      }
      if (mountedRef.current) setLoading(false);
    });

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      await authService.signInWithEmail(email, password);
    } catch (error: any) {
      toast.error(error.message || "Erro ao entrar.");
      throw error;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      await authService.signUp(email, password, fullName);
      toast.info("Verifique seu e-mail para confirmar o cadastro.");
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar conta.");
      throw error;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      await authService.signOut();
    } catch (error: any) {
      toast.error(error.message || "Erro ao sair.");
      throw error;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      await authService.signInWithGoogle();
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
      await authService.signInWithGithub();
    } catch (error: any) {
      toast.error(error.message || "Erro ao entrar com GitHub.");
      throw error;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

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