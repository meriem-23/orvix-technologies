import { PageHeader } from "@/components/dashboard-shell";
import { MfaPanel } from "@/components/mfa-panel";
import { adminMfaState, requireAdmin } from "@/lib/auth";

export default async function SecurityPage() {
  await requireAdmin({ allowMfaSetup: true });
  const state = await adminMfaState();
  return (
    <>
      <PageHeader
        title="Sécurité du compte"
        description="L'accès administrateur est protégé par une double authentification : votre mot de passe, puis un code à 6 chiffres de votre application (Google Authenticator, Microsoft Authenticator, Authy…)."
      />
      <div className="max-w-xl">
        <MfaPanel state={state} />
      </div>
    </>
  );
}
