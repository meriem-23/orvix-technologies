"use client";
import { useActionState } from "react";
import { createLicense } from "@/app/actions/admin";
import { Field, FormMessage, SubmitButton } from "@/components/forms";
import type { ActionState } from "@/lib/types";

export function LicenseForm({
  clients, products, defaultClient,
}: {
  clients: { id: string; label: string }[];
  products: { id: string; name: string }[];
  defaultClient?: string;
}) {
  const [state, action] = useActionState<ActionState, FormData>(createLicense, {});
  const fe = state.fieldErrors ?? {};
  return (
    <form action={action} className="grid gap-4" noValidate>
      <Field label="Client" name="user_id" error={fe.user_id}>
        <select id="user_id" name="user_id" className="field" defaultValue={defaultClient ?? ""} required>
          <option value="" disabled>Choisir un client</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </Field>
      <Field label="Logiciel" name="product_id" error={fe.product_id}>
        <select id="product_id" name="product_id" className="field" defaultValue="" required>
          <option value="" disabled>Choisir un logiciel</option>
          {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Postes autorisés" name="max_devices" error={fe.max_devices}>
          <input id="max_devices" name="max_devices" type="number" min={1} max={100} defaultValue={1} className="field" />
        </Field>
        <Field label="Expiration" name="expires_at" hint="Vide = à vie">
          <input id="expires_at" name="expires_at" type="date" className="field" />
        </Field>
      </div>
      <Field label="Note interne" name="notes" hint="Non visible par le client">
        <input id="notes" name="notes" className="field" maxLength={500} placeholder="Ex. payé en espèces le 10/10" />
      </Field>
      {state.ok ? (
        <p role="status" className="rounded-md border border-ok/30 bg-ok/10 px-3 py-2.5 text-sm text-ok break-all">{state.message}</p>
      ) : (
        <FormMessage state={state} />
      )}
      <SubmitButton pending="Génération…" className="btn-primary">Générer la clé</SubmitButton>
    </form>
  );
}
