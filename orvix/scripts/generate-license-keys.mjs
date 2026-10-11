// Generates the Ed25519 key pair used to sign software activation tokens.
//   node scripts/generate-license-keys.mjs
// - PRIVATE key → Vercel env var LICENSE_SIGNING_PRIVATE_KEY (keep it secret)
// - PUBLIC key  → the desktop apps (electron/config.ts → LICENSE_PUBLIC_KEY)
import { generateKeyPairSync } from "crypto";

const { privateKey, publicKey } = generateKeyPairSync("ed25519");
const priv = privateKey.export({ format: "der", type: "pkcs8" }).toString("base64");
const pub = publicKey.export({ format: "der", type: "spki" }).toString("base64");

console.log("\nLICENSE_SIGNING_PRIVATE_KEY (Vercel, secret):\n" + priv);
console.log("\nLICENSE_PUBLIC_KEY (desktop apps, public):\n" + pub + "\n");
