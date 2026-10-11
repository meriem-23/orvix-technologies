import type { Metadata } from "next";
import { DashboardShell, type NavItem } from "@/components/dashboard-shell";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Espace client", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireUser();
  const supabase = await createClient();
  const { count: replies } = await supabase
    .from("tickets")
    .select("id", { count: "exact", head: true })
    .eq("user_id", profile.id)
    .eq("status", "en_attente");

  const nav: NavItem[] = [
    { href: "/espace", label: "Vue d'ensemble", icon: "overview" },
    { href: "/espace/licences", label: "Mes licences", icon: "licenses" },
    { href: "/espace/telechargements", label: "Téléchargements", icon: "downloads" },
    { href: "/espace/demandes", label: "Demandes et devis", icon: "requests" },
    { href: "/espace/support", label: "Support", icon: "support", badge: replies ?? 0 },
    { href: "/espace/profil", label: "Mon profil", icon: "profile" },
  ];
  if (profile.role === "admin") nav.push({ href: "/admin", label: "Administration", icon: "security" });

  return (
    <DashboardShell nav={nav} title="Client" home="/espace" user={{ name: profile.full_name, email: profile.email }}>
      {children}
    </DashboardShell>
  );
}
