"use client";
import { useActionState, useState } from "react";
import { Loader2, ImagePlus, X } from "lucide-react";
import { saveProduct } from "@/app/actions/admin";
import { Field, FormMessage, SubmitButton } from "@/components/forms";
import { createClient } from "@/lib/supabase/browser";
import { productImageUrl } from "@/lib/images";
import type { ActionState, Product, ProductKind } from "@/lib/types";

const CATS: Record<ProductKind, { v: string; l: string }[]> = {
  logiciel: [
    { v: "sante", l: "Santé" }, { v: "commerce", l: "Commerce" },
    { v: "services", l: "Services" }, { v: "agences", l: "Agences" },
  ],
  materiel: [
    { v: "publicite", l: "Solutions publicitaires" }, { v: "informatique", l: "Informatique et PC" },
  ],
};

function ImageField({ initial, slug }: { initial: string; slug: string }) {
  const [path, setPath] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return setError("Formats acceptés : JPG, PNG ou WebP.");
    if (file.size > 5 * 1024 * 1024) return setError("Image trop lourde (5 Mo maximum).");
    const folder = (slug || "produit").replace(/[^a-z0-9-]/g, "") || "produit";
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const next = `${folder}/${Date.now()}.${ext}`;
    setBusy(true); setError("");
    const { error } = await createClient().storage.from("catalog").upload(next, file, { contentType: file.type, upsert: false });
    setBusy(false);
    if (error) return setError("Envoi impossible. Vérifiez votre connexion et réessayez.");
    setPath(next);
  }

  const url = productImageUrl(path);
  return (
    <div>
      <span className="label">Photo</span>
      <input type="hidden" name="image_path" value={path} />
      <div className="flex items-center gap-4">
        <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-md border border-line bg-surface">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center text-xs text-muted">Aucune photo</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="btn-ghost h-9 cursor-pointer">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            {path ? "Remplacer" : "Ajouter une photo"}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={onFile} disabled={busy} />
          </label>
          {path && (
            <button type="button" onClick={() => setPath("")} className="btn-quiet h-8 justify-start px-2 text-xs">
              <X className="h-3.5 w-3.5" /> Retirer
            </button>
          )}
        </div>
      </div>
      {error ? <p className="mt-1 text-xs text-danger">{error}</p> : <p className="hint">JPG, PNG ou WebP, 5 Mo max. Enregistrez le formulaire après l&apos;envoi.</p>}
    </div>
  );
}

export function ProductForm({ product, defaultKind = "logiciel" }: { product?: Product; defaultKind?: ProductKind }) {
  const [state, action] = useActionState<ActionState, FormData>(saveProduct, {});
  const fe = state.fieldErrors ?? {};
  const p = product;
  const [kind, setKind] = useState<ProductKind>(p?.kind ?? defaultKind);
  const [slug, setSlug] = useState(p?.slug ?? "");
  const software = kind === "logiciel";

  return (
    <form action={action} className="grid gap-5" noValidate>
      {p && <input type="hidden" name="id" value={p.id} />}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Type" name="kind">
          <select id="kind" name="kind" className="field" value={kind} onChange={(e) => setKind(e.target.value as ProductKind)} disabled={!!p}>
            <option value="logiciel">Logiciel</option>
            <option value="materiel">Matériel ou publicité</option>
          </select>
          {p && <input type="hidden" name="kind" value={kind} />}
        </Field>
        <Field label="Secteur" name="category" error={fe.category}>
          <select key={kind} id="category" name="category" className="field" defaultValue={p?.kind === kind ? p.category : CATS[kind][0].v}>
            {CATS[kind].map((c) => <option key={c.v} value={c.v}>{c.l}</option>)}
          </select>
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nom" name="name" error={fe.name}>
          <input id="name" name="name" className="field" defaultValue={p?.name} required maxLength={80} />
        </Field>
        <Field label="Adresse (slug)" name="slug" error={fe.slug} hint={`Page : /${software ? "logiciels" : "materiel"}/${slug || "mon-produit"}`}>
          <input id="slug" name="slug" className="field font-mono" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase())} required maxLength={60} pattern="[a-z0-9-]+" />
        </Field>
      </div>

      <ImageField initial={p?.image_path ?? ""} slug={slug} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Tarification" name="pricing_model">
          <select id="pricing_model" name="pricing_model" className="field" defaultValue={p?.pricing_model ?? "devis"}>
            <option value="devis">Sur devis</option>
            <option value="licence">Paiement unique</option>
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
      <div className={`grid gap-5 ${software ? "sm:grid-cols-2" : ""}`}>
        <Field label={software ? "Fonctionnalités" : "Caractéristiques"} name="features" hint="Une par ligne">
          <textarea id="features" name="features" className="field min-h-[160px]" defaultValue={p?.features.join("\n")} maxLength={3000} />
        </Field>
        {software ? (
          <Field label="Modules" name="modules" hint="Un par ligne (onglets affichés sur l'accueil)">
            <textarea id="modules" name="modules" className="field min-h-[160px]" defaultValue={p?.modules.join("\n")} maxLength={600} />
          </Field>
        ) : (
          <input type="hidden" name="modules" value="" />
        )}
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        {software ? (
          <Field label="Plateformes" name="platforms" hint="Séparées par des virgules">
            <input id="platforms" name="platforms" className="field" defaultValue={p?.platforms.join(", ") ?? "Windows"} maxLength={200} />
          </Field>
        ) : (
          <>
            <input type="hidden" name="platforms" value="" />
            <label className="flex h-11 items-center gap-3 self-end rounded-md border border-line px-3 text-sm">
              <input type="checkbox" name="in_stock" defaultChecked={p?.in_stock ?? true} className="h-4 w-4 accent-[rgb(var(--brand))]" />
              En stock
            </label>
          </>
        )}
        {software && <input type="hidden" name="in_stock" value="on" />}
        <Field label="Ordre d'affichage" name="sort_order" hint="Plus petit = plus haut">
          <input id="sort_order" name="sort_order" type="number" min={0} max={9999} className="field" defaultValue={p?.sort_order ?? 100} />
        </Field>
        <label className="flex h-11 items-center gap-3 self-end rounded-md border border-line px-3 text-sm">
          <input type="checkbox" name="is_published" defaultChecked={p?.is_published ?? true} className="h-4 w-4 accent-[rgb(var(--brand))]" />
          Visible sur le site
        </label>
      </div>
      <FormMessage state={state} />
      <SubmitButton pending="Enregistrement…" className="btn-primary sm:justify-self-start sm:px-8">{p ? "Enregistrer" : "Créer"}</SubmitButton>
    </form>
  );
}
