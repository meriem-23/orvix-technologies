import { PageHeader } from "@/components/dashboard-shell";
import { StatusBadge } from "@/components/status-badge";
import { RequestForm } from "@/components/request-form";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getProducts } from "@/lib/data";
import { REQUEST_KIND_LABEL, REQUEST_STATUS_LABEL, date } from "@/lib/format";
import type { RequestRow } from "@/lib/types";

export default async function RequestsPage() {
  const { profile } = await requireUser();
  const supabase = await createClient();
  const [{ data }, products] = await Promise.all([
    supabase.from("requests").select("*, products(name)").eq("user_id", profile.id).order("created_at", { ascending: false }),
    getProducts(),
  ]);
  const rows = (data ?? []) as (RequestRow & { products: { name: string } | null })[];

  return (
    <>
      <PageHeader title="Demandes et devis" description="Démo, achat d'un logiciel ou projet sur mesure : suivez ici la réponse de l'équipe." />
      <div className="grid gap-8 xl:grid-cols-[1fr_1.1fr]">
        <section>
          <h2 className="mb-3 text-lg font-semibold">Mes demandes</h2>
          {rows.length === 0 ? (
            <p className="panel p-5 text-sm text-muted">Aucune demande envoyée. Utilisez le formulaire pour en faire une.</p>
          ) : (
            <ul className="grid gap-3">
              {rows.map((r) => (
                <li key={r.id} className="panel p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">{REQUEST_KIND_LABEL[r.kind]}{r.products ? ` : ${r.products.name}` : ""}</p>
                    <StatusBadge value={r.status} label={REQUEST_STATUS_LABEL[r.status]} />
                  </div>
                  <p className="mt-1 text-xs text-muted">Envoyée le {date(r.created_at, true)}</p>
                  <p className="mt-3 line-clamp-3 whitespace-pre-line text-sm">{r.message}</p>
                  {r.admin_note && (
                    <div className="mt-3 rounded-md border-l-2 border-brand bg-surface px-3 py-2 text-sm">
                      <p className="text-xs font-semibold text-muted">Réponse de l&apos;équipe</p>
                      <p className="mt-1 whitespace-pre-line">{r.admin_note}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="panel p-5 sm:p-6 h-fit">
          <h2 className="mb-5 text-lg font-semibold">Nouvelle demande</h2>
          <RequestForm
            products={products.map((p) => ({ slug: p.slug, name: p.name }))}
            defaults={{ kind: "achat", name: profile.full_name, email: profile.email, phone: profile.phone, company: profile.company }}
          />
        </section>
      </div>
    </>
  );
}
