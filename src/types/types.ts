// src/hooks/auth/types.ts
import { Session, User } from "@supabase/supabase-js";

export interface AuthUser extends User {
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  [key: string]: any;
}

export interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
}
