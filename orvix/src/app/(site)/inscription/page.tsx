import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth-shell";
import { SignupForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Créer un compte", robots: { index: false } };

export default function SignupPage() {
  return (
    <AuthShell
      title="Créer votre espace client"
      subtitle="Vos licences, les mises à jour et le support, au même endroit."
      footer={<>Déjà un compte ? <Link href="/connexion" className="font-semibold text-brand-strong hover:underline underline-offset-4">Se connecter</Link></>}
    >
      <SignupForm />
    </AuthShell>
  );
}
