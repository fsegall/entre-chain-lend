
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

type AuthUser = {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Format Supabase user data to match our AuthUser type
  const formatUser = (user: User | null): AuthUser | null => {
    if (!user) return null;
    
    return {
      id: user.id,
      email: user.email || '',
      full_name: user.user_metadata?.full_name,
      avatar_url: user.user_metadata?.avatar_url,
    };
  };

  // Check for existing session on mount
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(formatUser(session.user));
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(formatUser(session?.user || null));
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Fix: Access user from data properly
      setUser(formatUser(data.user));
      toast.success("Signed in successfully!");
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      // Fix: Access user from data properly
      if (data.user) {
        setUser(formatUser(data.user));
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
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      setUser(null);
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast.error(error.message || "Failed to sign out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
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
