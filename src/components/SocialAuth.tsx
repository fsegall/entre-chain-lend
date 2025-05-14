
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface SocialAuthProps {
  redirectTo?: string;
}

const SocialAuth = ({ redirectTo = "/dashboard" }: SocialAuthProps) => {
  const [isLoading, setIsLoading] = useState<{
    google?: boolean;
    twitter?: boolean;
  }>({});
  const navigate = useNavigate();

  // Handle auth state change from redirects
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        toast.success("Successfully signed in!");
        navigate(redirectTo);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, redirectTo]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading((prev) => ({ ...prev, google: true }));
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth-callback`,
        },
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in with Google");
      console.error("Google sign-in error:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, google: false }));
    }
  };

  const handleTwitterSignIn = async () => {
    try {
      setIsLoading((prev) => ({ ...prev, twitter: true }));
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: `${window.location.origin}/auth-callback`,
        },
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in with X/Twitter");
      console.error("Twitter sign-in error:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, twitter: false }));
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          type="button"
          disabled={isLoading.google}
          onClick={handleGoogleSignIn}
          className="flex items-center justify-center gap-2"
        >
          {isLoading.google ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          Google
        </Button>

        <Button
          variant="outline"
          type="button"
          disabled={isLoading.twitter}
          onClick={handleTwitterSignIn}
          className="flex items-center justify-center gap-2"
        >
          {isLoading.twitter ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          )}
          X / Twitter
        </Button>
      </div>
    </div>
  );
};

export default SocialAuth;
