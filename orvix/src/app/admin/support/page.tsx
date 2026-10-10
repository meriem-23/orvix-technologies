import Link from "next/link";
import { PageHeader, Empty } from "@/components/dashboard-shell";
import { StatusBadge } from "@/components/status-badge";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { TICKET_STATUS_LABEL, date } from "@/lib/format";
import type { Ticket, TicketStatus } from "@/lib/types";

const FILTERS: { v: TicketStatus | "actifs" | "tous"; l: string }[] = [
  { v: "actifs", l: "À traiter" },
  { v: "en_attente", l: "Attente client" },
  { v: "resolu", l: "Résolus" },
  { v: "ferme", l: "Fermés" },
  { v: "tous", l: "Tous" },
];

export default async function AdminSupport({ searchParams }: { searchParams: Promise<{ statut?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const filter = FILTERS.find((f) => f.v === sp.statut)?.v ?? "actifs";
  const supabase = await createClient();
  let query = supabase.from("tickets").select("*, products(name), profiles(full_name,company)").order("updated_at", { ascending: false }).limit(200);
  if (filter === "actifs") query = query.eq("status", "ouvert");
  else if (filter !== "tous") query = query.eq("status", filter);
  const { data } = await query;
  const rows = (data ?? []) as (Ticket & { products: { name: string } | null; profiles: { full_name: string; company: string } | null })[];

  return (
    <>
      <PageHeader title="Support" description="« À traiter » = le client attend une réponse de votre part." />
      <nav className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0" aria-label="Filtrer">
        {FILTERS.map((f) => (
          <Link key={f.v} href={`/admin/support?statut=${f.v}`} aria-current={filter === f.v ? "page" : undefined}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium ${filter === f.v ? "border-brand bg-brand text-brand-ink" : "border-line text-muted hover:text-ink"}`}>
            {f.l}
          </Link>
        ))}
      </nav>
      {rows.length === 0 ? (
        <Empty title="Aucun ticket">Rien à traiter pour l&apos;instant.</Empty>
      ) : (
        <ul className="panel divide-y divide-line">
          {rows.map((t) => (
            <li key={t.id}>
              <Link href={`/admin/support/${t.id}`} className="flex flex-col gap-2 p-4 hover:bg-surface sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{t.subject}</p>
                  <p className="truncate text-xs text-muted">
                    {t.profiles?.full_name ?? "Client"}{t.profiles?.company ? `, ${t.profiles.company}` : ""} / {t.products?.name ?? "Général"} / {date(t.updated_at, true)}
                  </p>
                </div>
                <div className="flex gap-2">
                  {t.priority === "urgente" && <StatusBadge value="urgente" label="Urgent" />}
                  <StatusBadge value={t.status} label={TICKET_STATUS_LABEL[t.status]} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
