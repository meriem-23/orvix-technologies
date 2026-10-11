"use client";
import { useActionState } from "react";
import { submitRequest } from "@/app/actions/requests";
import { Field, FormMessage, Honeypot, SubmitButton } from "./forms";
import type { ActionState, RequestKind } from "@/lib/types";

type Opt = { slug: string; name: string; kind: "logiciel" | "materiel" };

const KINDS: { v: RequestKind; l: string }[] = [
  { v: "demo", l: "Une démo" },
  { v: "achat", l: "Acheter (logiciel ou matériel)" },
  { v: "sur_mesure", l: "Un site ou logiciel sur mesure" },
  { v: "contact", l: "Autre question" },
];

export function RequestForm({
  products,
  defaults,
}: {
  products: Opt[];
  defaults: { kind?: RequestKind; product?: string; name?: string; email?: string; phone?: string; company?: string };
}) {
  const [state, action] = useActionState<ActionState, FormData>(submitRequest, {});
  const fe = state.fieldErrors ?? {};

  if (state.ok) return <FormMessage state={state} />;

  return (
    <form action={action} className="relative grid gap-5" noValidate>
      <Honeypot />
      <fieldset>
        <legend className="label">Vous souhaitez</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {KINDS.map((k) => (
            <label key={k.v} className="flex cursor-pointer items-center gap-3 rounded-md border border-line bg-raised px-3 py-3 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand/10">
              <input type="radio" name="kind" value={k.v} defaultChecked={(defaults.kind ?? "demo") === k.v} className="accent-[rgb(var(--brand))]" />
              {k.l}
            </label>
          ))}
        </div>
      </fieldset>

      <Field label="Produit concerné" name="product" hint="Facultatif">
        <select id="product" name="product" className="field" defaultValue={defaults.product ?? ""}>
          <option value="">Aucun en particulier</option>
          <optgroup label="Logiciels">
            {products.filter((p) => p.kind === "logiciel").map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
          </optgroup>
          <optgroup label="Matériel et publicité">
            {products.filter((p) => p.kind === "materiel").map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
          </optgroup>
        </select>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nom complet" name="name" error={fe.name}>
          <input id="name" name="name" className="field" autoComplete="name" required maxLength={120} defaultValue={defaults.name} />
        </Field>
        <Field label="Entreprise ou commerce" name="company" error={fe.company}>
          <input id="company" name="company" className="field" autoComplete="organization" maxLength={120} defaultValue={defaults.company} />
        </Field>
        <Field label="E-mail" name="email" error={fe.email}>
          <input id="email" name="email" type="email" className="field" autoComplete="email" required maxLength={200} defaultValue={defaults.email} />
        </Field>
        <Field label="Téléphone" name="phone" error={fe.phone}>
          <input id="phone" name="phone" type="tel" inputMode="tel" className="field" autoComplete="tel" maxLength={30} defaultValue={defaults.phone} />
        </Field>
      </div>

      <Field label="Budget approximatif" name="budget" hint="Facultatif, utile pour les projets sur mesure">
        <input id="budget" name="budget" className="field" maxLength={60} placeholder="Ex. 150 000 DA" />
      </Field>

      <Field label="Votre message" name="message" error={fe.message}>
        <textarea id="message" name="message" className="field" required maxLength={4000} placeholder="Votre activité, le nombre de postes, ce que vous voulez gérer…" />
      </Field>

      <FormMessage state={state} />
      <SubmitButton pending="Envoi…" className="btn-primary h-12 sm:justify-self-start sm:px-8">Envoyer la demande</SubmitButton>
    </form>
  );
}
