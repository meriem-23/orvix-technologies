"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { env, hasSupabase } from "@/lib/env";
import { clientIp, rateLimit, safeNext } from "@/lib/security";
import { fieldErrors, loginSchema, passwordSchema, signupSchema } from "@/lib/validation";
import type { ActionState } from "@/lib/types";

const NOT_READY: ActionState = { error: "Le site n'est pas encore relié à la base de données." };

export async function signUp(_prev: ActionState, form: FormData): Promise<ActionState> {
  if (form.get("website")) return { ok: true, message: "Compte créé. Vérifiez votre boîte e-mail." };
  const parsed = signupSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Vérifiez les champs en rouge.", fieldErrors: fieldErrors(parsed.error) };
  if (!hasSupabase) return NOT_READY;

  const ip = await clientIp();
  if (!(await rateLimit(`signup:${ip}`, 5, 3600))) return { error: "Trop de créations de compte depuis votre connexion. Réessayez plus tard." };

  const { email, password, ...meta } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: meta, emailRedirectTo: `${env.siteUrl}/auth/callback?next=/espace` },
  });
  if (error) {
    // Visible in Vercel → Logs, to diagnose Supabase configuration problems.
    console.error("[signup]", error.status, error.code, error.message);
    switch (error.code) {
      case "user_already_exists":
      case "email_exists":
        break; // same answer as success: no account enumeration
      case "weak_password":
        return { error: "Mot de passe refusé : choisissez un mot de passe plus long et plus varié.", fieldErrors: { password: "Mot de passe trop faible" } };
      case "email_address_invalid":
      case "email_address_not_authorized":
        return { error: "Les inscriptions ne sont pas encore ouvertes pour cette adresse e-mail. Contactez-nous sur WhatsApp." };
      case "over_email_send_rate_limit":
      case "over_request_rate_limit":
        return { error: "Trop d'inscriptions en ce moment. Réessayez dans une heure, ou contactez-nous sur WhatsApp." };
      case "signup_disabled":
        return { error: "Les inscriptions sont fermées pour le moment." };
      default:
        return { error: "Le compte n'a pas pu être créé. Réessayez dans un instant." };
    }
  }

  // Same answer whether or not the address already exists (no account enumeration).
  return { ok: true, message: `Compte créé. Ouvrez l'e-mail envoyé à ${email} pour confirmer votre adresse, puis connectez-vous.` };
}

export async function signIn(_prev: ActionState, form: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Vérifiez les champs en rouge.", fieldErrors: fieldErrors(parsed.error) };
  if (!hasSupabase) return NOT_READY;

  const { email, password } = parsed.data;
  const ip = await clientIp();
  const allowed = (await rateLimit(`login-ip:${ip}`, 20, 900)) && (await rateLimit(`login-mail:${email}`, 8, 900));
  if (!allowed) return { error: "Trop de tentatives. Patientez 15 minutes avant de réessayer." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    if (error?.code === "email_not_confirmed") return { error: "Confirmez d'abord votre adresse avec le lien reçu par e-mail." };
    return { error: "E-mail ou mot de passe incorrect." };
  }

  const { data: profile } = await supabase.from("profiles").select("role,is_blocked").eq("id", data.user.id).single();
  if (!profile || profile.is_blocked) {
    await supabase.auth.signOut();
    return { error: "Ce compte est désactivé. Contactez-nous pour le réactiver." };
  }

  redirect(profile.role === "admin" ? "/admin" : safeNext(form.get("next")));
}

export async function signOut() {
  if (hasSupabase) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/connexion");
}

export async function forgotPassword(_prev: ActionState, form: FormData): Promise<ActionState> {
  const email = z.string().trim().toLowerCase().email().safeParse(form.get("email"));
  if (!email.success) return { error: "Adresse e-mail invalide.", fieldErrors: { email: "Adresse e-mail invalide" } };
  if (!hasSupabase) return NOT_READY;

  const ip = await clientIp();
  if (await rateLimit(`reset:${ip}`, 5, 3600)) {
    const supabase = await createClient();
    await supabase.auth.resetPasswordForEmail(email.data, {
      redirectTo: `${env.siteUrl}/auth/callback?next=/nouveau-mot-de-passe`,
    });
  }
  return { ok: true, message: "Si un compte existe avec cette adresse, un lien de réinitialisation vient d'être envoyé." };
}

export async function updatePassword(_prev: ActionState, form: FormData): Promise<ActionState> {
  const pw = passwordSchema.safeParse(form.get("password"));
  if (!pw.success) return { error: "Mot de passe trop faible.", fieldErrors: { password: pw.error.issues[0].message } };
  if (form.get("password") !== form.get("confirm")) return { error: "Les deux mots de passe sont différents.", fieldErrors: { confirm: "Différent du premier" } };
  if (!hasSupabase) return NOT_READY;

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { error: "Le lien a expiré. Demandez un nouveau lien de réinitialisation." };
  const { error } = await supabase.auth.updateUser({ password: pw.data });
  if (error) return { error: error.code === "same_password" ? "Choisissez un mot de passe différent de l'ancien." : "Le mot de passe n'a pas pu être changé." };
  return { ok: true, message: "Mot de passe mis à jour." };
}
