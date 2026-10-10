import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/dashboard-shell";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/auth";

export default async function NewProduct() {
  await requireAdmin();
  return (
    <div className="max-w-4xl">
      <Link href="/admin/logiciels" className="btn-quiet -ml-3 mb-4"><ChevronLeft className="h-4 w-4" /> Logiciels</Link>
      <PageHeader title="Nouveau logiciel" />
      <div className="panel p-5 sm:p-6"><ProductForm /></div>
    </div>
  );
}
