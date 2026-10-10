import { ShieldCheck } from "lucide-react";
import { Waves } from "./waves";

/** Sign-in / sign-up layout: form on the left, logo streams on a navy panel on the right (desktop). */
export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="container grid gap-10 py-10 sm:py-16 lg:grid-cols-[1fr_1fr] lg:items-center">
      <div className="mx-auto w-full max-w-md">
        <h1 className="text-3xl font-bold">{title}</h1>
        {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
        <div className="panel mt-8 p-5 shadow-lift sm:p-7">{children}</div>
        {footer && <div className="mt-6 text-center text-sm text-muted">{footer}</div>}
        <p className="mt-8 flex items-center justify-center gap-2 text-xs text-muted">
          <ShieldCheck className="h-3.5 w-3.5" /> Connexion chiffrée. Votre mot de passe n&apos;est jamais stocké en clair.
        </p>
      </div>
      <div className="relative hidden h-[560px] overflow-hidden rounded-xl bg-[#010027] ring-1 ring-white/10 lg:block">
        <div className="absolute inset-x-0 bottom-40 top-6"><Waves streams={5} seed={23} spread={0.85} /></div>
        <div className="absolute inset-x-0 bottom-0 p-8 text-white">
          <p className="font-display text-2xl font-semibold">Vos licences, vos mises à jour et le support.</p>
          <p className="mt-2 text-sm text-white/70">Au même endroit, sur ordinateur comme sur téléphone.</p>
        </div>
      </div>
    </div>
  );
}
