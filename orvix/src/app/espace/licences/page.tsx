import Link from "next/link";
import { PageHeader, Empty } from "@/components/dashboard-shell";
import { StatusBadge } from "@/components/status-badge";
import { ProductIcon } from "@/components/product-icon";
import { LicenseKey } from "@/components/license-key";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { LICENSE_STATUS_LABEL, date } from "@/lib/format";
import type { License } from "@/lib/types";

type Row = License & { products: { name: string; slug: string } | null; license_activations: { device_name: string }[] };

export default async function LicensesPage() {
  const { profile } = await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("licenses")
    .select("*, products(name,slug), license_activations(device_name)")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });
  const rows = (data ?? []) as Row[];

  return (
    <>
      <PageHeader title="Mes licences" description="La clé sert à activer le logiciel sur votre poste. Ne la partagez pas : elle est liée à votre compte." />
      {rows.length === 0 ? (
        <Empty title="Aucune licence pour le moment">
          Votre clé apparaît ici dès que l&apos;achat est validé. <Link href="/espace/demandes" className="font-semibold text-brand-strong">Faire une demande d&apos;achat</Link>
        </Empty>
      ) : (
        <ul className="grid gap-4 xl:grid-cols-2">
          {rows.map((l) => {
            const expired = l.expires_at && new Date(l.expires_at) < new Date();
            const status = expired && l.status === "active" ? "expiree" : l.status;
            return (
              <li key={l.id} className="panel p-5">
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-grad text-white">
                    <ProductIcon slug={l.products?.slug ?? ""} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-display text-lg font-semibold">{l.products?.name ?? "Logiciel"}</p>
                      <StatusBadge value={status} label={LICENSE_STATUS_LABEL[status]} />
                    </div>
                    <dl className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
                      <div><dt className="inline">Depuis le </dt><dd className="inline">{date(l.created_at)}</dd></div>
                      <div><dt className="inline">Expiration : </dt><dd className="inline">{l.expires_at ? date(l.expires_at) : "à vie"}</dd></div>
                      <div><dt className="inline">Postes activés : </dt><dd className="inline">{l.license_activations.length}/{l.max_devices}</dd></div>
                    </dl>
                  </div>
                </div>
                <div className="mt-4"><LicenseKey value={l.license_key} /></div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
