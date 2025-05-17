import { Session } from "@supabase/supabase-js";

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  wallet_address?: string;
  role_selection?: 'borrower' | 'lender';
  is_onboarded?: boolean;
  roles?: string[];
}

export interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
}
