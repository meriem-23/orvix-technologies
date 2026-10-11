"use server";
import { revalidatePath } from "next/cache";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { hasSupabase } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/security";
import { fieldErrors, requestSchema } from "@/lib/validation";
import type { ActionState } from "@/lib/types";

export async function submitRequest(_prev: ActionState, form: FormData): Promise<ActionState> {
  // Bots fill the hidden field; pretend success and drop it.
  if (form.get("website")) return { ok: true, message: "Merci, votre demande a été envoyée." };

  const parsed = requestSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Vérifiez les champs en rouge.", fieldErrors: fieldErrors(parsed.error) };
  if (!hasSupabase) return { error: "Le site n'est pas encore relié à la base de données." };

  const ip = await clientIp();
  if (!(await rateLimit(`request:${ip}`, 5, 3600)))
    return { error: "Trop de demandes envoyées depuis votre connexion. Réessayez dans une heure, ou écrivez-nous sur WhatsApp." };

  const { product, ...data } = parsed.data;
  const admin = createAdminClient();
  let product_id: string | null = null;
  if (product) {
    const { data: row } = await admin.from("products").select("id").eq("slug", product).eq("is_published", true).maybeSingle();
    product_id = row?.id ?? null;
  }

  const current = await getCurrentUser();
  const row = { ...data, product_id, user_id: current?.user.id ?? null };

  // Signed-in users insert through RLS; visitors through the server after validation + rate limit.
  const client = current ? await createClient() : admin;
  const { error } = await client.from("requests").insert(row);
  if (error) return { error: "La demande n'a pas pu être enregistrée. Réessayez dans un instant." };

  if (current) revalidatePath("/espace/demandes");
  return { ok: true, message: "Demande envoyée. Nous vous recontactons très vite, en général dans la journée." };
}
