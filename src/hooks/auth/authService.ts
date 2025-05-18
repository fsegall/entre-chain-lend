import { supabase } from "@/integrations/supabase/client";

export async function signInWithEmail(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
  if (error) throw error;
}

export async function signInWithGithub() {
  const { error } = await supabase.auth.signInWithOAuth({ provider: "github" });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function signUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;

  const userId = data.user?.id;

  if (!userId) throw new Error("User ID não disponível após signUp.");

  // Verificar se perfil já existe
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (!existingProfile) {
    // Tentar inserir o perfil
    const { error: profileError } = await supabase
      .from("profiles")
      .insert([{ id: userId, full_name: fullName }]);

    if (profileError) throw profileError;
  }

  return { userId };
}
