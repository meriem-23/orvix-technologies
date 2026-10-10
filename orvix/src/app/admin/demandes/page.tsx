import Link from "next/link";
import { Phone, Mail, MessageCircle, Trash2, UserRound } from "lucide-react";
import { PageHeader, Empty } from "@/components/dashboard-shell";
import { StatusBadge } from "@/components/status-badge";
import { RequestAdminForm } from "@/components/admin/request-admin-form";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { deleteRequest } from "@/app/actions/admin";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { REQUEST_KIND_LABEL, REQUEST_STATUS_LABEL, date } from "@/lib/format";
import { whatsappLink } from "@/lib/site";
import type { RequestRow, RequestStatus } from "@/lib/types";

const FILTERS: { v: RequestStatus | "toutes"; l: string }[] = [
  { v: "nouvelle", l: "Nouvelles" },
  { v: "en_cours", l: "En cours" },
  { v: "traitee", l: "Traitées" },
  { v: "refusee", l: "Refusées" },
  { v: "toutes", l: "Toutes" },
];

/** Algerian local numbers → international for WhatsApp (0668… → 213668…). */
function toWhatsapp(phone: string) {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("213")) return d;
  if (d.startsWith("0")) return "213" + d.slice(1);
  return d;
}

export default async function AdminRequests({ searchParams }: { searchParams: Promise<{ statut?: string; id?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const filter = FILTERS.find((f) => f.v === sp.statut)?.v ?? (sp.id ? "toutes" : "nouvelle");
  const supabase = await createClient();
  let query = supabase.from("requests").select("*, products(name)").order("created_at", { ascending: false }).limit(200);
  if (filter !== "toutes") query = query.eq("status", filter);
  const { data } = await query;
  const rows = (data ?? []) as (RequestRow & { products: { name: string } | null })[];

  return (
    <>
      <PageHeader title="Demandes" description="Démos, achats, projets sur mesure et messages du formulaire de contact." />
      <nav className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0" aria-label="Filtrer">
        {FILTERS.map((f) => (
          <Link key={f.v} href={`/admin/demandes?statut=${f.v}`} aria-current={filter === f.v ? "page" : undefined}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium ${filter === f.v ? "border-brand bg-brand text-brand-ink" : "border-line text-muted hover:text-ink"}`}>
            {f.l}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <Empty title="Rien ici">Aucune demande avec ce statut.</Empty>
      ) : (
        <ul className="grid gap-3">
          {rows.map((r) => (
            <li key={r.id}>
              <details open={sp.id === r.id || rows.length === 1} className="panel group">
                <summary className="flex cursor-pointer list-none flex-col gap-2 p-4 sm:flex-row sm:items-center [&::-webkit-details-marker]:hidden">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{r.name}{r.company ? `, ${r.company}` : ""}</p>
                    <p className="truncate text-xs text-muted">{REQUEST_KIND_LABEL[r.kind]}{r.products ? ` : ${r.products.name}` : ""}, {date(r.created_at, true)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {r.user_id && <span className="chip border border-line text-muted"><UserRound className="h-3 w-3" /> Client inscrit</span>}
                    <StatusBadge value={r.status} label={REQUEST_STATUS_LABEL[r.status]} />
                  </div>
                </summary>
                <div className="border-t border-line p-4">
                  <div className="flex flex-wrap gap-2">
                    {r.phone && (
                      <>
                        <a href={`tel:${r.phone.replace(/\s/g, "")}`} className="btn-ghost h-9"><Phone className="h-4 w-4" /> {r.phone}</a>
                        <a href={whatsappLink(toWhatsapp(r.phone))} target="_blank" rel="noopener noreferrer" className="btn-ghost h-9"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
                      </>
                    )}
                    <a href={`mailto:${r.email}`} className="btn-ghost h-9"><Mail className="h-4 w-4" /> {r.email}</a>
                    {r.user_id && <Link href={`/admin/licences?client=${r.user_id}`} className="btn-ghost h-9">Créer une licence</Link>}
                  </div>
                  {r.budget && <p className="mt-4 text-sm"><span className="text-muted">Budget : </span>{r.budget}</p>}
                  <p className="mt-3 whitespace-pre-line break-words rounded-md bg-surface p-3 text-sm leading-relaxed">{r.message}</p>
                  <div className="mt-5"><RequestAdminForm id={r.id} status={r.status} note={r.admin_note} hasAccount={!!r.user_id} /></div>
                  <form action={deleteRequest} className="mt-3">
                    <input type="hidden" name="id" value={r.id} />
                    <ConfirmButton message="Supprimer cette demande ?"><Trash2 className="h-4 w-4" /> Supprimer</ConfirmButton>
                  </form>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
