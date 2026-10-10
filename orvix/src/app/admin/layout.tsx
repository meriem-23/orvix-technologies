import type { Metadata } from "next";
import { DashboardShell, type NavItem } from "@/components/dashboard-shell";
import { adminMfaState, requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Administration", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Each page calls requireAdmin() itself (strict, with 2FA). The layout only
  // needs to know the user is an admin to draw the navigation.
  const { profile } = await requireAdmin({ allowMfaSetup: true });
  const mfa = await adminMfaState();

  let nav: NavItem[] = [{ href: "/admin/securite", label: "Sécurité du compte", icon: "security" }];
  if (mfa === "ok") {
    const supabase = await createClient();
    const [reqs, tickets] = await Promise.all([
      supabase.from("requests").select("id", { count: "exact", head: true }).eq("status", "nouvelle"),
      supabase.from("tickets").select("id", { count: "exact", head: true }).eq("status", "ouvert"),
    ]);
    nav = [
      { href: "/admin", label: "Tableau de bord", icon: "overview" },
      { href: "/admin/demandes", label: "Demandes", icon: "requests", badge: reqs.count ?? 0 },
      { href: "/admin/support", label: "Support", icon: "support", badge: tickets.count ?? 0 },
      { href: "/admin/licences", label: "Licences", icon: "licenses" },
      { href: "/admin/logiciels", label: "Logiciels", icon: "products" },
      { href: "/admin/clients", label: "Clients", icon: "clients" },
      { href: "/admin/parametres", label: "Paramètres du site", icon: "settings" },
      { href: "/admin/journal", label: "Journal d'activité", icon: "audit" },
      { href: "/admin/securite", label: "Sécurité du compte", icon: "security" },
    ];
  }

  return (
    <DashboardShell nav={nav} title="Admin" home="/admin" user={{ name: profile.full_name, email: profile.email }}>
      {children}
    </DashboardShell>
  );
}
