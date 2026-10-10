import { z } from "zod";

const text = (max: number) => z.string().trim().max(max, `${max} caractères maximum`);
const phone = z
  .string()
  .trim()
  .max(30)
  .regex(/^[+0-9 ().-]*$/, "Numéro invalide");

export const passwordSchema = z
  .string()
  .min(10, "10 caractères minimum")
  .max(128)
  .regex(/[a-z]/, "Ajoutez une minuscule")
  .regex(/[A-Z]/, "Ajoutez une majuscule")
  .regex(/[0-9]/, "Ajoutez un chiffre");

export const signupSchema = z.object({
  full_name: text(120).min(2, "Indiquez votre nom"),
  email: z.string().trim().toLowerCase().email("Adresse e-mail invalide").max(200),
  phone: phone.min(9, "Indiquez votre téléphone"),
  company: text(120),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Adresse e-mail invalide").max(200),
  password: z.string().min(1, "Mot de passe requis").max(128),
});

export const requestSchema = z.object({
  kind: z.enum(["demo", "achat", "sur_mesure", "contact"]),
  product: z.string().trim().regex(/^[a-z0-9-]{0,60}$/).optional(),
  name: text(120).min(2, "Indiquez votre nom"),
  email: z.string().trim().toLowerCase().email("Adresse e-mail invalide").max(200),
  phone: phone,
  company: text(120),
  budget: text(60),
  message: text(4000).min(10, "Décrivez votre besoin en quelques mots"),
});

export const ticketSchema = z.object({
  subject: text(160).min(4, "Sujet trop court"),
  product_id: z.string().uuid().optional().or(z.literal("")),
  priority: z.enum(["basse", "normale", "urgente"]),
  body: text(5000).min(10, "Décrivez le problème"),
});

export const messageSchema = z.object({
  ticket_id: z.string().uuid(),
  body: text(5000).min(1, "Message vide"),
});

export const productSchema = z.object({
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]{2,60}$/, "Lettres minuscules, chiffres et tirets"),
  name: text(80).min(2),
  category: z.enum(["sante", "commerce", "services", "agences"]),
  tagline: text(140),
  description: text(2000),
  features: text(3000),
  modules: text(600),
  platforms: text(200),
  price_dzd: z.string().trim().regex(/^\d*$/, "Nombre entier en DA").max(10),
  pricing_model: z.enum(["licence", "abonnement", "devis"]),
  sort_order: z.coerce.number().int().min(0).max(9999),
  is_published: z.boolean(),
});

export const licenseSchema = z.object({
  user_id: z.string().uuid("Choisissez un client"),
  product_id: z.string().uuid("Choisissez un logiciel"),
  max_devices: z.coerce.number().int().min(1).max(100),
  expires_at: z.string().trim().regex(/^(\d{4}-\d{2}-\d{2})?$/),
  notes: text(500),
});

export const profileSchema = z.object({
  full_name: text(120).min(2, "Indiquez votre nom"),
  phone: phone,
  company: text(120),
  wilaya: text(60),
});

export function lines(s: string) {
  return s.split("\n").map((l) => l.trim()).filter(Boolean);
}

export function fieldErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const k = String(issue.path[0] ?? "form");
    if (!out[k]) out[k] = issue.message;
  }
  return out;
}
