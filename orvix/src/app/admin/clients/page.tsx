import Link from "next/link";
import { Search, Ban, CircleCheck, KeyRound } from "lucide-react";
import { PageHeader, Empty } from "@/components/dashboard-shell";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { setClientBlocked } from "@/app/actions/admin";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { date } from "@/lib/format";
import type { Profile } from "@/lib/types";

export default async function AdminClients({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { user } = await requireAdmin();
  const q = ((await searchParams).q ?? "").trim().slice(0, 80);
  const supabase = await createClient();
  const [{ data }, { data: lic }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(1000),
    supabase.from("licenses").select("user_id").eq("status", "active"),
  ]);
  const counts = new Map<string, number>();
  for (const l of lic ?? []) counts.set(l.user_id, (counts.get(l.user_id) ?? 0) + 1);

  let rows = (data ?? []) as Profile[];
  if (q) {
    const n = q.toLowerCase();
    rows = rows.filter((p) => [p.full_name, p.email, p.phone, p.company, p.wilaya].some((v) => v?.toLowerCase().includes(n)));
  }

  return (
    <>
      <PageHeader title="Clients" description={`${rows.length} compte${rows.length > 1 ? "s" : ""}. Un compte bloqué ne peut plus se connecter ni télécharger.`} />
      <form className="relative mb-4 max-w-md" role="search">
        <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted" />
        <input name="q" defaultValue={q} className="field pl-9" placeholder="Nom, e-mail, téléphone, commerce" aria-label="Rechercher" />
      </form>
      {rows.length === 0 ? (
        <Empty title="Aucun client trouvé" />
      ) : (
        <ul className="panel divide-y divide-line">
          {rows.map((p) => (
            <li key={p.id} className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-semibold">
                  {p.full_name || "Sans nom"}
                  {p.role === "admin" && <span className="chip bg-gold/15 text-gold">Admin</span>}
                  {p.is_blocked && <span className="chip bg-danger/10 text-danger">Bloqué</span>}
                </p>
                <p className="truncate text-sm text-muted">{[p.company, p.email, p.phone, p.wilaya].filter(Boolean).join(" / ")}</p>
                <p className="text-xs text-muted">Inscrit le {date(p.created_at)}, {counts.get(p.id) ?? 0} licence(s) active(s)</p>
              </div>
              {p.role === "client" && p.id !== user.id && (
                <div className="flex gap-2">
                  <Link href={`/admin/licences?client=${p.id}`} className="btn-ghost h-9"><KeyRound className="h-4 w-4" /> Licence</Link>
                  <form action={setClientBlocked}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="blocked" value={p.is_blocked ? "0" : "1"} />
                    {p.is_blocked ? (
                      <button className="btn-ghost h-9"><CircleCheck className="h-4 w-4" /> Débloquer</button>
                    ) : (
                      <ConfirmButton message={`Bloquer ${p.full_name || p.email} ?`}><Ban className="h-4 w-4" /> Bloquer</ConfirmButton>
                    )}
                  </form>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
