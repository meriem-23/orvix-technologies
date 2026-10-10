import type { Metadata } from "next";
import { AuthShell } from "@/components/auth-shell";
import { NewPasswordForm } from "@/components/auth-forms";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Nouveau mot de passe", robots: { index: false } };

export default async function NewPasswordPage() {
  const { profile } = await requireUser();
  return (
    <AuthShell title="Nouveau mot de passe" subtitle={`Compte ${profile.email}`}>
      <NewPasswordForm after={profile.role === "admin" ? "/admin" : "/espace"} />
    </AuthShell>
  );
}
