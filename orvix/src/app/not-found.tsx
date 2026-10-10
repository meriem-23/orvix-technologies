import Link from "next/link";
import { Mark } from "@/components/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <Mark className="h-12 w-12" />
      <h1 className="mt-6 text-3xl font-bold">Page introuvable</h1>
      <p className="mt-2 text-muted">Cette adresse n&apos;existe pas ou a été déplacée.</p>
      <Link href="/" className="btn-primary mt-8">Retour à l&apos;accueil</Link>
    </div>
  );
}
