import Link from "next/link";
import {
  AppWindow, Megaphone, Cpu, Code2, Globe, Smartphone,
  KeyRound, Download, LifeBuoy, MessageCircle,
} from "lucide-react";
import { Waves } from "@/components/waves";
import { ProductConsole } from "@/components/product-console";
import { ProductImage } from "@/components/product-image";
import { getHardware, getSettings, getSoftware } from "@/lib/data";
import { CATEGORY_LABEL, price } from "@/lib/format";
import { whatsappLink } from "@/lib/site";

export default async function HomePage() {
  const [software, hardware, settings] = await Promise.all([getSoftware(), getHardware(), getSettings()]);

  const pillars = [
    { href: "/logiciels", icon: AppWindow, t: "Logiciels de gestion", d: `${software.length} métiers couverts` },
    { href: "/materiel?secteur=publicite", icon: Megaphone, t: "Solutions publicitaires", d: "Projecteurs de logo et visibilité" },
    { href: "/materiel?secteur=informatique", icon: Cpu, t: "Informatique et PC", d: "PC, portables, postes de caisse" },
    { href: "/sur-mesure", icon: Code2, t: "Développement sur mesure", d: "Sites, logiciels, applications" },
  ];

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-40 top-10 h-[420px] w-[420px] rounded-full bg-magenta/10 blur-[120px]" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-[420px] w-[520px] rounded-full bg-blue/15 blur-[120px]" />

        <div className="container relative grid items-center gap-4 pb-12 pt-6 sm:pt-10 lg:min-h-[620px] lg:grid-cols-[1fr_1.1fr] lg:gap-6 lg:py-16">
          <div className="order-2 min-w-0 lg:order-1">
            <h1 className="text-[2.4rem] font-extrabold leading-[1.05] sm:text-6xl lg:text-[4.1rem]">
              Tout ce qui fait tourner votre commerce.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              Logiciels de gestion, PC et postes de caisse, projecteurs de logo et solutions publicitaires.
              Et des sites et logiciels développés sur mesure.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/logiciels" className="btn-primary h-12 px-7 text-base">Voir les logiciels</Link>
              <Link href="/contact" className="btn-ghost h-12 px-7 text-base">Demander un devis</Link>
            </div>
          </div>
          <div className="order-1 -mx-4 h-[230px] sm:h-[320px] lg:order-2 lg:mx-0 lg:h-[540px]">
            <Waves streams={6} seed={11} spread={0.86} />
          </div>
        </div>

        {/* What we do */}
        <div className="container relative pb-14">
          <div className="rule-grad" />
          <ul className="grid grid-cols-2 lg:grid-cols-4">
            {pillars.map(({ href, icon: Icon, t, d }) => (
              <li key={href}>
                <Link href={href} className="group flex h-full flex-col gap-2 px-1 py-6 sm:flex-row sm:items-center sm:gap-4 sm:px-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-line bg-raised text-brand-strong group-hover:border-transparent group-hover:bg-grad group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block font-display text-[15px] font-semibold leading-snug">{t}</span>
                    <span className="block text-xs text-muted sm:text-sm">{d}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Software ---------- */}
      <section className="border-t border-line bg-surface">
        <div className="container grid gap-10 py-16 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <h2 className="text-3xl font-bold sm:text-4xl">Un logiciel pour chaque métier</h2>
            <p className="mt-4 max-w-md leading-relaxed text-muted">
              Pharmacie, superette, restaurant, cabinet médical, agence de voyage… Chaque logiciel a les écrans, les documents
              et les rapports de son métier. Installation sur vos postes, activation par clé, mises à jour depuis votre espace client.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/logiciels" className="btn-primary">Tout le catalogue</Link>
              <Link href="/contact?type=demo" className="btn-ghost">Demander une démo</Link>
            </div>
          </div>
          <div className="min-w-0">
            <ProductConsole
              items={software.map(({ slug, name, tagline, category, features, modules, platforms }) => ({ slug, name, tagline, category, features, modules, platforms }))}
            />
          </div>
        </div>
      </section>

      {/* ---------- Hardware & advertising ---------- */}
      {hardware.length > 0 && (
        <section>
          <div className="container py-16 sm:py-20">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div className="max-w-xl">
                <h2 className="text-3xl font-bold sm:text-4xl">Matériel et solutions publicitaires</h2>
                <p className="mt-3 text-muted">
                  Projecteurs de logo pour votre vitrine, PC et postes de caisse livrés avec votre logiciel déjà installé.
                </p>
              </div>
              <Link href="/materiel" className="btn-ghost self-start sm:self-auto">Voir tout le matériel</Link>
            </div>
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {hardware.slice(0, 4).map((p) => (
                <li key={p.slug}>
                  <Link href={`/materiel/${p.slug}`} className="group block">
                    <ProductImage slug={p.slug} category={p.category} image_path={p.image_path} name={p.name} />
                    <p className="mt-4 text-xs font-medium text-muted">{CATEGORY_LABEL[p.category]}</p>
                    <h3 className="mt-1 text-lg font-semibold group-hover:text-brand-strong">{p.name}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted">{p.tagline}</p>
                    <p className="mt-3 font-display text-sm font-semibold text-brand-strong">{price(p)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ---------- Custom work ---------- */}
      <section className="border-t border-line bg-surface">
        <div className="container grid gap-12 py-16 sm:py-20 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold sm:text-4xl">Votre projet n&apos;est pas dans le catalogue ?</h2>
            <p className="mt-4 max-w-lg leading-relaxed text-muted">
              Nous développons aussi des sites web, des logiciels et des applications mobiles sur mesure, de la maquette à la mise en ligne.
            </p>
            <div className="mt-8 grid gap-5 sm:grid-cols-3">
              {[
                { icon: Globe, t: "Sites web", d: "Vitrines, réservation, e-commerce" },
                { icon: Code2, t: "Logiciels", d: "Gestion interne, caisse, stock" },
                { icon: Smartphone, t: "Applications", d: "Android, iOS et web" },
              ].map(({ icon: Icon, t, d }) => (
                <div key={t} className="relative pl-4">
                  <span className="bg-grad absolute inset-y-0 left-0 w-0.5 rounded-full" />
                  <Icon className="h-5 w-5 text-brand-strong" />
                  <p className="mt-2 font-display font-semibold">{t}</p>
                  <p className="text-sm text-muted">{d}</p>
                </div>
              ))}
            </div>
            <Link href="/sur-mesure" className="btn-primary mt-8">Parler de votre projet</Link>
          </div>

          <ol className="relative border-l border-line pl-8">
            {[
              ["Échange", "On écoute votre besoin et on fixe ensemble le périmètre et le budget."],
              ["Maquette", "Vous validez les écrans avant la première ligne de code."],
              ["Développement", "Livraisons régulières que vous testez au fur et à mesure."],
              ["Mise en ligne et suivi", "Installation, formation et support après la livraison."],
            ].map(([t, d], i) => (
              <li key={t} className="relative pb-9 last:pb-0">
                <span className="bg-grad absolute -left-[45px] flex h-7 w-7 items-center justify-center rounded-full font-display text-xs font-bold text-white">
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
      <section className="border-t border-line">
        <div className="container py-16 sm:py-20">
          <h2 className="max-w-xl text-3xl font-bold sm:text-4xl">Après l&apos;achat, tout est dans votre espace client</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              { icon: KeyRound, t: "Vos clés de licence", d: "Retrouvez la clé d'activation de chaque logiciel, son statut et sa date d'expiration." },
              { icon: Download, t: "Les dernières versions", d: "Téléchargez l'installateur à jour dès qu'une nouvelle version sort." },
              { icon: LifeBuoy, t: "Un support qui répond", d: "Ouvrez un ticket et suivez la réponse de l'équipe, au même endroit." },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t}>
                <Icon className="h-6 w-6 text-accent" />
                <p className="mt-3 font-display text-lg font-semibold">{t}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{d}</p>
              </div>
            ))}
          </div>
          <Link href="/inscription" className="btn-ghost mt-10">Créer mon espace client</Link>
        </div>
      </section>

      {/* ---------- Contact band (always navy, like the logo) ---------- */}
      <section className="container pb-16 sm:pb-20">
        <div className="relative overflow-hidden rounded-xl bg-[#010027] text-white ring-1 ring-white/10">
          <div className="absolute inset-y-0 right-0 w-full opacity-50 md:w-[58%] md:opacity-100">
            <Waves streams={4} seed={3} spread={0.8} headScale={0.85} />
          </div>
          <div className="relative flex flex-col gap-6 px-6 py-12 sm:px-10 md:max-w-[52%]">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">Voyez le logiciel tourner avant d&apos;acheter</h2>
              <p className="mt-2 text-white/75">Une démo gratuite, chez vous ou à distance. Un devis pour votre matériel ou votre projet.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={whatsappLink(settings.whatsapp, "Bonjour, je souhaite des informations sur vos logiciels et votre matériel.")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn h-12 bg-white px-6 text-base text-[#010027] hover:bg-white/90"
              >
                <MessageCircle className="h-5 w-5" /> WhatsApp
              </a>
              <Link href="/contact?type=demo" className="btn h-12 border border-white/30 px-6 text-base text-white hover:bg-white/10">
                Formulaire de contact
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
