import { PageHeader, Empty } from "@/components/dashboard-shell";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { date } from "@/lib/format";

const ACTION: Record<string, string> = {
  create: "a créé", update: "a modifié", delete: "a supprimé", status: "a changé le statut de",
  block: "a bloqué", unblock: "a débloqué", unpublish: "a masqué", reset_devices: "a libéré les postes pour",
};
const ENTITY: Record<string, string> = {
  product: "un logiciel", release: "une version", license: "une licence", request: "une demande",
  ticket: "un ticket", profile: "un client", settings: "les paramètres",
};

export default async function AuditPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("audit_log")
    .select("id,action,entity,entity_id,meta,created_at,profiles(full_name,email)")
    .order("created_at", { ascending: false })
    .limit(200);
  const rows = (data ?? []) as unknown as { id: number; action: string; entity: string; meta: Record<string, unknown>; created_at: string; profiles: { full_name: string; email: string } | null }[];

  return (
    <>
      <PageHeader title="Journal d'activité" description="Les 200 dernières actions faites dans l'administration." />
      {rows.length === 0 ? (
        <Empty title="Aucune action enregistrée" />
      ) : (
        <ol className="panel divide-y divide-line text-sm">
          {rows.map((r) => {
            const detail = (r.meta.name ?? r.meta.version ?? r.meta.status) as string | undefined;
            return (
              <li key={r.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
                <span className="w-40 shrink-0 text-xs text-muted">{date(r.created_at, true)}</span>
                <span>
                  <span className="font-semibold">{r.profiles?.full_name || r.profiles?.email || "Admin"}</span>{" "}
                  {ACTION[r.action] ?? r.action} {ENTITY[r.entity] ?? r.entity}
                  {detail && <span className="text-muted"> ({detail})</span>}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </>
  );
}
