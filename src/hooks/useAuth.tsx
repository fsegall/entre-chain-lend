
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
  is_onboarded?: boolean;
  role_selection?: string;
  roles?: string[];
  wallet_address?: string; // Add wallet address for blockchain integration
};

type AuthContextType = {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  setUserRole: (role: 'borrower' | 'lender') => Promise<void>; // Add role selection function
  connectWallet: (address: string) => Promise<void>; // Add wallet connection function
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Format Supabase user data to match our AuthUser type
  const formatUser = (user: User | null, session: Session | null): AuthUser | null => {
    if (!user) return null;
    
    return {
      id: user.id,
      email: user.email || '',
      full_name: user.user_metadata?.full_name,
      avatar_url: user.user_metadata?.avatar_url,
      wallet_address: user.user_metadata?.wallet_address,
    };
  };

  const refreshUserProfile = async () => {
    if (!session?.user) return;
    
    try {
      // Get the user's profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (profileError) throw profileError;
      
      // Get user's roles
      const { data: roles, error: rolesError } = await supabase
        .rpc('get_user_roles', { _user_id: session.user.id });
        
      if (rolesError) throw rolesError;
      
      // Update the user with profile data and roles
      setUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          ...profile,
          roles: roles || []
        };
      });
      
    } catch (error) {
      console.error("Error fetching user profile:", error);
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Fix: Access user from data properly
      setSession(data.session);
      setUser(formatUser(data.user, data.session));
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
        setSession(data.session);
        setUser(formatUser(data.user, data.session));
        
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
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
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

  // New function to set user role
  const setUserRole = async (role: 'borrower' | 'lender') => {
    if (!user) {
      toast.error("You must be logged in to set a role");
      return;
    }

    try {
      setLoading(true);
      
      // Update the profile with the selected role
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role_selection: role })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      // Insert the role into user_roles if it doesn't exist
      // Fixed: Use direct insert instead of RPC
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ 
          user_id: user.id,
          role: role
        })
        .onConflict(['user_id', 'role'])
        .ignore();
      
      if (insertError) throw insertError;
      
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
  
  // New function to connect wallet
  const connectWallet = async (address: string) => {
    if (!user) {
      toast.error("You must be logged in to connect a wallet");
      return;
    }

    try {
      setLoading(true);
      
      // Update the user metadata with the wallet address
      const { error } = await supabase.auth.updateUser({
        data: { wallet_address: address }
      });
      
      if (error) throw error;
      
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
