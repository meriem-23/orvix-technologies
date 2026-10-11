import { PageHeader } from "@/components/dashboard-shell";
import { ProfileForm } from "@/components/profile-form";
import { NewPasswordForm } from "@/components/auth-forms";
import { requireUser } from "@/lib/auth";

export default async function ProfilePage() {
  const { profile } = await requireUser();
  return (
    <>
      <PageHeader title="Mon profil" description={`Compte ${profile.email}`} />
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="panel p-5 sm:p-6">
          <h2 className="mb-5 text-lg font-semibold">Coordonnées</h2>
          <ProfileForm profile={profile} />
        </section>
        <section className="panel h-fit p-5 sm:p-6">
          <h2 className="mb-5 text-lg font-semibold">Changer le mot de passe</h2>
          <NewPasswordForm after="/espace/profil" />
        </section>
      </div>
    </>
  );
}
