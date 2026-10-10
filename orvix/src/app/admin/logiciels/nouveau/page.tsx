import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/dashboard-shell";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/auth";

export default async function NewProduct({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  await requireAdmin();
  const kind = (await searchParams).type === "materiel" ? "materiel" : "logiciel";
  return (
    <div className="max-w-4xl">
      <Link href={`/admin/logiciels?type=${kind}`} className="btn-quiet -ml-3 mb-4"><ChevronLeft className="h-4 w-4" /> Catalogue</Link>
      <PageHeader title={kind === "logiciel" ? "Nouveau logiciel" : "Nouvel article (matériel ou publicité)"} />
      <div className="panel p-5 sm:p-6"><ProductForm defaultKind={kind} /></div>
    </div>
  );
}
