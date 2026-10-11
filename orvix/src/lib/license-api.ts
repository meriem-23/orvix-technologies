import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { issueToken, signingKeyStatus } from "@/lib/license-token";
import { hasSupabase } from "@/lib/env";
import { rateLimit } from "@/lib/security";

const bodySchema = z.object({
  key: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{2,8}(-[0-9A-Z]{4}){4}$/),
  product: z.string().trim().regex(/^[a-z0-9-]{2,60}$/),
  device: z.string().regex(/^[a-f0-9]{64}$/),
  device_name: z.string().trim().max(80).default(""),
  app_version: z.string().trim().max(20).default(""),
});

// Messages shown as-is in the desktop app.
const MESSAGES: Record<string, { status: number; message: string }> = {
  not_found: { status: 404, message: "Cette clé de licence n'existe pas. Vérifiez la saisie." },
  wrong_product: { status: 403, message: "Cette clé n'est pas valable pour ce logiciel." },
  suspended: { status: 403, message: "Cette licence est suspendue. Contactez Orvix Technologies." },
  expired: { status: 403, message: "Cette licence a expiré. Contactez Orvix Technologies pour la renouveler." },
  device_limit: { status: 409, message: "Le nombre maximum de postes est atteint pour cette licence." },
  not_activated: { status: 403, message: "Ce poste n'est plus activé. Saisissez à nouveau votre clé." },
};

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

const CONFIG: Record<string, string> = {
  supabase: "Serveur Orvix mal configuré (Supabase). Contactez Orvix Technologies.",
  service_role: "Serveur Orvix mal configuré (clé service Supabase absente). Contactez Orvix Technologies.",
  missing: "Serveur Orvix mal configuré (clé de signature absente). Contactez Orvix Technologies.",
  invalid: "Serveur Orvix mal configuré (clé de signature illisible). Contactez Orvix Technologies.",
  mismatch: "Serveur Orvix mal configuré (clé de signature différente de celle des logiciels). Contactez Orvix Technologies.",
};

/** Always answers JSON with a readable message, even when something unexpected breaks. */
export async function handleLicenseRequest(request: NextRequest, register: boolean) {
  try {
    return await handle(request, register);
  } catch (e) {
    console.error("[licence] erreur inattendue", e instanceof Error ? e.message : e);
    return json({ ok: false, code: "server", message: "Erreur du serveur d'activation. Réessayez dans quelques minutes ou contactez Orvix Technologies." }, 500);
  }
}

async function handle(request: NextRequest, register: boolean) {
  const problem = !hasSupabase ? "supabase" : !process.env.SUPABASE_SERVICE_ROLE_KEY ? "service_role" : signingKeyStatus();
  if (problem !== "ok") {
    console.error("[licence] configuration :", problem);
    return json({ ok: false, code: `config_${problem}`, message: CONFIG[problem] }, 503);
  }

  const ip = request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!(await rateLimit(`activate:${ip}`, register ? 15 : 60, 3600)))
    return json({ ok: false, code: "rate_limited", message: "Trop de tentatives. Réessayez dans une heure." }, 429);

  let raw: unknown;
  try { raw = await request.json(); } catch { raw = null; }
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) return json({ ok: false, code: "invalid", message: "Clé de licence mal formée." }, 400);
  const b = parsed.data;

  // Per-key limit too, so a single key can't be brute-forced across many IPs.
  if (!(await rateLimit(`activate-key:${b.key}`, register ? 10 : 60, 3600)))
    return json({ ok: false, code: "rate_limited", message: "Trop de tentatives pour cette clé. Réessayez dans une heure." }, 429);

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("activate_license", {
    p_key: b.key, p_product_slug: b.product, p_device: b.device,
    p_device_name: b.device_name, p_app_version: b.app_version, p_register: register,
  });
  if (error) {
    console.error("[licence]", error.message);
    return json({ ok: false, code: "server_db", message: "Service d'activation indisponible (base de données). Contactez Orvix Technologies." }, 503);
  }
  const row = (Array.isArray(data) ? data[0] : data) as
    | { result: string; license_id: string; holder: string; max_devices: number; expires_at: string | null; used_devices: number }
    | undefined;
  if (!row) return json({ ok: false, code: "server", message: "Service d'activation indisponible." }, 503);

  if (row.result !== "ok") {
    const m = MESSAGES[row.result] ?? { status: 403, message: "Activation refusée." };
    return json({ ok: false, code: row.result, message: m.message }, m.status);
  }

  const { token, payload } = issueToken({
    licenseId: row.license_id, key: b.key, product: b.product, device: b.device,
    holder: row.holder ?? "", maxDevices: row.max_devices, licenseExpiresAt: row.expires_at,
  });
  return json({ ok: true, token, license: payload, used_devices: row.used_devices });
}
