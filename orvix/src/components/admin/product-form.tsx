"use client";
import { useActionState } from "react";
import { saveProduct } from "@/app/actions/admin";
import { Field, FormMessage, SubmitButton } from "@/components/forms";
import type { ActionState, Product } from "@/lib/types";

export function ProductForm({ product }: { product?: Product }) {
  const [state, action] = useActionState<ActionState, FormData>(saveProduct, {});
  const fe = state.fieldErrors ?? {};
  const p = product;
  return (
    <form action={action} className="grid gap-5" noValidate>
      {p && <input type="hidden" name="id" value={p.id} />}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nom" name="name" error={fe.name}>
          <input id="name" name="name" className="field" defaultValue={p?.name} required maxLength={80} />
        </Field>
        <Field label="Adresse (slug)" name="slug" error={fe.slug} hint={`Page : /logiciels/${p?.slug ?? "mon-logiciel"}`}>
          <input id="slug" name="slug" className="field font-mono" defaultValue={p?.slug} required maxLength={60} pattern="[a-z0-9-]+" />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Secteur" name="category">
          <select id="category" name="category" className="field" defaultValue={p?.category ?? "commerce"}>
            <option value="sante">Santé</option>
            <option value="commerce">Commerce</option>
            <option value="services">Services</option>
            <option value="agences">Agences</option>
          </select>
        </Field>
        <Field label="Tarification" name="pricing_model">
          <select id="pricing_model" name="pricing_model" className="field" defaultValue={p?.pricing_model ?? "devis"}>
            <option value="devis">Sur devis</option>
            <option value="licence">Licence (paiement unique)</option>
            <option value="abonnement">Abonnement mensuel</option>
          </select>
        </Field>
        <Field label="Prix (DA)" name="price_dzd" error={fe.price_dzd} hint="Vide = sur devis">
          <input id="price_dzd" name="price_dzd" inputMode="numeric" className="field" defaultValue={p?.price_dzd ?? ""} maxLength={10} />
        </Field>
      </div>
      <Field label="Accroche" name="tagline" error={fe.tagline}>
        <input id="tagline" name="tagline" className="field" defaultValue={p?.tagline} maxLength={140} />
      </Field>
      <Field label="Description" name="description" error={fe.description}>
        <textarea id="description" name="description" className="field" defaultValue={p?.description} maxLength={2000} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Fonctionnalités" name="features" hint="Une par ligne">
          <textarea id="features" name="features" className="field min-h-[160px]" defaultValue={p?.features.join("\n")} maxLength={3000} />
        </Field>
        <Field label="Modules" name="modules" hint="Un par ligne (onglets affichés sur l'accueil)">
          <textarea id="modules" name="modules" className="field min-h-[160px]" defaultValue={p?.modules.join("\n")} maxLength={600} />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Plateformes" name="platforms" hint="Séparées par des virgules">
          <input id="platforms" name="platforms" className="field" defaultValue={p?.platforms.join(", ") ?? "Windows"} maxLength={200} />
        </Field>
        <Field label="Ordre d'affichage" name="sort_order" hint="Plus petit = plus haut">
          <input id="sort_order" name="sort_order" type="number" min={0} max={9999} className="field" defaultValue={p?.sort_order ?? 100} />
        </Field>
        <label className="flex items-center gap-3 self-end rounded-md border border-line px-3 h-11 text-sm">
          <input type="checkbox" name="is_published" defaultChecked={p?.is_published ?? true} className="h-4 w-4 accent-[rgb(var(--brand))]" />
          Visible sur le site
        </label>
      </div>
      <FormMessage state={state} />
      <SubmitButton pending="Enregistrement…" className="btn-primary sm:justify-self-start sm:px-8">{p ? "Enregistrer" : "Créer le logiciel"}</SubmitButton>
    </form>
  );
}
