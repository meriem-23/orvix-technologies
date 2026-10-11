import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ChevronLeft, Trash2, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/dashboard-shell";
import { ProductForm } from "@/components/admin/product-form";
import { ReleaseUploader } from "@/components/admin/release-uploader";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { deleteProduct, deleteRelease } from "@/app/actions/admin";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { bytes, date } from "@/lib/format";
import type { Product, Release } from "@/lib/types";

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const id = z.string().uuid().safeParse((await params).id);
  if (!id.success) notFound();
  const supabase = await createClient();
  const [{ data: product }, { data: rel }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id.data).maybeSingle<Product>(),
    supabase.from("releases").select("*").eq("product_id", id.data).order("created_at", { ascending: false }),
  ]);
  if (!product) notFound();
  const releases = (rel ?? []) as Release[];

  return (
    <div className="max-w-4xl">
      <Link href={`/admin/logiciels?type=${product.kind}`} className="btn-quiet -ml-3 mb-4"><ChevronLeft className="h-4 w-4" /> Catalogue</Link>
      <PageHeader
        title={product.name}
        action={<Link href={`/${product.kind === "logiciel" ? "logiciels" : "materiel"}/${product.slug}`} target="_blank" className="btn-ghost"><ExternalLink className="h-4 w-4" /> Voir la page</Link>}
      />

      <section className="panel p-5 sm:p-6"><ProductForm product={product} /></section>

      {product.kind === "logiciel" && (
      <section className="mt-8">
        <h2 className="text-lg font-semibold">Versions téléchargeables</h2>
        <p className="mt-1 text-sm text-muted">Seuls les clients avec une licence active de ce logiciel peuvent les télécharger. Fichier de plus de 50 Mo (offre Supabase gratuite) : utilisez « Lien externe ».</p>
        <div className="panel mt-4 p-5 sm:p-6"><ReleaseUploader productId={product.id} slug={product.slug} /></div>
        {releases.length > 0 && (
          <ul className="panel mt-4 divide-y divide-line">
            {releases.map((r) => (
              <li key={r.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">Version {r.version}</p>
                  <p className="truncate text-xs text-muted">{r.external_url ? `Lien externe : ${r.external_url}` : `${r.file_path.split("/").pop()}, ${bytes(r.file_size)}`}, {date(r.created_at, true)}</p>
                </div>
                <form action={deleteRelease}>
                  <input type="hidden" name="id" value={r.id} />
                  <ConfirmButton message={`Supprimer la version ${r.version} et son fichier ?`}><Trash2 className="h-4 w-4" /> Supprimer</ConfirmButton>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
      )}

      <section className="mt-10 rounded-lg border border-danger/30 p-5">
        <h2 className="font-semibold text-danger">Supprimer</h2>
        <p className="mt-1 text-sm text-muted">S&apos;il a déjà des licences, il est seulement masqué du site pour ne pas casser les comptes clients.</p>
        <form action={deleteProduct} className="mt-4">
          <input type="hidden" name="id" value={product.id} />
          <ConfirmButton message={`Supprimer ${product.name} ?`}><Trash2 className="h-4 w-4" /> Supprimer {product.name}</ConfirmButton>
        </form>
      </section>
    </div>
  );
}
