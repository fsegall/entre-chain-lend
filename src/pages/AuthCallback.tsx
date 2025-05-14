
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
    // Add a guard against multiple callback processing
    const hasProcessed = sessionStorage.getItem("auth_callback_processed");
    
    const handleAuthCallback = async () => {
      try {
        console.log("Auth callback processing started at:", new Date().toISOString());
        console.log("URL hash:", window.location.hash);
        console.log("URL search params:", window.location.search);
        
        // Check if we've already processed this callback to prevent loops
        if (hasProcessed) {
          console.log("Auth callback already processed, avoiding duplicates");
          navigate("/dashboard", { replace: true });
          return;
        }
        
        // Mark this callback as processed to prevent loops
        sessionStorage.setItem("auth_callback_processed", "true");
        
        // First check if we have a valid session to avoid redirect loops
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        console.log("Session check completed", { 
          hasSession: !!sessionData.session,
          sessionError: sessionError ? sessionError.message : null
        });
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (sessionData.session) {
          // Successfully authenticated
          console.log("Authentication successful, refreshing user profile");
          toast.success("Successfully signed in!");
          
          // For new sign-ups or oauth logins, ensure they are marked as needing role selection
          if (sessionData.session.user) {
            // Always update the profile for new social logins to ensure role selection is shown
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert({ 
                id: sessionData.session.user.id,
                is_onboarded: false,  // Set to false to ensure role selection appears
                role_selection: null  // Clear any existing role to force selection
              });
            
            if (profileError) {
              console.warn("Failed to update onboarding status:", profileError);
            } else {
              console.log("User marked as needing role selection");
            }
          }
          
          // Refresh user profile to get updated roles and other data
          await refreshUserProfile();
          
          // Clear any potential state that might cause loops
          sessionStorage.removeItem("supabase.auth.token");
          localStorage.removeItem("supabase.auth.token");
          
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
        
        // Clear any problematic auth state
        sessionStorage.removeItem("supabase.auth.token");
        localStorage.removeItem("supabase.auth.token");
        
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

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4 max-w-md w-full p-8 bg-white rounded-lg shadow-md">
        {error ? (
          <>
            <div className="text-red-500 text-xl">Authentication Error</div>
            <p className="text-center text-gray-700">{error}</p>
            <p className="text-center text-gray-500 text-sm">Redirecting you to the login page...</p>
          </>
        ) : (
          <>
            {isProcessing ? (
              <>
                <Loader2 className="h-16 w-16 animate-spin text-blockloan-blue" />
                <h2 className="text-2xl font-semibold text-blockloan-blue">
                  Completing authentication...
                </h2>
                <p className="text-center text-gray-500">
                  Please wait while we securely sign you in.
                </p>
              </>
            ) : (
              <p className="text-center text-green-500 text-xl">
                Authentication complete! Redirecting...
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
