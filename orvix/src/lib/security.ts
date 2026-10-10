import "server-only";
import { headers } from "next/headers";
import { randomBytes } from "crypto";
import { createAdminClient } from "@/lib/supabase/server";
import { SITE } from "@/lib/site";

export async function clientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-real-ip") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

/**
 * Fixed-window rate limit stored in Postgres (works on serverless).
 * Returns true when the action is allowed.
 */
export async function rateLimit(bucket: string, max: number, windowSeconds: number): Promise<boolean> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("hit_rate_limit", {
      p_bucket: bucket,
      p_max: max,
      p_window_seconds: windowSeconds,
    });
    if (error) return true; // never lock everyone out because of a DB hiccup
    return data === true;
  } catch {
    return true;
  }
}

// Crockford base32 without I, L, O, U: easy to read over the phone.
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/** ORVX-7KQ2-M9XD-4TRP-HB3N — 80 bits of randomness from the OS CSPRNG. */
export function generateLicenseKey(): string {
  const bytes = randomBytes(16);
  let chars = "";
  for (let i = 0; i < 16; i++) chars += ALPHABET[bytes[i] & 31];
  return [SITE.licensePrefix, chars.slice(0, 4), chars.slice(4, 8), chars.slice(8, 12), chars.slice(12, 16)].join("-");
}

/** Only allow redirects to paths on this site (prevents open redirects). */
export function safeNext(next: unknown, fallback = "/espace"): string {
  if (typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
