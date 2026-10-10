import Link from "next/link";
import type { Metadata } from "next";
import { Megaphone, Cpu } from "lucide-react";
import { ProductImage } from "@/components/product-image";
import { getHardware } from "@/lib/data";
import { CATEGORY_LABEL, HARDWARE_CATEGORIES, price } from "@/lib/format";
import type { HardwareCategory } from "@/lib/types";

export const metadata: Metadata = {
  title: "Matériel et solutions publicitaires",
  description: "Projecteurs de logo, solutions publicitaires, PC de bureau, PC portables et postes de caisse complets.",
};

const INTRO: Record<HardwareCategory, { icon: typeof Megaphone; text: string }> = {
  publicite: { icon: Megaphone, text: "Faites remarquer votre commerce : projecteurs de logo pour vitrines, entrées et salles, avec le visuel préparé par nos soins." },
  informatique: { icon: Cpu, text: "PC de bureau, portables et postes de caisse, préparés et livrés avec vos logiciels déjà installés." },
};

export default async function HardwarePage({ searchParams }: { searchParams: Promise<{ secteur?: string }> }) {
  const { secteur } = await searchParams;
  const items = await getHardware();
  const cat = (HARDWARE_CATEGORIES as string[]).includes(secteur ?? "") ? (secteur as HardwareCategory) : null;
  const groups = (cat ? [cat] : HARDWARE_CATEGORIES)
    .map((c) => ({ c, list: items.filter((p) => p.category === c) }))
    .filter((g) => g.list.length);

  return (
    <div className="container py-12 sm:py-16">
      <h1 className="text-4xl font-bold sm:text-5xl">Matériel et solutions publicitaires</h1>
      <p className="mt-3 max-w-2xl text-muted">Du projecteur de logo pour votre vitrine au poste de caisse complet, livré et installé.</p>

      <nav className="-mx-4 mt-8 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]" aria-label="Filtrer">
        <Filter href="/materiel" active={!cat}>Tout</Filter>
        {HARDWARE_CATEGORIES.map((c) => (
          <Filter key={c} href={`/materiel?secteur=${c}`} active={cat === c}>{CATEGORY_LABEL[c]}</Filter>
        ))}
      </nav>

      {groups.length === 0 && <p className="mt-10 text-muted">Aucun article publié pour le moment.</p>}

      {groups.map(({ c, list }) => {
        const { icon: Icon, text } = INTRO[c];
        return (
          <section key={c} className="mt-12">
            <div className="flex items-start gap-4 border-b border-line pb-5">
              <span className="bg-grad flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-white"><Icon className="h-5 w-5" /></span>
              <div>
                <h2 className="text-2xl font-semibold">{CATEGORY_LABEL[c]}</h2>
                <p className="mt-1 max-w-2xl text-sm text-muted">{text}</p>
              </div>
            </div>
            <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((p) => (
                <li key={p.slug}>
                  <Link href={`/materiel/${p.slug}`} className="group block">
                    <ProductImage slug={p.slug} category={p.category} image_path={p.image_path} name={p.name} />
                    <div className="mt-4 flex items-start justify-between gap-3">
                      <h3 className="text-lg font-semibold group-hover:text-brand-strong">{p.name}</h3>
                      {!p.in_stock && <span className="chip shrink-0 bg-warn/15 text-warn">Sur commande</span>}
                    </div>
                    <p className="mt-1 text-sm text-muted">{p.tagline}</p>
                    <p className="mt-3 font-display text-sm font-semibold text-brand-strong">{price(p)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <div className="panel mt-16 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-lg font-semibold">Vous cherchez un autre matériel ?</p>
          <p className="text-sm text-muted">Écran, imprimante, réseau, caméra… Dites-nous ce qu&apos;il vous faut, on vous fait un devis.</p>
        </div>
        <Link href="/contact?type=achat" className="btn-primary">Demander un devis</Link>
      </div>
    </div>
  );
}

function Filter({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium ${active ? "border-transparent bg-grad text-white" : "border-line text-muted hover:text-ink"}`}
    >
      {children}
    </Link>
  );
}
