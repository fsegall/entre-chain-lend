import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/UnifiedAuthProvider';
import { supabase } from '@/integrations/supabase/client';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { user, session } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (currentSession) {
          console.log('Auth callback: Session found, navigating to dashboard');
          // Wait a bit to ensure state is updated
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 100);
        } else {
          console.log('Auth callback: No session, navigating to login');
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('Error handling auth callback:', error);
        navigate('/login', { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Completing sign in...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blockloan-teal mx-auto"></div>
      </div>
    </div>
  );
};

export default AuthCallback;
