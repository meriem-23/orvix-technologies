// Centralised env access. `hasSupabase` lets the public pages render a preview
// with the built-in catalogue before Supabase is configured.
export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

export const hasSupabase = Boolean(env.supabaseUrl && env.supabaseAnonKey);

export function serviceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY manquante (serveur uniquement).");
  return key;
}
