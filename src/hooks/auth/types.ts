
import { Session, User } from "@supabase/supabase-js";

export type AuthUser = {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  is_onboarded?: boolean;
  role_selection?: string;
  roles?: string[];
  wallet_address?: string;
};

export type AuthContextType = {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  setUserRole: (role: 'borrower' | 'lender') => Promise<void>;
  connectWallet: (address: string) => Promise<void>;
};
