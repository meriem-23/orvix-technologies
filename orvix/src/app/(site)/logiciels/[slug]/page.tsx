import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Check, Monitor, KeyRound, MessageCircle } from "lucide-react";
import { ProductIcon } from "@/components/product-icon";
import { getProduct, getSettings } from "@/lib/data";
import { CATEGORY_LABEL, price } from "@/lib/format";
import { whatsappLink } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProduct((await params).slug, "logiciel");
  return p ? { title: p.name, description: p.tagline } : {};
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [p, settings] = await Promise.all([getProduct(slug, "logiciel"), getSettings()]);
  if (!p) notFound();

  return (
    <div className="container py-10 sm:py-14">
      <nav className="text-sm text-muted" aria-label="Fil d'Ariane">
        <Link href="/logiciels" className="hover:text-ink">Logiciels</Link>
        <span className="mx-2">/</span>
        <Link href={`/logiciels?secteur=${p.category}`} className="hover:text-ink">{CATEGORY_LABEL[p.category]}</Link>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-grad text-white">
            <ProductIcon slug={p.slug} className="h-7 w-7" />
          </span>
          <h1 className="mt-5 text-4xl font-bold sm:text-5xl">{p.name}</h1>
          <p className="mt-2 text-lg text-muted">{p.tagline}</p>
          <p className="mt-6 max-w-2xl leading-relaxed">{p.description}</p>

          <h2 className="mt-12 text-2xl font-semibold">Ce que le logiciel gère</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {p.features.map((f) => (
              <li key={f} className="flex gap-3 rounded-md border border-line bg-raised px-4 py-3 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-ok" /> {f}
              </li>
            ))}
          </ul>

          {p.modules.length > 0 && (
            <>
              <h2 className="mt-12 text-2xl font-semibold">Modules</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {p.modules.map((m) => (
                  <span key={m} className="rounded-md border border-line bg-surface px-3 py-1.5 text-sm">{m}</span>
                ))}
              </div>
            </>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 h-fit panel p-6 shadow-lift">
          <p className="text-sm text-muted">Prix</p>
          <p className="mt-1 font-display text-3xl font-bold">{price(p)}</p>
          <ul className="mt-5 space-y-2.5 text-sm">
            <li className="flex items-center gap-2"><Monitor className="h-4 w-4 text-muted" /> {p.platforms.join(", ")}</li>
            <li className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-muted" /> Activation par clé de licence</li>
          </ul>
          <div className="mt-6 grid gap-3">
            <Link href={`/contact?type=achat&produit=${p.slug}`} className="btn-primary h-12">Acheter {p.name}</Link>
            <Link href={`/contact?type=demo&produit=${p.slug}`} className="btn-ghost h-12">Demander une démo</Link>
            <a
              href={whatsappLink(settings.whatsapp, `Bonjour, je suis intéressé(e) par ${p.name}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-quiet h-11 justify-center"
            >
              <MessageCircle className="h-4 w-4" /> Poser une question sur WhatsApp
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
