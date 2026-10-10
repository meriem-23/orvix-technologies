import Link from "next/link";
import { Globe, Code2, Smartphone, KeyRound, Download, LifeBuoy, MessageCircle } from "lucide-react";
import { ProductConsole } from "@/components/product-console";
import { ProductIcon } from "@/components/product-icon";
import { getProducts, getSettings } from "@/lib/data";
import { CATEGORY_LABEL } from "@/lib/format";
import { whatsappLink } from "@/lib/site";
import type { Category } from "@/lib/types";

export default async function HomePage() {
  const [products, settings] = await Promise.all([getProducts(), getSettings()]);
  const groups = (Object.keys(CATEGORY_LABEL) as Category[])
    .map((c) => ({ c, list: products.filter((p) => p.category === c) }))
    .filter((g) => g.list.length);

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 grid-paper opacity-50 [mask-image:radial-gradient(ellipse_at_70%_20%,black,transparent_70%)]" />
        <div className="container relative grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
          <div className="min-w-0">
            <h1 className="text-[2.35rem] leading-[1.08] font-bold sm:text-5xl lg:text-[3.6rem]">
              Le logiciel qui fait tourner votre commerce.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              Pharmacies, superettes, restaurants, cabinets et agences : {products.length} logiciels de gestion prêts à
              installer. Et une équipe qui développe vos sites et vos outils sur mesure.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/logiciels" className="btn-primary h-12 px-6 text-base">Voir les logiciels</Link>
              <Link href="/contact?type=demo" className="btn-ghost h-12 px-6 text-base">Demander une démo</Link>
            </div>
          </div>
          <div className="min-w-0">
          <ProductConsole
            items={products.map(({ slug, name, tagline, category, features, modules, platforms }) => ({ slug, name, tagline, category, features, modules, platforms }))}
          />
          </div>
        </div>
      </section>

      {/* ---------- Catalogue by sector ---------- */}
      <section className="border-t border-line bg-surface">
        <div className="container py-16 sm:py-20">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold sm:text-4xl">Un logiciel par métier</h2>
              <p className="mt-3 text-muted">Chaque logiciel est pensé pour un métier précis, avec ses écrans, ses documents et ses rapports.</p>
            </div>
            <Link href="/logiciels" className="btn-ghost self-start sm:self-auto">Tout le catalogue</Link>
          </div>

          <div className="mt-10 grid gap-x-10 gap-y-10 md:grid-cols-2">
            {groups.map((g) => (
              <div key={g.c}>
                <h3 className="border-b border-line pb-2 text-sm font-semibold text-muted">{CATEGORY_LABEL[g.c]}</h3>
                <ul>
                  {g.list.map((p) => (
                    <li key={p.slug}>
                      <Link href={`/logiciels/${p.slug}`} className="group flex items-center gap-4 border-b border-line py-4">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-line bg-raised text-brand-strong group-hover:bg-brand group-hover:text-brand-ink group-hover:border-brand">
                          <ProductIcon slug={p.slug} />
                        </span>
                        <span className="min-w-0">
                          <span className="block font-display font-semibold">{p.name}</span>
                          <span className="block truncate text-sm text-muted">{p.tagline}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Custom work ---------- */}
      <section>
        <div className="container grid gap-12 py-16 sm:py-20 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold sm:text-4xl">Votre projet n&apos;est pas dans le catalogue ?</h2>
            <p className="mt-4 max-w-lg text-muted leading-relaxed">
              Nous développons aussi des sites web, des logiciels et des applications mobiles sur mesure, de la maquette à la mise en ligne.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { icon: Globe, t: "Sites web", d: "Vitrines, réservation, e-commerce" },
                { icon: Code2, t: "Logiciels", d: "Gestion interne, caisse, stock" },
                { icon: Smartphone, t: "Applications", d: "Android, iOS et web" },
              ].map(({ icon: Icon, t, d }) => (
                <div key={t} className="border-l-2 border-brand pl-4">
                  <Icon className="h-5 w-5 text-brand-strong" />
                  <p className="mt-2 font-display font-semibold">{t}</p>
                  <p className="text-sm text-muted">{d}</p>
                </div>
              ))}
            </div>
            <Link href="/sur-mesure" className="btn-primary mt-8">Parler de votre projet</Link>
          </div>

          <ol className="relative space-y-0 border-l border-line pl-8">
            {[
              ["Échange", "On écoute votre besoin et on fixe ensemble le périmètre et le budget."],
              ["Maquette", "Vous validez les écrans avant la première ligne de code."],
              ["Développement", "Livraisons régulières que vous testez au fur et à mesure."],
              ["Mise en ligne et suivi", "Installation, formation et support après la livraison."],
            ].map(([t, d], i) => (
              <li key={t} className="relative pb-9 last:pb-0">
                <span className="absolute -left-[45px] flex h-7 w-7 items-center justify-center rounded-full border border-brand bg-bg font-display text-xs font-bold text-brand-strong">
                  {i + 1}
                </span>
                <p className="font-display text-lg font-semibold">{t}</p>
                <p className="mt-1 text-sm text-muted">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- After purchase ---------- */}
      <section className="border-y border-line bg-surface">
        <div className="container py-16 sm:py-20">
          <h2 className="max-w-xl text-3xl font-bold sm:text-4xl">Après l&apos;achat, tout est dans votre espace client</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              { icon: KeyRound, t: "Vos clés de licence", d: "Retrouvez la clé d'activation de chaque logiciel, son statut et sa date d'expiration." },
              { icon: Download, t: "Les dernières versions", d: "Téléchargez l'installateur à jour dès qu'une nouvelle version sort." },
              { icon: LifeBuoy, t: "Un support qui répond", d: "Ouvrez un ticket et suivez la réponse de l'équipe, au même endroit." },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t}>
                <Icon className="h-6 w-6 text-gold" />
                <p className="mt-3 font-display text-lg font-semibold">{t}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{d}</p>
              </div>
            ))}
          </div>
          <Link href="/inscription" className="btn-ghost mt-10">Créer mon espace client</Link>
        </div>
      </section>

      {/* ---------- Contact ---------- */}
      <section>
        <div className="container py-16 sm:py-20">
          <div className="flex flex-col gap-6 rounded-xl bg-brand px-6 py-10 text-brand-ink sm:px-10 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">Voyez le logiciel tourner avant d&apos;acheter</h2>
              <p className="mt-2 text-white/80">Une démo gratuite, chez vous ou à distance.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={whatsappLink(settings.whatsapp, "Bonjour, je souhaite une démo de vos logiciels.")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn h-12 bg-white px-6 text-base text-[#5E1420] hover:bg-white/90"
              >
                <MessageCircle className="h-5 w-5" /> WhatsApp
              </a>
              <Link href="/contact?type=demo" className="btn h-12 border border-white/40 px-6 text-base text-white hover:bg-white/10">
                Formulaire de démo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
