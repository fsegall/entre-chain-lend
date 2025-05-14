
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type User = {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        // This is a mock implementation since we're using Auth0 via Supabase
        // In a real implementation, you would use the Supabase client to check the session
        const storedUser = localStorage.getItem("blockLoanUser");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      // Mock implementation - in a real app, use the Supabase client
      // with Auth0 integration to sign in the user
      console.log("Signing in with:", email, password);
      
      // Simulate a successful login
      const mockUser = {
        id: "user_" + Math.random().toString(36).substr(2, 9),
        email: email,
        full_name: email.split('@')[0],
      };
      
      setUser(mockUser);
      localStorage.setItem("blockLoanUser", JSON.stringify(mockUser));
      toast.success("Signed in successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("Failed to sign in. Please check your credentials.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      // Mock implementation - in a real app, use the Supabase client
      // with Auth0 integration to register the user
      console.log("Signing up with:", email, password, fullName);
      
      // Simulate a successful registration
      const mockUser = {
        id: "user_" + Math.random().toString(36).substr(2, 9),
        email: email,
        full_name: fullName,
      };
      
      setUser(mockUser);
      localStorage.setItem("blockLoanUser", JSON.stringify(mockUser));
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error("Failed to create account. Please try again.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      // Mock implementation - in a real app, use the Supabase client to sign out
      localStorage.removeItem("blockLoanUser");
      setUser(null);
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out. Please try again.");
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
