import { Search, Trash2 } from "lucide-react";
import { PageHeader, Empty } from "@/components/dashboard-shell";
import { StatusBadge } from "@/components/status-badge";
import { LicenseKey } from "@/components/license-key";
import { LicenseForm } from "@/components/admin/license-form";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { deleteLicense, resetActivations, setLicenseStatus } from "@/app/actions/admin";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { LICENSE_STATUS_LABEL, date } from "@/lib/format";
import type { License } from "@/lib/types";

type Row = License & {
  products: { name: string } | null;
  profiles: { full_name: string; email: string; company: string } | null;
  license_activations: { device_name: string; last_seen_at: string }[];
};

export default async function AdminLicenses({ searchParams }: { searchParams: Promise<{ q?: string; client?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 80);
  const supabase = await createClient();

  const [lic, clients, products] = await Promise.all([
    supabase.from("licenses").select("*, products(name), profiles(full_name,email,company), license_activations(device_name,last_seen_at)").order("created_at", { ascending: false }).limit(300),
    supabase.from("profiles").select("id,full_name,email,company").eq("is_blocked", false).order("full_name").limit(1000),
    supabase.from("products").select("id,name").eq("kind", "logiciel").order("sort_order"),
  ]);

  let rows = (lic.data ?? []) as Row[];
  if (q) {
    const n = q.toLowerCase();
    rows = rows.filter((r) =>
      [r.license_key, r.profiles?.full_name, r.profiles?.email, r.profiles?.company, r.products?.name]
        .some((v) => v?.toLowerCase().includes(n)),
    );
  }

  return (
    <>
      <PageHeader title="Licences" description="Générez une clé après chaque vente. Le client la voit tout de suite dans son espace." />
      <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
        <section className="min-w-0">
          <form className="relative mb-4" role="search">
            <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted" />
            <input name="q" defaultValue={q} className="field pl-9" placeholder="Rechercher une clé, un client, un logiciel" aria-label="Rechercher" />
          </form>
          {rows.length === 0 ? (
            <Empty title={q ? "Aucun résultat" : "Aucune licence"}>{q ? "Essayez avec une partie de la clé ou l'e-mail du client." : "Créez la première avec le formulaire."}</Empty>
          ) : (
            <ul className="grid gap-3">
              {rows.map((l) => (
                <li key={l.id} className="panel p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold">{l.products?.name}</p>
                      <p className="truncate text-sm text-muted">{l.profiles?.full_name}{l.profiles?.company ? `, ${l.profiles.company}` : ""} ({l.profiles?.email})</p>
                    </div>
                    <StatusBadge value={l.status} label={LICENSE_STATUS_LABEL[l.status]} />
                  </div>
                  <div className="mt-3"><LicenseKey value={l.license_key} /></div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
                    <span>Créée le {date(l.created_at)}</span>
                    <span>Expire : {l.expires_at ? date(l.expires_at) : "jamais"}</span>
                    <span title={l.license_activations.map((a) => a.device_name || "PC").join(", ")}>
                      Postes activés : {l.license_activations.length}/{l.max_devices}
                    </span>
                    {l.notes && <span className="italic">{l.notes}</span>}
                    <div className="ml-auto flex gap-2">
                      {l.status !== "active" ? (
                        <form action={setLicenseStatus}><input type="hidden" name="id" value={l.id} /><input type="hidden" name="status" value="active" /><button className="btn-quiet">Réactiver</button></form>
                      ) : (
                        <form action={setLicenseStatus}><input type="hidden" name="id" value={l.id} /><input type="hidden" name="status" value="suspendue" /><button className="btn-quiet">Suspendre</button></form>
                      )}
                      {l.license_activations.length > 0 && (
                        <form action={resetActivations}>
                          <input type="hidden" name="id" value={l.id} />
                          <ConfirmButton className="btn-quiet" message="Libérer tous les postes ? Le client devra ressaisir la clé sur chaque PC.">Libérer les postes</ConfirmButton>
                        </form>
                      )}
                      <form action={deleteLicense}>
                        <input type="hidden" name="id" value={l.id} />
                        <ConfirmButton message="Supprimer définitivement cette licence ? Le client perdra l'accès aux téléchargements."><Trash2 className="h-4 w-4" /></ConfirmButton>
                      </form>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
        <aside className="panel order-first h-fit p-5 xl:order-none xl:sticky xl:top-10">
          <h2 className="mb-4 font-semibold">Nouvelle licence</h2>
          <LicenseForm
            defaultClient={sp.client}
            clients={(clients.data ?? []).map((c) => ({ id: c.id, label: `${c.full_name || c.email}${c.company ? ` (${c.company})` : ""}` }))}
            products={products.data ?? []}
          />
        </aside>
      </div>
    </>
  );
}
