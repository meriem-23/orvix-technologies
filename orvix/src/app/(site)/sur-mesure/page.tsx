import Link from "next/link";
import type { Metadata } from "next";
import { Globe, Code2, Smartphone, ShieldCheck, Gauge, Languages } from "lucide-react";

export const metadata: Metadata = { title: "Sites et logiciels sur mesure" };

const OFFERS = [
  { icon: Globe, t: "Sites web", d: "Site vitrine, prise de rendez-vous, réservation en ligne, boutique. Administrable par vous, rapide sur mobile.", ex: ["Cabinets et cliniques", "Agences de voyage", "Restaurants", "Boutiques"] },
  { icon: Code2, t: "Logiciels sur mesure", d: "Vos règles de gestion, vos documents, vos rapports. Sur poste Windows ou dans le navigateur.", ex: ["Gestion commerciale", "Caisse et stock", "Facturation", "Suivi de dossiers"] },
  { icon: Smartphone, t: "Applications mobiles", d: "Applications Android et iOS, ou web installables, connectées à vos données.", ex: ["Fidélité clients", "Commande en ligne", "Suivi terrain", "Communauté"] },
];

export default function CustomPage() {
  return (
    <>
      <section className="container py-12 sm:py-16">
        <h1 className="max-w-3xl text-4xl font-bold sm:text-5xl">Sites et logiciels développés pour votre activité</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          Quand un logiciel du catalogue ne suffit pas, nous construisons l&apos;outil exact dont vous avez besoin.
        </p>
        <Link href="/contact?type=sur_mesure" className="btn-primary mt-8 h-12 px-6 text-base">Décrire mon projet</Link>
      </section>

      <section className="border-y border-line bg-surface">
        <div className="container grid gap-px py-0 md:grid-cols-3">
          {OFFERS.map(({ icon: Icon, t, d, ex }) => (
            <div key={t} className="border-b border-line py-10 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0">
              <Icon className="h-7 w-7 text-brand-strong" />
              <h2 className="mt-4 text-2xl font-semibold">{t}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{d}</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {ex.map((e) => <li key={e} className="rounded-md border border-line bg-raised px-2.5 py-1 text-xs">{e}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="container py-16">
        <h2 className="text-3xl font-bold">Ce qui est inclus dans chaque projet</h2>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {[
            { icon: ShieldCheck, t: "Sécurité", d: "Connexions chiffrées, mots de passe protégés, accès par rôle et sauvegardes." },
            { icon: Gauge, t: "Performance", d: "Pages rapides sur mobile et sur les connexions lentes." },
            { icon: Languages, t: "Multilingue", d: "Français, arabe et anglais, y compris l'affichage de droite à gauche." },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="flex gap-4">
              <Icon className="h-6 w-6 shrink-0 text-accent" />
              <div>
                <p className="font-display font-semibold">{t}</p>
                <p className="mt-1 text-sm text-muted">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
