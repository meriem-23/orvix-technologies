"use client";
import { useActionState } from "react";
import { updateProfile } from "@/app/actions/client";
import { Field, FormMessage, SubmitButton } from "./forms";
import type { ActionState, Profile } from "@/lib/types";

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, action] = useActionState<ActionState, FormData>(updateProfile, {});
  const fe = state.fieldErrors ?? {};
  return (
    <form action={action} className="grid gap-5" noValidate>
      <Field label="Nom complet" name="full_name" error={fe.full_name}>
        <input id="full_name" name="full_name" className="field" defaultValue={profile.full_name} required maxLength={120} autoComplete="name" />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Téléphone" name="phone" error={fe.phone}>
          <input id="phone" name="phone" type="tel" className="field" defaultValue={profile.phone} maxLength={30} autoComplete="tel" />
        </Field>
        <Field label="Wilaya" name="wilaya" error={fe.wilaya}>
          <input id="wilaya" name="wilaya" className="field" defaultValue={profile.wilaya} maxLength={60} />
        </Field>
      </div>
      <Field label="Commerce ou entreprise" name="company" error={fe.company}>
        <input id="company" name="company" className="field" defaultValue={profile.company} maxLength={120} autoComplete="organization" />
      </Field>
      <FormMessage state={state} />
      <SubmitButton pending="Enregistrement…" className="btn-primary sm:justify-self-start">Enregistrer</SubmitButton>
    </form>
  );
}
