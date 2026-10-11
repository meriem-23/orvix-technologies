import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { hasSupabase } from "@/lib/env";
import { signingKeyStatus } from "@/lib/license-token";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Health check of the activation service, to open in a browser:
 *   https://<site>/api/licences/status
 * Shows only yes/no answers — never a key or a secret.
 */
export async function GET() {
  const checks: Record<string, string> = {
    supabase: hasSupabase ? "ok" : "absent (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)",
    cle_service_supabase: process.env.SUPABASE_SERVICE_ROLE_KEY ? "ok" : "absente (SUPABASE_SERVICE_ROLE_KEY)",
    cle_signature: ({ ok: "ok", missing: "absente (LICENSE_SIGNING_PRIVATE_KEY)", invalid: "illisible : recopiez la valeur exacte", mismatch: "ne correspond pas à la clé publique des logiciels" } as const)[signingKeyStatus()],
    base_activation: "non testée",
  };
  if (hasSupabase && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const admin = createAdminClient();
      const t = await admin.from("license_activations").select("id", { count: "exact", head: true });
      const f = await admin.rpc("hit_rate_limit", { p_bucket: "status-check", p_max: 1000, p_window_seconds: 60 });
      checks.base_activation = t.error ? "table license_activations absente : relancez supabase/schema.sql" : f.error ? "fonctions absentes : relancez supabase/schema.sql" : "ok";
    } catch {
      checks.base_activation = "connexion impossible";
    }
  }
  const ok = Object.values(checks).every((v) => v === "ok");
  return NextResponse.json({ service: "Activation Orvix", pret: ok, ...checks }, { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } });
}
