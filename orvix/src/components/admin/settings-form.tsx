"use client";
import { useActionState } from "react";
import { saveSettings } from "@/app/actions/admin";
import { Field, FormMessage, SubmitButton } from "@/components/forms";
import type { ActionState } from "@/lib/types";
import type { Settings } from "@/lib/data";

export function SettingsForm({ settings }: { settings: Settings }) {
  const [state, action] = useActionState<ActionState, FormData>(saveSettings, {});
  const fe = state.fieldErrors ?? {};
  return (
    <form action={action} className="grid gap-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Téléphone affiché" name="phone" error={fe.phone}>
          <input id="phone" name="phone" className="field" defaultValue={settings.phone} maxLength={30} />
        </Field>
        <Field label="Numéro WhatsApp" name="whatsapp" error={fe.whatsapp} hint="Format international, ex. 213668792239">
          <input id="whatsapp" name="whatsapp" inputMode="numeric" className="field font-mono" defaultValue={settings.whatsapp} maxLength={15} />
        </Field>
        <Field label="E-mail de contact" name="email" error={fe.email}>
          <input id="email" name="email" type="email" className="field" defaultValue={settings.email} maxLength={200} />
        </Field>
        <Field label="Ville / pays" name="city" error={fe.city}>
          <input id="city" name="city" className="field" defaultValue={settings.city} maxLength={80} />
        </Field>
      </div>
      <Field label="Bandeau d'annonce" name="announcement" error={fe.announcement} hint="Affiché en haut du site. Laissez vide pour le masquer.">
        <input id="announcement" name="announcement" className="field" defaultValue={settings.announcement} maxLength={200} placeholder="Ex. -20 % sur Orvix Pharma jusqu'au 31 octobre" />
      </Field>
      <FormMessage state={state} />
      <SubmitButton pending="Enregistrement…" className="btn-primary sm:justify-self-start sm:px-8">Enregistrer</SubmitButton>
    </form>
  );
}
