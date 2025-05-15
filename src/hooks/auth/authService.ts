import { supabase } from "@/integrations/supabase/client";
import { formatUser } from "./utils";

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  // After successful sign in, ensure the user has a visitor role
  if (data.user) {
    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert({ 
        user_id: data.user.id,
        role: 'visitor'
      });
      
    if (roleError) {
      console.error("Failed to set visitor role:", roleError);
    }
  }

  return {
    session: data.session,
    user: formatUser(data.user, data.session)
  };
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
