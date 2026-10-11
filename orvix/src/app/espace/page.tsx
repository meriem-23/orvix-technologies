import Link from "next/link";
import { KeyRound, LifeBuoy, Inbox, Download } from "lucide-react";
import { PageHeader } from "@/components/dashboard-shell";
import { StatusBadge } from "@/components/status-badge";
import { ProductIcon } from "@/components/product-icon";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { LICENSE_STATUS_LABEL, date } from "@/lib/format";

export default async function ClientHome() {
  const { profile } = await requireUser();
  const supabase = await createClient();
  const [lic, tickets, reqs] = await Promise.all([
    supabase.from("licenses").select("id,status,expires_at,products(name,slug)").eq("user_id", profile.id).order("created_at", { ascending: false }),
    supabase.from("tickets").select("id", { count: "exact", head: true }).eq("user_id", profile.id).in("status", ["ouvert", "en_attente"]),
    supabase.from("requests").select("id", { count: "exact", head: true }).eq("user_id", profile.id).in("status", ["nouvelle", "en_cours"]),
  ]);
  const licenses = (lic.data ?? []) as unknown as { id: string; status: keyof typeof LICENSE_STATUS_LABEL; expires_at: string | null; products: { name: string; slug: string } | null }[];
  const active = licenses.filter((l) => l.status === "active").length;
  const first = profile.full_name.split(" ")[0];

  const stats = [
    { href: "/espace/licences", icon: KeyRound, label: "Licences actives", value: active },
    { href: "/espace/support", icon: LifeBuoy, label: "Tickets en cours", value: tickets.count ?? 0 },
    { href: "/espace/demandes", icon: Inbox, label: "Demandes en cours", value: reqs.count ?? 0 },
  ];

  return (
    <>
      <PageHeader title={first ? `Bonjour ${first}` : "Bonjour"} description="Vos logiciels, vos clés et vos échanges avec l'équipe." />

      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map(({ href, icon: Icon, label, value }) => (
          <Link key={href} href={href} className="panel flex items-center gap-4 p-5 hover:border-brand/50">
            <span className="flex h-11 w-11 items-center justify-center rounded-md bg-brand/10 text-brand-strong"><Icon className="h-5 w-5" /></span>
            <span>
              <span className="block font-display text-2xl font-bold">{value}</span>
              <span className="text-sm text-muted">{label}</span>
            </span>
          </Link>
        ))}
      </div>

      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Mes logiciels</h2>
          <Link href="/espace/telechargements" className="btn-quiet"><Download className="h-4 w-4" /> Téléchargements</Link>
        </div>
        {licenses.length === 0 ? (
          <div className="panel p-6 text-sm text-muted">
            Aucun logiciel pour l&apos;instant. Après votre achat, la licence apparaît ici automatiquement.{" "}
            <Link href="/logiciels" className="font-semibold text-brand-strong hover:underline underline-offset-4">Voir le catalogue</Link>
          </div>
        ) : (
          <ul className="panel divide-y divide-line">
            {licenses.slice(0, 6).map((l) => (
              <li key={l.id} className="flex items-center gap-4 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-line text-brand-strong">
                  <ProductIcon slug={l.products?.slug ?? ""} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{l.products?.name ?? "Logiciel"}</p>
                  <p className="text-xs text-muted">{l.expires_at ? `Expire le ${date(l.expires_at)}` : "Licence à vie"}</p>
                </div>
                <StatusBadge value={l.status} label={LICENSE_STATUS_LABEL[l.status]} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
