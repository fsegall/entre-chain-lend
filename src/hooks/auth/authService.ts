import { supabase } from "@/integrations/supabase/client";
import { formatUser } from "./utils";

export const signIn = async (email: string, password: string) => {
  console.log("authService: Starting sign in");
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

    console.log("authService: Sign in successful");
    return {
      session: data.session,
      user: formatUser(data.user, data.session)
    };
  } catch (error: any) {
    console.error("authService: Sign in error:", error);
    throw error;
  }
};

export const signUp = async (email: string, password: string, fullName: string) => {
  console.log("authService: Starting sign up");
  try {
    console.log('Starting sign up process...');
    
    // Create the auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    console.log('Auth sign up response:', { data, error });

    if (error) throw error;
    if (!data.user) throw new Error("No user returned from sign up");

    console.log('Creating profile for user:', data.user.id);

    // Create the profile using the service role
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ 
        id: data.user.id,
        full_name: fullName
      })
      .select()
      .single();

    console.log('Profile creation response:', { profileError });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // Try to get the profile to see if it was created by the trigger
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (!existingProfile) {
        throw new Error("Failed to create user profile");
      }
    }

    console.log("authService: Sign up successful");
    return {
      session: data.session,
      user: formatUser(data.user, data.session)
    };
  } catch (error: any) {
    console.error("authService: Sign up error:", error);
    throw error;
  }
};

export const signOut = async () => {
  console.log("authService: Starting sign out");
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error("authService: Sign out error:", error);
    throw error;
  }
  
  console.log("authService: Sign out successful");
};

export const getCurrentSession = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session;
};

export const connectWallet = async (address: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No active session found');
    }

    // Update user's wallet address in the database
    const { error } = await supabase
      .from('profiles')
      .update({ wallet_address: address })
      .eq('id', session.user.id);

    if (error) throw error;
  } catch (error: any) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
};

export const disconnectWallet = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No active session found');
    }

    // Remove wallet address from user's profile
    const { error } = await supabase
      .from('profiles')
      .update({ wallet_address: null })
      .eq('id', session.user.id);

    if (error) throw error;
  } catch (error: any) {
    console.error('Error disconnecting wallet:', error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
};

export const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  if (error) throw error;
};

export const signInWithGithub = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  if (error) throw error;
};
