import Link from "next/link";
import { Plus, EyeOff } from "lucide-react";
import { PageHeader } from "@/components/dashboard-shell";
import { ProductIcon } from "@/components/product-icon";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { CATEGORY_LABEL, price } from "@/lib/format";
import type { Product } from "@/lib/types";

export default async function AdminProducts() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("*").order("sort_order");
  const products = (data ?? []) as Product[];

  return (
    <>
      <PageHeader
        title="Logiciels"
        description="Le catalogue affiché sur le site, et les versions à télécharger pour les clients."
        action={<Link href="/admin/logiciels/nouveau" className="btn-primary"><Plus className="h-4 w-4" /> Nouveau logiciel</Link>}
      />
      <ul className="panel divide-y divide-line">
        {products.map((p) => (
          <li key={p.id}>
            <Link href={`/admin/logiciels/${p.id}`} className="flex items-center gap-4 p-4 hover:bg-surface">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-line text-brand-strong"><ProductIcon slug={p.slug} /></span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 truncate font-semibold">
                  {p.name} {!p.is_published && <EyeOff className="h-3.5 w-3.5 text-muted" aria-label="Masqué" />}
                </p>
                <p className="truncate text-xs text-muted">{CATEGORY_LABEL[p.category]}, {price(p)}</p>
              </div>
              <span className="hidden font-mono text-xs text-muted sm:block">/{p.slug}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
