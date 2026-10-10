"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { forgotPassword, signIn, signUp, updatePassword } from "@/app/actions/auth";
import { Field, FormMessage, Honeypot, SubmitButton } from "./forms";
import type { ActionState } from "@/lib/types";

function PasswordInput({ name, autoComplete, id = name }: { name: string; autoComplete: string; id?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input id={id} name={name} type={show ? "text" : "password"} className="field pr-11" autoComplete={autoComplete} required maxLength={128} />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted hover:text-ink"
        aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState<ActionState, FormData>(signIn, {});
  const fe = state.fieldErrors ?? {};
  return (
    <form action={action} className="grid gap-5" noValidate>
      <input type="hidden" name="next" value={next ?? ""} />
      <Field label="E-mail" name="email" error={fe.email}>
        <input id="email" name="email" type="email" className="field" autoComplete="email" required maxLength={200} />
      </Field>
      <Field label="Mot de passe" name="password" error={fe.password}>
        <PasswordInput name="password" autoComplete="current-password" />
      </Field>
      <div className="-mt-2 text-right">
        <Link href="/mot-de-passe-oublie" className="text-sm text-brand-strong hover:underline underline-offset-4">Mot de passe oublié ?</Link>
      </div>
      <FormMessage state={state} />
      <SubmitButton pending="Connexion…" className="btn-primary h-12">Se connecter</SubmitButton>
    </form>
  );
}

export function SignupForm() {
  const [state, action] = useActionState<ActionState, FormData>(signUp, {});
  const fe = state.fieldErrors ?? {};
  if (state.ok) return <FormMessage state={state} />;
  return (
    <form action={action} className="relative grid gap-5" noValidate>
      <Honeypot />
      <Field label="Nom complet" name="full_name" error={fe.full_name}>
        <input id="full_name" name="full_name" className="field" autoComplete="name" required maxLength={120} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Téléphone" name="phone" error={fe.phone}>
          <input id="phone" name="phone" type="tel" inputMode="tel" className="field" autoComplete="tel" required maxLength={30} />
        </Field>
        <Field label="Commerce ou entreprise" name="company" error={fe.company}>
          <input id="company" name="company" className="field" autoComplete="organization" maxLength={120} />
        </Field>
      </div>
      <Field label="E-mail" name="email" error={fe.email}>
        <input id="email" name="email" type="email" className="field" autoComplete="email" required maxLength={200} />
      </Field>
      <Field label="Mot de passe" name="password" error={fe.password} hint="10 caractères minimum, avec une majuscule, une minuscule et un chiffre">
        <PasswordInput name="password" autoComplete="new-password" />
      </Field>
      <FormMessage state={state} />
      <SubmitButton pending="Création…" className="btn-primary h-12">Créer mon compte</SubmitButton>
    </form>
  );
}

export function ForgotForm() {
  const [state, action] = useActionState<ActionState, FormData>(forgotPassword, {});
  if (state.ok) return <FormMessage state={state} />;
  return (
    <form action={action} className="grid gap-5" noValidate>
      <Field label="E-mail du compte" name="email" error={state.fieldErrors?.email}>
        <input id="email" name="email" type="email" className="field" autoComplete="email" required maxLength={200} />
      </Field>
      <FormMessage state={state} />
      <SubmitButton pending="Envoi…" className="btn-primary h-12">Recevoir le lien</SubmitButton>
    </form>
  );
}

export function NewPasswordForm({ after = "/espace" }: { after?: string }) {
  const [state, action] = useActionState<ActionState, FormData>(updatePassword, {});
  const fe = state.fieldErrors ?? {};
  if (state.ok)
    return (
      <div className="grid gap-4">
        <FormMessage state={state} />
        <Link href={after} className="btn-primary h-12">Continuer</Link>
      </div>
    );
  return (
    <form action={action} className="grid gap-5" noValidate>
      <Field label="Nouveau mot de passe" name="password" error={fe.password} hint="10 caractères minimum, avec une majuscule, une minuscule et un chiffre">
        <PasswordInput name="password" autoComplete="new-password" />
      </Field>
      <Field label="Confirmer" name="confirm" error={fe.confirm}>
        <PasswordInput name="confirm" autoComplete="new-password" />
      </Field>
      <FormMessage state={state} />
      <SubmitButton pending="Enregistrement…" className="btn-primary h-12">Enregistrer le mot de passe</SubmitButton>
    </form>
  );
}
