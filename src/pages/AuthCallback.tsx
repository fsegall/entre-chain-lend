
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if we have a session
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      
      // Parse the redirectTo parameter from the URL if available
      const params = new URLSearchParams(location.search);
      const redirectTo = params.get('redirectTo') || '/dashboard';
      
      // If we have a session, redirect to the specified path or dashboard
      if (data.session) {
        navigate(redirectTo, { replace: true });
      } else {
        // If no session, redirect to login
        navigate('/login', { replace: true });
      }
    };
    
    checkSession();
  }, [navigate, location.search]);

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-16 w-16 animate-spin text-blockloan-blue" />
        <h2 className="text-2xl font-semibold text-blockloan-blue">
          Completing authentication...
        </h2>
      </div>
    </div>
  );
};

export default AuthCallback;
