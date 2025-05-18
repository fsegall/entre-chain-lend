// src/hooks/auth/utils.ts
import { Session, User } from "@supabase/supabase-js";
import { AuthUser } from "./types";

export function formatUser(user: User, session: Session): AuthUser {
  return {
    ...user,
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  };
}
