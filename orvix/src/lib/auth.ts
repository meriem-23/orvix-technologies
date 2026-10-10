import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabase } from "@/lib/env";
import type { Profile } from "@/lib/types";

/** Current user + profile, verified with Supabase Auth (getUser, not getSession). */
export const getCurrentUser = cache(async () => {
  if (!hasSupabase) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single<Profile>();
  if (!profile) return null;
  return { user: data.user, profile };
});

export async function requireUser() {
  const current = await getCurrentUser();
  if (!current) redirect("/connexion");
  if (current.profile.is_blocked) redirect("/connexion?blocked=1");
  return current;
}

export type MfaState = "ok" | "enroll" | "verify";

/** Admins must use an authenticator app (AAL2). The database enforces it too (is_admin()). */
export async function adminMfaState(): Promise<MfaState> {
  const supabase = await createClient();
  const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (!data) return "enroll";
  if (data.currentLevel === "aal2") return "ok";
  if (data.nextLevel === "aal2") return "verify";
  return "enroll";
}

/**
 * Gate for every admin page AND every admin server action.
 * The database enforces the same rule again through RLS (is_admin()).
 */
export async function requireAdmin(opts: { allowMfaSetup?: boolean } = {}) {
  const current = await requireUser();
  if (current.profile.role !== "admin") redirect("/espace");
  if (!opts.allowMfaSetup) {
    const state = await adminMfaState();
    if (state !== "ok") redirect("/admin/securite");
  }
  return current;
}
