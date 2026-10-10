import Link from "next/link";
import { Mail, Phone, MessageCircle } from "lucide-react";
import { Logo } from "./logo";
import { SITE, whatsappLink } from "@/lib/site";
import type { Settings } from "@/lib/data";

export function SiteFooter({ settings }: { settings: Settings }) {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="container grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-muted">{SITE.description}</p>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Site</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li><Link className="hover:text-ink" href="/logiciels">Logiciels</Link></li>
            <li><Link className="hover:text-ink" href="/sur-mesure">Sites et logiciels sur mesure</Link></li>
            <li><Link className="hover:text-ink" href="/espace">Espace client</Link></li>
            <li><Link className="hover:text-ink" href="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Nous joindre</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <a className="inline-flex items-center gap-2 hover:text-ink" href={whatsappLink(settings.whatsapp)} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" /> WhatsApp {settings.phone}
              </a>
            </li>
            <li>
              <a className="inline-flex items-center gap-2 hover:text-ink" href={`tel:${settings.phone.replace(/\s/g, "")}`}>
                <Phone className="h-4 w-4" /> {settings.phone}
              </a>
            </li>
            <li>
              <a className="inline-flex items-center gap-2 hover:text-ink" href={`mailto:${settings.email}`}>
                <Mail className="h-4 w-4" /> {settings.email}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container flex flex-col gap-2 py-5 text-xs text-muted sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {SITE.fullName}. Tous droits réservés.</p>
          <p>{settings.city}</p>
        </div>
      </div>
    </footer>
  );
}
