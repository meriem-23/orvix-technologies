import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Connexion", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; lien?: string; blocked?: string }> }) {
  const sp = await searchParams;
  return (
    <AuthShell
      title="Connexion"
      subtitle="Accédez à vos licences, téléchargements et demandes."
      footer={<>Pas encore de compte ? <Link href="/inscription" className="font-semibold text-brand-strong hover:underline underline-offset-4">Créer un compte</Link></>}
    >
      {sp.lien === "expire" && (
        <p className="mb-5 rounded-md border border-warn/30 bg-warn/10 px-3 py-2.5 text-sm text-warn">Ce lien a expiré ou a déjà été utilisé. Connectez-vous ou demandez un nouveau lien.</p>
      )}
      {sp.blocked && (
        <p className="mb-5 rounded-md border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm text-danger">Ce compte est désactivé. Contactez-nous pour le réactiver.</p>
      )}
      <LoginForm next={sp.next} />
    </AuthShell>
  );
}
