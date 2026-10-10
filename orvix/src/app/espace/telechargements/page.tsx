import { Download } from "lucide-react";
import { PageHeader, Empty } from "@/components/dashboard-shell";
import { ProductIcon } from "@/components/product-icon";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { bytes, date } from "@/lib/format";
import type { Release } from "@/lib/types";

type Row = Release & { products: { name: string; slug: string } | null };

export default async function DownloadsPage() {
  await requireUser();
  const supabase = await createClient();
  // RLS only returns releases of products the user holds an active licence for.
  const { data } = await supabase
    .from("releases")
    .select("*, products(name,slug)")
    .order("created_at", { ascending: false });
  const rows = (data ?? []) as Row[];

  const byProduct = new Map<string, Row[]>();
  for (const r of rows) byProduct.set(r.product_id, [...(byProduct.get(r.product_id) ?? []), r]);

  return (
    <>
      <PageHeader title="Téléchargements" description="Installateurs des logiciels pour lesquels vous avez une licence active. Les liens expirent après une minute." />
      {byProduct.size === 0 ? (
        <Empty title="Rien à télécharger pour l'instant">Les installateurs apparaissent ici dès qu&apos;une licence active est liée à votre compte.</Empty>
      ) : (
        <div className="grid gap-6">
          {[...byProduct.values()].map((list) => {
            const [latest, ...older] = list;
            return (
              <section key={latest.product_id} className="panel overflow-hidden">
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-brand text-brand-ink">
                    <ProductIcon slug={latest.products?.slug ?? ""} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-lg font-semibold">{latest.products?.name}</p>
                    <p className="text-sm text-muted">Version {latest.version} · {date(latest.created_at)} · {bytes(latest.file_size)}</p>
                    {latest.notes && <p className="mt-2 whitespace-pre-line text-sm">{latest.notes}</p>}
                  </div>
                  <a href={`/api/telechargement/${latest.id}`} className="btn-primary" rel="nofollow">
                    <Download className="h-4 w-4" /> Télécharger
                  </a>
                </div>
                {older.length > 0 && (
                  <details className="border-t border-line bg-surface px-5 py-3 text-sm">
                    <summary className="cursor-pointer text-muted">Versions précédentes ({older.length})</summary>
                    <ul className="mt-3 divide-y divide-line">
                      {older.map((r) => (
                        <li key={r.id} className="flex items-center justify-between gap-3 py-2">
                          <span>Version {r.version} <span className="text-muted">· {date(r.created_at)}</span></span>
                          <a href={`/api/telechargement/${r.id}`} className="btn-quiet" rel="nofollow"><Download className="h-4 w-4" /> Télécharger</a>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
