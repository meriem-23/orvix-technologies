import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/data";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [current, settings] = await Promise.all([getCurrentUser(), getSettings()]);
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 btn-primary">
        Aller au contenu
      </a>
      {settings.announcement && (
        <div className="bg-brand text-brand-ink text-center text-sm px-4 py-2">{settings.announcement}</div>
      )}
      <SiteHeader signedIn={!!current} isAdmin={current?.profile.role === "admin"} />
      <main id="contenu" className="flex-1">{children}</main>
      <SiteFooter settings={settings} />
    </div>
  );
}
