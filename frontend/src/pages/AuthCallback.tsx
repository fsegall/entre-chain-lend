import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const { refreshUserProfile } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("Auth callback processing started at:", new Date().toISOString());
        console.log("URL hash:", window.location.hash);
        console.log("URL search params:", window.location.search);
        
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log("Session check completed", { 
          hasSession: !!session,
          sessionError: sessionError ? sessionError.message : null,
          user: session?.user ? {
            id: session.user.id,
            email: session.user.email,
            role: session.user.role
          } : null
        });
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (session) {
          // Successfully authenticated
          console.log("Authentication successful, refreshing user profile");
          
          // For new sign-ups or oauth logins, ensure they are marked as needing role selection
          if (session.user) {
            console.log("Updating profile for user:", session.user.id);
            
            try {
              // Always update the profile for new social logins to ensure role selection is shown
              const { error: profileError } = await supabase
                .from('profiles')
                .upsert({ 
                  id: session.user.id,
                  is_onboarded: false,  // Set to false to ensure role selection appears
                  role_selection: null,  // Clear any existing role to force selection
                  full_name: session.user.user_metadata?.full_name,
                  avatar_url: session.user.user_metadata?.avatar_url
                });
              
              if (profileError) {
                console.error("Failed to update onboarding status:", profileError);
              } else {
                console.log("User marked as needing role selection");
              }
              
              // Check if visitor role exists
              const { data: existingRole } = await supabase
                .from('user_roles')
                .select('*')
                .eq('user_id', session.user.id)
                .eq('role', 'visitor')
                .single();
              
              if (!existingRole) {
                // Only insert if the role doesn't exist
                const { error: roleError } = await supabase
                  .from('user_roles')
                  .insert({ 
                    user_id: session.user.id,
                    role: 'visitor'
                  });
                  
                if (roleError) {
                  console.error("Failed to set visitor role:", roleError);
                } else {
                  console.log("Visitor role added");
                }
              } else {
                console.log("Visitor role already exists");
              }
            } catch (error) {
              console.error("Error updating user data:", error);
            }
          }
          
          // Refresh user profile to get updated roles and other data
          await refreshUserProfile();
          
          // Show success toast
          toast.success("Successfully signed in!");
          
          // Add a small delay to ensure toast is shown before navigation
          setTimeout(() => {
            navigate("/dashboard", { replace: true });
          }, 500);
        } else {
          // If we get here and there's a hash or query string, we're likely in a callback but authentication failed
          if (window.location.hash || window.location.search) {
            console.error("Auth callback received but no session was created", {
              hash: window.location.hash, 
              search: window.location.search
            });
            throw new Error("Authentication failed. Please try again.");
          } else {
            // If we get here and there's no hash or query, the user probably navigated here directly
            console.warn("Auth callback accessed directly without authentication flow");
            navigate('/login', { replace: true });
          }
        }
      } catch (error: any) {
        console.error("Auth callback error:", error);
        setError(error.message || "Authentication error");
        toast.error(error.message || "Authentication error");
        
        // Redirect to login after error
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 1500);
      } finally {
        setIsProcessing(false);
      }
    };
    
    handleAuthCallback();
  }, [navigate, refreshUserProfile]);

  if (isProcessing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blockloan-blue" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;
