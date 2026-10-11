import "server-only";
import { createPrivateKey, createPublicKey, sign } from "crypto";

/**
 * Activation tokens for the Orvix desktop software.
 * Format: base64url(JSON payload) + "." + base64url(Ed25519 signature)
 * The desktop app holds only the PUBLIC key, so it can verify a token offline
 * but can never forge one.
 */
export type LicenseTokenPayload = {
  v: 1;
  lid: string;              // licence id
  key: string;              // masked key, for display only (ORVX-ABCD-••••…)
  product: string;          // product slug, e.g. "restaurant"
  device: string;           // sha256 device fingerprint
  holder: string;           // client / company name
  max_devices: number;
  license_expires_at: string | null;
  iat: string;              // issued at
  refresh_after: string;    // app should re-check online after this date
  valid_until: string;      // app stops working after this date without a refresh
};

const REFRESH_DAYS = 7;
const OFFLINE_GRACE_DAYS = 45;

/**
 * PUBLIC key built into every Orvix desktop app (electron/config.ts).
 * The private key in Vercel must be its pair, otherwise the apps reject the activation.
 */
export const APPS_PUBLIC_KEY = "MCowBQYDK2VwAyEATcLfCDyIG93ImKL2ffLT48GwpXc0O31LGHZ6De6VXPg=";

/**
 * Reads LICENSE_SIGNING_PRIVATE_KEY and tolerates common paste mistakes
 * (quotes, spaces, line breaks, "Value :" or "NAME=" in front): an Ed25519
 * PKCS#8 key in base64 always starts with "MC4C".
 */
function rawKey(): string | null {
  const v = process.env.LICENSE_SIGNING_PRIVATE_KEY;
  if (!v) return null;
  const compact = v.replace(/\s+/g, "");
  const m = compact.match(/MC4C[A-Za-z0-9+/]+={0,2}/);
  return m ? m[0] : compact;
}

function privateKey() {
  const b64 = rawKey();
  if (!b64) throw new Error("LICENSE_SIGNING_PRIVATE_KEY manquante");
  return createPrivateKey({ key: Buffer.from(b64, "base64"), format: "der", type: "pkcs8" });
}

export function hasSigningKey() {
  return Boolean(rawKey());
}

/** "ok" only when the key is readable AND matches the public key inside the apps. */
export function signingKeyStatus(): "missing" | "invalid" | "mismatch" | "ok" {
  if (!rawKey()) return "missing";
  try {
    const pub = createPublicKey(privateKey()).export({ format: "der", type: "spki" }).toString("base64");
    return pub === APPS_PUBLIC_KEY ? "ok" : "mismatch";
  } catch {
    return "invalid";
  }
}

export function maskKey(key: string) {
  return key.split("-").map((g, i) => (i < 2 ? g : "••••")).join("-");
}

export function issueToken(input: {
  licenseId: string; key: string; product: string; device: string; holder: string;
  maxDevices: number; licenseExpiresAt: string | null;
}): { token: string; payload: LicenseTokenPayload } {
  const now = Date.now();
  const day = 86_400_000;
  const graceEnd = now + OFFLINE_GRACE_DAYS * day;
  const licEnd = input.licenseExpiresAt ? Date.parse(input.licenseExpiresAt) : Infinity;
  const payload: LicenseTokenPayload = {
    v: 1,
    lid: input.licenseId,
    key: maskKey(input.key),
    product: input.product,
    device: input.device,
    holder: input.holder,
    max_devices: input.maxDevices,
    license_expires_at: input.licenseExpiresAt,
    iat: new Date(now).toISOString(),
    refresh_after: new Date(Math.min(now + REFRESH_DAYS * day, licEnd)).toISOString(),
    valid_until: new Date(Math.min(graceEnd, licEnd)).toISOString(),
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = sign(null, Buffer.from(body), privateKey()).toString("base64url");
  return { token: `${body}.${sig}`, payload };
}
