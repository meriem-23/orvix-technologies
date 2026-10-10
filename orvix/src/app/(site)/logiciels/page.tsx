import Link from "next/link";
import type { Metadata } from "next";
import { ProductIcon } from "@/components/product-icon";
import { getProducts } from "@/lib/data";
import { CATEGORY_LABEL, price } from "@/lib/format";
import type { Category } from "@/lib/types";

export const metadata: Metadata = { title: "Logiciels de gestion" };

export default async function CatalogPage({ searchParams }: { searchParams: Promise<{ secteur?: string }> }) {
  const { secteur } = await searchParams;
  const products = await getProducts();
  const cat = (secteur && secteur in CATEGORY_LABEL ? secteur : null) as Category | null;
  const list = cat ? products.filter((p) => p.category === cat) : products;

  return (
    <div className="container py-12 sm:py-16">
      <h1 className="text-4xl font-bold sm:text-5xl">Logiciels de gestion</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Installés sur vos postes, activés avec une clé de licence et mis à jour depuis votre espace client.
      </p>

      <nav className="mt-8 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]" aria-label="Filtrer par secteur">
        <Filter href="/logiciels" active={!cat}>Tous</Filter>
        {(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => (
          <Filter key={c} href={`/logiciels?secteur=${c}`} active={cat === c}>{CATEGORY_LABEL[c]}</Filter>
        ))}
      </nav>

      <ul className="mt-8 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <li key={p.slug} className="bg-raised">
            <Link href={`/logiciels/${p.slug}`} className="group flex h-full flex-col p-6 hover:bg-surface">
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-md bg-brand/10 text-brand-strong group-hover:bg-brand group-hover:text-brand-ink">
                  <ProductIcon slug={p.slug} className="h-6 w-6" />
                </span>
                <span className="text-xs font-medium text-muted">{CATEGORY_LABEL[p.category]}</span>
              </div>
              <h2 className="mt-5 text-xl font-semibold">{p.name}</h2>
              <p className="mt-1 text-sm text-muted">{p.tagline}</p>
              <ul className="mt-4 space-y-1.5 text-sm">
                {p.features.slice(0, 3).map((f) => (
                  <li key={f} className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />{f}</li>
                ))}
              </ul>
              <p className="mt-auto pt-6 font-display text-sm font-semibold text-brand-strong">{price(p)}</p>
            </Link>
          </li>
        ))}
      </ul>
      {list.length === 0 && <p className="mt-8 text-muted">Aucun logiciel publié dans ce secteur pour le moment.</p>}
    </div>
  );
}

function Filter({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium ${active ? "border-brand bg-brand text-brand-ink" : "border-line text-muted hover:text-ink"}`}
    >
      {children}
    </Link>
  );
}
