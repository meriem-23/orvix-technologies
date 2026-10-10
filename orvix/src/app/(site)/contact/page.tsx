import type { Metadata } from "next";
import { MessageCircle, Phone, Mail } from "lucide-react";
import { RequestForm } from "@/components/request-form";
import { getProducts, getSettings } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { whatsappLink } from "@/lib/site";
import type { RequestKind } from "@/lib/types";

export const metadata: Metadata = { title: "Contact et démo" };

const KINDS = ["demo", "achat", "sur_mesure", "contact"];

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ type?: string; logiciel?: string }> }) {
  const sp = await searchParams;
  const [products, settings, current] = await Promise.all([getProducts(), getSettings(), getCurrentUser()]);
  const kind = (KINDS.includes(sp.type ?? "") ? sp.type : "demo") as RequestKind;
  const product = products.some((p) => p.slug === sp.logiciel) ? sp.logiciel : "";
  const pr = current?.profile;

  return (
    <div className="container grid gap-12 py-12 sm:py-16 lg:grid-cols-[1fr_1.5fr]">
      <div>
        <h1 className="text-4xl font-bold sm:text-5xl">Parlons de votre activité</h1>
        <p className="mt-4 max-w-md text-muted">
          Démo, achat ou projet sur mesure : laissez votre demande, ou écrivez-nous directement.
        </p>
        <ul className="mt-8 space-y-3">
          <li>
            <a href={whatsappLink(settings.whatsapp)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-md border border-line bg-raised p-4 hover:border-brand/50">
              <MessageCircle className="h-5 w-5 text-ok" />
              <span><span className="block text-sm font-semibold">WhatsApp</span><span className="text-sm text-muted">{settings.phone}</span></span>
            </a>
          </li>
          <li>
            <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 rounded-md border border-line bg-raised p-4 hover:border-brand/50">
              <Phone className="h-5 w-5 text-brand-strong" />
              <span><span className="block text-sm font-semibold">Téléphone</span><span className="text-sm text-muted">{settings.phone}</span></span>
            </a>
          </li>
          <li>
            <a href={`mailto:${settings.email}`} className="flex items-center gap-3 rounded-md border border-line bg-raised p-4 hover:border-brand/50">
              <Mail className="h-5 w-5 text-gold" />
              <span><span className="block text-sm font-semibold">E-mail</span><span className="text-sm text-muted">{settings.email}</span></span>
            </a>
          </li>
        </ul>
      </div>
      <div className="panel p-5 sm:p-8">
        <RequestForm
          products={products.map((p) => ({ slug: p.slug, name: p.name }))}
          defaults={{ kind, product, name: pr?.full_name, email: pr?.email, phone: pr?.phone, company: pr?.company }}
        />
      </div>
    </div>
  );
}
