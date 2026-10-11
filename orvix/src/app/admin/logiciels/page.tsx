import Link from "next/link";
import { Plus, EyeOff } from "lucide-react";
import { PageHeader } from "@/components/dashboard-shell";
import { ProductIcon } from "@/components/product-icon";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { productImageUrl } from "@/lib/images";
import { CATEGORY_LABEL, price } from "@/lib/format";
import type { Product, ProductKind } from "@/lib/types";

const TABS: { v: ProductKind; l: string }[] = [
  { v: "logiciel", l: "Logiciels" },
  { v: "materiel", l: "Matériel et publicité" },
];

export default async function AdminCatalogue({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  await requireAdmin();
  const kind: ProductKind = (await searchParams).type === "materiel" ? "materiel" : "logiciel";
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("*").eq("kind", kind).order("sort_order");
  const products = (data ?? []) as Product[];

  return (
    <>
      <PageHeader
        title="Catalogue"
        description="Logiciels, matériel et solutions publicitaires affichés sur le site."
        action={<Link href={`/admin/logiciels/nouveau?type=${kind}`} className="btn-primary"><Plus className="h-4 w-4" /> {kind === "logiciel" ? "Nouveau logiciel" : "Nouvel article"}</Link>}
      />
      <nav className="mb-6 flex gap-2" aria-label="Type">
        {TABS.map((t) => (
          <Link key={t.v} href={`/admin/logiciels?type=${t.v}`} aria-current={kind === t.v ? "page" : undefined}
            className={`rounded-full border px-4 py-2 text-sm font-medium ${kind === t.v ? "border-transparent bg-grad text-white" : "border-line text-muted hover:text-ink"}`}>
            {t.l}
          </Link>
        ))}
      </nav>
      {products.length === 0 ? (
        <p className="panel p-5 text-sm text-muted">Rien dans cette rubrique. Ajoutez le premier avec le bouton en haut.</p>
      ) : (
        <ul className="panel divide-y divide-line">
          {products.map((p) => {
            const img = productImageUrl(p.image_path);
            return (
              <li key={p.id}>
                <Link href={`/admin/logiciels/${p.id}`} className="flex items-center gap-4 p-4 hover:bg-surface">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-line text-brand-strong">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {img ? <img src={img} alt="" className="h-full w-full object-cover" /> : <ProductIcon slug={p.slug} category={p.category} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 truncate font-semibold">
                      {p.name} {!p.is_published && <EyeOff className="h-3.5 w-3.5 text-muted" aria-label="Masqué" />}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {CATEGORY_LABEL[p.category]}, {price(p)}{p.kind === "materiel" && !p.in_stock ? ", sur commande" : ""}
                    </p>
                  </div>
                  <span className="hidden font-mono text-xs text-muted sm:block">/{p.slug}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
