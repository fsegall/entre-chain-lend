
import { User, Session } from "@supabase/supabase-js";
import { AuthUser } from "./types";

// Format Supabase user data to match our AuthUser type
export const formatUser = (user: User | null, session: Session | null): AuthUser | null => {
  if (!user) return null;
  
  return {
    id: user.id,
    email: user.email || '',
    full_name: user.user_metadata?.full_name,
    avatar_url: user.user_metadata?.avatar_url,
    wallet_address: user.user_metadata?.wallet_address,
  };
};
