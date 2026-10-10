import Link from "next/link";
import { PageHeader } from "@/components/dashboard-shell";
import { StatusBadge } from "@/components/status-badge";
import { NewTicketForm } from "@/components/ticket-forms";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { TICKET_STATUS_LABEL, date } from "@/lib/format";
import type { Ticket } from "@/lib/types";

export default async function SupportPage() {
  const { profile } = await requireUser();
  const supabase = await createClient();
  const [{ data }, { data: lic }] = await Promise.all([
    supabase.from("tickets").select("*, products(name)").eq("user_id", profile.id).order("updated_at", { ascending: false }),
    supabase.from("licenses").select("products(id,name)").eq("user_id", profile.id),
  ]);
  const tickets = (data ?? []) as (Ticket & { products: { name: string } | null })[];
  const owned = new Map<string, string>();
  for (const l of (lic ?? []) as unknown as { products: { id: string; name: string } | null }[]) if (l.products) owned.set(l.products.id, l.products.name);

  return (
    <>
      <PageHeader title="Support" description="Décrivez le problème, l'équipe vous répond ici. Vous voyez chaque réponse dans le ticket." />
      <div className="grid gap-8 xl:grid-cols-[1fr_1.1fr]">
        <section>
          <h2 className="mb-3 text-lg font-semibold">Mes tickets</h2>
          {tickets.length === 0 ? (
            <p className="panel p-5 text-sm text-muted">Aucun ticket. Tout fonctionne ? Tant mieux.</p>
          ) : (
            <ul className="panel divide-y divide-line">
              {tickets.map((t) => (
                <li key={t.id}>
                  <Link href={`/espace/support/${t.id}`} className="flex flex-col gap-2 p-4 hover:bg-surface sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{t.subject}</p>
                      <p className="text-xs text-muted">{t.products?.name ?? "Général"}, mis à jour le {date(t.updated_at, true)}</p>
                    </div>
                    <StatusBadge value={t.status} label={TICKET_STATUS_LABEL[t.status]} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="panel h-fit p-5 sm:p-6">
          <h2 className="mb-5 text-lg font-semibold">Nouveau ticket</h2>
          <NewTicketForm products={[...owned].map(([id, name]) => ({ id, name }))} />
        </section>
      </div>
    </>
  );
}
