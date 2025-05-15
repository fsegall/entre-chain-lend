
import { supabase } from "@/integrations/supabase/client";

export const setUserRole = async (userId: string, role: 'borrower' | 'lender') => {
  try {
    // Update the profile with the selected role
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role_selection: role })
      .eq('id', userId);
      
    if (updateError) throw updateError;
    
    // Check if the role already exists for this user before inserting
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', role)
      .maybeSingle();
    
    // Only insert if the role doesn't already exist
    if (!existingRole) {
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ 
          user_id: userId,
          role: role
        });
      
      if (insertError) throw insertError;
    }
    
    return true;
  } catch (error) {
    console.error("Role selection error:", error);
    throw error;
  }
};

export const connectWallet = async (userId: string, address: string) => {
  try {
    // Update the user metadata with the wallet address
    const { error } = await supabase.auth.updateUser({
      data: { wallet_address: address }
    });
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Wallet connection error:", error);
    throw error;
  }
};
