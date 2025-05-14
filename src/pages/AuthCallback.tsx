
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("Auth callback initiated", { search: location.search });
        
        // Parse the redirectTo parameter from the URL if available
        const params = new URLSearchParams(location.search);
        const redirectTo = params.get('redirectTo') || '/dashboard';
        
        console.log("Redirect target:", redirectTo);
        
        // Check if we have a valid session
        const { data, error } = await supabase.auth.getSession();
        
        console.log("Session check result:", { 
          hasSession: !!data.session,
          error: error ? error.message : null
        });
        
        if (error) {
          throw error;
        }
        
        if (data.session) {
          // Successfully authenticated
          console.log("Authentication successful, redirecting to:", redirectTo);
          toast.success("Successfully signed in!");
          
          // Add a small delay to ensure toast is shown before navigation
          setTimeout(() => {
            navigate(redirectTo, { replace: true });
          }, 500);
        } else {
          // No session found - this could happen if the callback URL was accessed directly
          console.error("No session found in auth callback");
          toast.error("Authentication failed. Please try again.");
          navigate('/login', { replace: true });
        }
      } catch (error: any) {
        console.error("Auth callback error:", error);
        setError(error.message || "Authentication error");
        toast.error(error.message || "Authentication error");
        
        // Still redirect to login after error
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 1000);
      }
    };
    
    checkSession();
  }, [navigate, location.search]);

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
            <Loader2 className="h-16 w-16 animate-spin text-blockloan-blue" />
            <h2 className="text-2xl font-semibold text-blockloan-blue">
              Completing authentication...
            </h2>
            <p className="text-center text-gray-500">
              Please wait while we securely sign you in.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
