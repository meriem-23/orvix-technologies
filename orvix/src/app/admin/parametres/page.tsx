import { PageHeader } from "@/components/dashboard-shell";
import { SettingsForm } from "@/components/admin/settings-form";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/data";

export default async function AdminSettings() {
  await requireAdmin();
  const settings = await getSettings();
  return (
    <div className="max-w-3xl">
      <PageHeader title="Paramètres du site" description="Coordonnées affichées dans le pied de page, la page contact et les boutons WhatsApp." />
      <div className="panel p-5 sm:p-6"><SettingsForm settings={settings} /></div>
    </div>
  );
}
