"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, UserRound } from "lucide-react";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme";

const NAV = [
  { href: "/logiciels", label: "Logiciels" },
  { href: "/materiel", label: "Matériel et publicité" },
  { href: "/sur-mesure", label: "Sur mesure" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ signedIn, isAdmin }: { signedIn: boolean; isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const account = signedIn
    ? { href: isAdmin ? "/admin" : "/espace", label: isAdmin ? "Administration" : "Mon espace" }
    : { href: "/connexion", label: "Se connecter" };

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/85 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden lg:flex items-center gap-1" aria-label="Navigation principale">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={path.startsWith(n.href) ? "page" : undefined}
              className={`relative rounded-md px-3 py-2 text-sm font-medium ${path.startsWith(n.href) ? "text-ink" : "text-muted hover:text-ink"}`}
            >
              {n.label}
              {path.startsWith(n.href) && <span className="bg-grad absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full" />}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href={account.href} className="btn-ghost hidden sm:inline-flex h-10">
            <UserRound className="h-4 w-4" /> {account.label}
          </Link>
          <Link href="/contact" className="btn-primary hidden lg:inline-flex h-10">
            Demander un devis
          </Link>
          <button
            type="button"
            className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-md border border-line"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" className="lg:hidden fixed inset-x-0 top-16 bottom-0 z-40 bg-bg border-t border-line overflow-y-auto">
          <nav className="container flex flex-col py-4" aria-label="Navigation mobile">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="border-b border-line py-4 font-display text-2xl font-semibold">
                {n.label}
              </Link>
            ))}
            <Link href={account.href} className="border-b border-line py-4 font-display text-2xl font-semibold">
              {account.label}
            </Link>
            <Link href="/contact" className="btn-primary mt-6 h-12 text-base">
              Demander un devis
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
