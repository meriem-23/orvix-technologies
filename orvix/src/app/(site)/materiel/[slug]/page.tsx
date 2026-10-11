import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Check, Truck, MessageCircle } from "lucide-react";
import { ProductImage } from "@/components/product-image";
import { getProduct, getSettings } from "@/lib/data";
import { CATEGORY_LABEL, price } from "@/lib/format";
import { whatsappLink } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProduct((await params).slug, "materiel");
  return p ? { title: p.name, description: p.tagline } : {};
}

export default async function HardwareItemPage({ params }: Props) {
  const { slug } = await params;
  const [p, settings] = await Promise.all([getProduct(slug, "materiel"), getSettings()]);
  if (!p) notFound();

  return (
    <div className="container py-10 sm:py-14">
      <nav className="text-sm text-muted" aria-label="Fil d'Ariane">
        <Link href="/materiel" className="hover:text-ink">Matériel</Link>
        <span className="mx-2">/</span>
        <Link href={`/materiel?secteur=${p.category}`} className="hover:text-ink">{CATEGORY_LABEL[p.category]}</Link>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.15fr_1fr]">
        <ProductImage slug={p.slug} category={p.category} image_path={p.image_path} name={p.name} className="aspect-[4/3] rounded-xl" />

        <div>
          <h1 className="text-4xl font-bold sm:text-5xl">{p.name}</h1>
          <p className="mt-2 text-lg text-muted">{p.tagline}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <p className="font-display text-3xl font-bold">{price(p)}</p>
            <span className={`chip ${p.in_stock ? "bg-ok/10 text-ok" : "bg-warn/15 text-warn"}`}>{p.in_stock ? "Disponible" : "Sur commande"}</span>
          </div>
          <p className="mt-6 leading-relaxed">{p.description}</p>

          {p.features.length > 0 && (
            <ul className="mt-6 grid gap-2.5">
              {p.features.map((f) => (
                <li key={f} className="flex gap-3 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-ok" /> {f}</li>
              ))}
            </ul>
          )}

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Link href={`/contact?type=achat&produit=${p.slug}`} className="btn-primary h-12">Commander ou demander un devis</Link>
            <a
              href={whatsappLink(settings.whatsapp, `Bonjour, je suis intéressé(e) par : ${p.name}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost h-12"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>
          <p className="mt-5 flex items-center gap-2 text-sm text-muted"><Truck className="h-4 w-4" /> Livraison et installation, renseignez-vous pour votre wilaya.</p>
        </div>
      </div>
    </div>
  );
}
