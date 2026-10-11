"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, KeyRound, Download, Inbox, LifeBuoy, UserRound, AppWindow,
  Users, Settings, ShieldCheck, ScrollText, LogOut, Menu, X, ExternalLink,
} from "lucide-react";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme";
import { signOut } from "@/app/actions/auth";

const ICONS = {
  overview: LayoutDashboard, licenses: KeyRound, downloads: Download, requests: Inbox,
  support: LifeBuoy, profile: UserRound, products: AppWindow, clients: Users,
  settings: Settings, security: ShieldCheck, audit: ScrollText,
};
export type NavItem = { href: string; label: string; icon: keyof typeof ICONS; badge?: number };

export function DashboardShell({
  nav, title, user, children, home,
}: {
  nav: NavItem[];
  title: string;
  home: string;
  user: { name: string; email: string };
  children: React.ReactNode;
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);

  const isActive = (href: string) => (href === home ? path === home : path === href || path.startsWith(href + "/"));

  const links = (
    <nav className="flex flex-col gap-0.5" aria-label={title}>
      {nav.map((n) => {
        const Icon = ICONS[n.icon];
        const active = isActive(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm ${
              active ? "bg-grad text-white font-semibold shadow-glow" : "text-muted hover:bg-raised hover:text-ink"
            }`}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" />
            <span className="flex-1">{n.label}</span>
            {!!n.badge && (
              <span className={`min-w-5 rounded-full px-1.5 text-center text-[11px] font-bold leading-5 ${active ? "bg-white/20" : "bg-brand text-brand-ink"}`}>
                {n.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="border-t border-line pt-4">
      <div className="px-3">
        <p className="truncate text-sm font-semibold">{user.name || "Mon compte"}</p>
        <p className="truncate text-xs text-muted">{user.email}</p>
      </div>
      <div className="mt-3 flex items-center gap-2 px-1">
        <ThemeToggle />
        <Link href="/" className="btn-quiet" title="Voir le site"><ExternalLink className="h-4 w-4" /> Site</Link>
        <form action={signOut} className="ml-auto">
          <button type="submit" className="btn-quiet" title="Se déconnecter"><LogOut className="h-4 w-4" /> Quitter</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-bg lg:grid lg:grid-cols-[260px_1fr]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex sticky top-0 h-dvh flex-col gap-6 border-r border-line bg-surface p-4">
        <div className="px-2 pt-1"><Logo href={home} tag={title} /></div>
        <div className="flex-1 overflow-y-auto">{links}</div>
        {footer}
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-bg/90 px-4 backdrop-blur-md">
        <Logo href={home} tag={title} />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line"
          aria-expanded={open}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>
      {open && (
        <div className="lg:hidden fixed inset-x-0 top-14 bottom-0 z-40 flex flex-col gap-4 overflow-y-auto bg-surface p-4">
          {links}
          {footer}
        </div>
      )}

      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Empty({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-line px-6 py-12 text-center">
      <p className="font-display font-semibold">{title}</p>
      {children && <div className="mx-auto mt-2 max-w-md text-sm text-muted">{children}</div>}
    </div>
  );
}
