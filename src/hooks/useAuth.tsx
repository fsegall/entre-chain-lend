
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { AuthUser, AuthContextType } from "./auth/types";
import { formatUser } from "./auth/utils";
import { fetchUserProfile } from "./auth/profileService";
import { setUserRole as updateUserRole, connectWallet as updateWalletAddress } from "./auth/roleService";
import * as authService from "./auth/authService";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Method to refresh user profile data
  const refreshUserProfile = async (): Promise<void> => {
    if (!session?.user) return;
    
    try {
      console.log("Refreshing user profile for:", session.user.id);
      const { profile, roles } = await fetchUserProfile(session.user.id);
      
      console.log("Profile data received:", { 
        profile,
        roles,
        email: session.user.email
      });
      
      // Update the user with profile data and roles
      setUser(prev => {
        if (!prev) return null;
        
        const updatedUser = {
          ...prev,
          ...profile,
          roles: roles
        };
        
        console.log("Updated user state:", updatedUser);
        return updatedUser;
      });
      
      // Return value removed to match Promise<void> return type
    } catch (error) {
      console.error("Error refreshing user profile:", error);
      throw error;
    }
  };
  
  // Check for existing session on mount
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event);
        setSession(newSession);
        
        if (newSession?.user) {
          const formattedUser = formatUser(newSession.user, newSession);
          setUser(formattedUser);
          
          // Defer additional data loading to avoid auth state deadlocks
          setTimeout(() => {
            refreshUserProfile();
          }, 0);
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      
      if (session?.user) {
        const formattedUser = formatUser(session.user, session);
        setUser(formattedUser);
        
        // Defer additional data loading to avoid auth state deadlocks
        setTimeout(() => {
          refreshUserProfile();
        }, 0);
      }
      
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await authService.signIn(email, password);
      
      // Update state
      setSession(result.session);
      setUser(result.user);
      toast.success("Signed in successfully!");
      
      // Refresh user profile to get roles and additional data
      setTimeout(() => {
        refreshUserProfile();
      }, 0);
      
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast.error(error.message || "Failed to sign in. Please check your credentials.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      const result = await authService.signUp(email, password, fullName);

      if (result.user) {
        setSession(result.session);
        setUser(result.user);
        
        // Refresh user profile to get roles and additional data
        setTimeout(() => {
          refreshUserProfile();
        }, 0);
        
        toast.success("Account created successfully!");
        navigate("/dashboard");
      } else {
        // Some Supabase instances require email verification
        toast.success("Please check your email to confirm your account.");
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast.error(error.message || "Failed to create account. Please try again.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await authService.signOut();
      
      setUser(null);
      setSession(null);
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast.error(error.message || "Failed to sign out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Role selection function
  const setUserRole = async (role: 'borrower' | 'lender') => {
    if (!user) {
      toast.error("You must be logged in to set a role");
      return;
    }

    try {
      setLoading(true);
      await updateUserRole(user.id, role);
      
      // Refresh user profile to get updated roles
      await refreshUserProfile();
      
      toast.success(`You are now registered as a ${role}`);
    } catch (error: any) {
      console.error("Role selection error:", error);
      toast.error(error.message || `Failed to set role as ${role}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Wallet connection function
  const connectWallet = async (address: string) => {
    if (!user) {
      toast.error("You must be logged in to connect a wallet");
      return;
    }

    try {
      setLoading(true);
      await updateWalletAddress(user.id, address);
      
      // Update local user state
      setUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          wallet_address: address
        };
      });
      
      toast.success("Wallet connected successfully");
    } catch (error: any) {
      console.error("Wallet connection error:", error);
      toast.error(error.message || "Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      signIn, 
      signUp, 
      signOut,
      refreshUserProfile,
      setUserRole,
      connectWallet
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
