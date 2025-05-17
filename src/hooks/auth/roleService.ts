import { supabase } from "@/integrations/supabase/client";

type AppRole = 'admin' | 'moderator' | 'lender' | 'borrower' | 'visitor';

export const setUserRole = async (userId: string, role: 'borrower' | 'lender') => {
  try {
    // First, ensure we have a valid session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("You must be logged in to set a role");
    }

    // Verify the user is setting their own role
    if (session.user.id !== userId) {
      throw new Error("You can only set roles for your own account");
    }

    // Update the profile with the selected role
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        role_selection: role,
        is_onboarded: true
      })
      .eq('id', userId);
      
    if (updateError) throw updateError;
    
    // Remove any existing lender/borrower roles
    const { error: deleteError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .in('role', ['lender', 'borrower']);
    
    if (deleteError) throw deleteError;
    
    // Insert the new role
    const { error: insertError } = await supabase
      .from('user_roles')
      .insert({ 
        user_id: userId,
        role: role as AppRole
      });
    
    if (insertError) {
      console.error("Error inserting role:", insertError);
      throw new Error("Failed to set role. Please try again.");
    }
    
    return true;
  } catch (error) {
    console.error("Role selection error:", error);
    throw error;
  }
};

export const connectWallet = async (userId: string, address: string) => {
  try {
    // First, ensure we have a valid session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("You must be logged in to connect a wallet");
    }

    // Verify the user is updating their own profile
    if (session.user.id !== userId) {
      throw new Error("You can only update your own profile");
    }

    // If address is empty, we're disconnecting
    if (!address) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ wallet_address: null })
        .eq('id', userId);
        
      if (updateError) throw updateError;
      return true;
    }

    // Check if the wallet is already connected to another account
    const { data: existingWallet, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('wallet_address', address)
      .neq('id', userId)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking wallet address:", checkError);
      throw new Error("Failed to verify wallet address");
    }

    if (existingWallet) {
      throw new Error("This wallet is already connected to another account");
    }

    // Update the wallet address
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ wallet_address: address })
      .eq('id', userId);

    if (updateError) throw updateError;
    return true;
  } catch (error) {
    console.error("Wallet connection error:", error);
    throw error;
  }
};
