import { User } from "@supabase/supabase-js";
import { AuthUser } from "./types";

// Format Supabase user data to match our AuthUser type
export const formatUser = (user: User | null, session: any): any => {
  if (!user) return null;

  console.log("Formatting user:", {
    id: user.id,
    email: user.email,
    metadata: user.user_metadata
  });

  return {
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
    avatar_url: user.user_metadata?.avatar_url,
    wallet_address: user.user_metadata?.wallet_address,
    role_selection: user.user_metadata?.role_selection,
    is_onboarded: user.user_metadata?.is_onboarded || false,
    roles: user.user_metadata?.roles || []
  };
};
