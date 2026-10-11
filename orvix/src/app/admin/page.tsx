import Link from "next/link";
import { Users, KeyRound, Inbox, LifeBuoy } from "lucide-react";
import { PageHeader } from "@/components/dashboard-shell";
import { StatusBadge } from "@/components/status-badge";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { REQUEST_KIND_LABEL, REQUEST_STATUS_LABEL, TICKET_STATUS_LABEL, date } from "@/lib/format";
import type { RequestRow, Ticket } from "@/lib/types";

export default async function AdminHome() {
  await requireAdmin();
  const supabase = await createClient();
  const head = { count: "exact" as const, head: true };
  const [clients, licences, newReqs, openTickets, reqs, tickets] = await Promise.all([
    supabase.from("profiles").select("id", head).eq("role", "client"),
    supabase.from("licenses").select("id", head).eq("status", "active"),
    supabase.from("requests").select("id", head).eq("status", "nouvelle"),
    supabase.from("tickets").select("id", head).in("status", ["ouvert"]),
    supabase.from("requests").select("*, products(name)").order("created_at", { ascending: false }).limit(6),
    supabase.from("tickets").select("*, profiles(full_name)").in("status", ["ouvert", "en_attente"]).order("updated_at", { ascending: false }).limit(6),
  ]);

  const stats = [
    { href: "/admin/demandes", icon: Inbox, label: "Nouvelles demandes", value: newReqs.count ?? 0, hot: (newReqs.count ?? 0) > 0 },
    { href: "/admin/support", icon: LifeBuoy, label: "Tickets sans réponse", value: openTickets.count ?? 0, hot: (openTickets.count ?? 0) > 0 },
    { href: "/admin/licences", icon: KeyRound, label: "Licences actives", value: licences.count ?? 0 },
    { href: "/admin/clients", icon: Users, label: "Clients inscrits", value: clients.count ?? 0 },
  ];
  const requests = (reqs.data ?? []) as (RequestRow & { products: { name: string } | null })[];
  const openList = (tickets.data ?? []) as (Ticket & { profiles: { full_name: string } | null })[];

  return (
    <>
      <PageHeader title="Tableau de bord" description="Ce qui attend une action de votre part." />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map(({ href, icon: Icon, label, value, hot }) => (
          <Link key={href} href={href} className={`panel p-4 sm:p-5 hover:border-brand/50 ${hot ? "border-brand/60" : ""}`}>
            <Icon className={`h-5 w-5 ${hot ? "text-brand-strong" : "text-muted"}`} />
            <p className="mt-3 font-display text-3xl font-bold">{value}</p>
            <p className="text-sm text-muted">{label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-8 xl:grid-cols-2">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Dernières demandes</h2>
            <Link href="/admin/demandes" className="btn-quiet">Toutes</Link>
          </div>
          <ul className="panel divide-y divide-line">
            {requests.length === 0 && <li className="p-4 text-sm text-muted">Aucune demande reçue.</li>}
            {requests.map((r) => (
              <li key={r.id}>
                <Link href={`/admin/demandes?id=${r.id}`} className="flex items-center gap-3 p-4 hover:bg-surface">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{r.name}{r.company ? `, ${r.company}` : ""}</p>
                    <p className="truncate text-xs text-muted">{REQUEST_KIND_LABEL[r.kind]}{r.products ? ` : ${r.products.name}` : ""}, {date(r.created_at, true)}</p>
                  </div>
                  <StatusBadge value={r.status} label={REQUEST_STATUS_LABEL[r.status]} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Tickets en cours</h2>
            <Link href="/admin/support" className="btn-quiet">Tous</Link>
          </div>
          <ul className="panel divide-y divide-line">
            {openList.length === 0 && <li className="p-4 text-sm text-muted">Aucun ticket en cours.</li>}
            {openList.map((t) => (
              <li key={t.id}>
                <Link href={`/admin/support/${t.id}`} className="flex items-center gap-3 p-4 hover:bg-surface">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{t.subject}</p>
                    <p className="truncate text-xs text-muted">{t.profiles?.full_name ?? "Client"}, {date(t.updated_at, true)}</p>
                  </div>
                  {t.priority === "urgente" && <StatusBadge value="urgente" label="Urgent" />}
                  <StatusBadge value={t.status} label={TICKET_STATUS_LABEL[t.status]} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
