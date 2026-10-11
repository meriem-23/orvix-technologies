"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { rateLimit } from "@/lib/security";
import { fieldErrors, messageSchema, profileSchema, ticketSchema } from "@/lib/validation";
import type { ActionState } from "@/lib/types";

export async function createTicket(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { user } = await requireUser();
  const parsed = ticketSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Vérifiez les champs en rouge.", fieldErrors: fieldErrors(parsed.error) };
  if (!(await rateLimit(`ticket:${user.id}`, 10, 3600))) return { error: "Vous avez ouvert beaucoup de tickets en peu de temps. Réessayez dans une heure." };

  const { body, product_id, ...rest } = parsed.data;
  const supabase = await createClient();
  const { data: ticket, error } = await supabase
    .from("tickets")
    .insert({ ...rest, product_id: product_id || null, user_id: user.id })
    .select("id")
    .single();
  if (error || !ticket) return { error: "Le ticket n'a pas pu être créé." };

  const { error: msgErr } = await supabase.from("ticket_messages").insert({ ticket_id: ticket.id, author_id: user.id, body });
  if (msgErr) return { error: "Le ticket est créé mais le message n'a pas pu être ajouté." };

  revalidatePath("/espace/support");
  redirect(`/espace/support/${ticket.id}`);
}

/** Used by both clients and admins; RLS + trigger decide what is allowed and set is_staff. */
export async function replyTicket(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { user } = await requireUser();
  const parsed = messageSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (!(await rateLimit(`reply:${user.id}`, 40, 3600))) return { error: "Trop de messages envoyés. Patientez un moment." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("ticket_messages")
    .insert({ ticket_id: parsed.data.ticket_id, author_id: user.id, body: parsed.data.body });
  if (error) return { error: "Message refusé : le ticket est peut-être fermé." };

  revalidatePath(`/espace/support/${parsed.data.ticket_id}`);
  revalidatePath(`/admin/support/${parsed.data.ticket_id}`);
  return { ok: true, message: "Message envoyé." };
}

export async function updateProfile(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { user } = await requireUser();
  const parsed = profileSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Vérifiez les champs en rouge.", fieldErrors: fieldErrors(parsed.error) };
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update(parsed.data).eq("id", user.id);
  if (error) return { error: "Le profil n'a pas pu être enregistré." };
  revalidatePath("/espace", "layout");
  return { ok: true, message: "Profil enregistré." };
}
