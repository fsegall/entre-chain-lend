import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { AuthUser, AuthContextType } from "./types";
import { formatUser } from "./utils";
import { fetchUserProfile } from "./profileService";
import * as authService from "./authService";
import AuthContext from "./AuthContext";
import React, { useContext, ReactNode } from 'react';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const mountedRef = useRef(true);

  // Initialize auth state
  useEffect(() => {
    console.log("Setting up auth state listener...");
    setLoading(true);

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      if (!mountedRef.current) return;
      
      if (session) {
        console.log("Setting new session and user...");
        setSession(session);
        const formattedUser = formatUser(session.user, session);
        console.log("Formatted user from auth change:", formattedUser);
        setUser(formattedUser);
        
        // Handle both SIGNED_IN and INITIAL_SESSION events
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          console.log("Fetching profile...");
          const { profile } = await fetchUserProfile(session.user.id);
          if (mountedRef.current) {
            console.log("Setting user profile:", profile);
            setUser(prev => {
              const updatedUser = prev ? { ...prev, ...profile } : null;
              console.log("Updated user with profile:", updatedUser);
              return updatedUser;
            });
          }
        }
      } else {
        console.log("Session cleared, resetting user and session");
        setSession(null);
        setUser(null);
      }

      // Set loading to false after handling the event
      if (mountedRef.current) {
        console.log("Setting loading to false after auth state change");
        setLoading(false);
      }
    });

    return () => {
      console.log("Cleaning up auth state...");
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Authentication methods
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      console.log("Starting sign in...");
      setLoading(true);
      await authService.signInWithEmail(email, password);
      console.log("Sign in successful");
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast.error(error.message || "Failed to sign in. Please check your credentials.");
      throw error;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      console.log("Starting Google sign in...");
      setLoading(true);
      await authService.signInWithGoogle();
      console.log("Google sign in initiated");
    } catch (error: any) {
      console.error("Google sign in error:", error);
      toast.error(error.message || "Failed to sign in with Google. Please try again.");
      throw error;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const signInWithGithub = useCallback(async () => {
    try {
      console.log("Starting GitHub sign in...");
      setLoading(true);
      await authService.signInWithGithub();
      console.log("GitHub sign in initiated");
    } catch (error: any) {
      console.error("GitHub sign in error:", error);
      toast.error(error.message || "Failed to sign in with GitHub. Please try again.");
      throw error;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      await authService.signUp(email, password, fullName);
      toast.info("Please check your email to confirm your account.");
    } catch (error: any) {
      toast.error(error.message || "Failed to create account. Please try again.");
      throw error;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      await authService.signOut();
    } catch (error: any) {
      toast.error(error.message || "Failed to sign out. Please try again.");
      throw error;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const value = useMemo(() => ({
    user,
    session,
    loading,
    signIn,
    signInWithGoogle,
    signInWithGithub,
    signUp,
    signOut
  }), [user, session, loading, signIn, signInWithGoogle, signInWithGithub, signUp, signOut]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
