import { supabase } from "@/integrations/supabase/client";
import { formatUser } from "./utils";
import { toast } from "sonner";

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // After successful sign in, ensure the user has a visitor role
    if (data.user) {
      try {
        // First check if the role already exists
        const { data: existingRole } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', data.user.id)
          .eq('role', 'visitor')
          .single();

        if (!existingRole) {
          // Only insert if the role doesn't exist
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({ 
              user_id: data.user.id,
              role: 'visitor'
            });
            
          if (roleError) {
            console.error("Failed to set visitor role:", roleError);
          }
        }
      } catch (roleError) {
        console.error("Error setting visitor role:", roleError);
      }
    }

    return {
      session: data.session,
      user: formatUser(data.user, data.session)
    };
  } catch (error: any) {
    console.error("Sign in error:", error);
    toast.error(error.message || "Failed to sign in. Please check your credentials.");
    throw error;
  }
};

export const signUp = async (email: string, password: string, fullName: string) => {
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

  return {
    session: data.session,
    user: data.user ? formatUser(data.user, data.session) : null
  };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentSession = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session;
};
