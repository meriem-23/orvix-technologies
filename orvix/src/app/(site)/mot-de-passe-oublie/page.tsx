import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth-shell";
import { ForgotForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Mot de passe oublié", robots: { index: false } };

export default function ForgotPage() {
  return (
    <AuthShell
      title="Mot de passe oublié"
      subtitle="Recevez un lien par e-mail pour en choisir un nouveau."
      footer={<Link href="/connexion" className="font-semibold text-brand-strong hover:underline underline-offset-4">Retour à la connexion</Link>}
    >
      <ForgotForm />
    </AuthShell>
  );
}
