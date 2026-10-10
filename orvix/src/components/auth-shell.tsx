import { ShieldCheck } from "lucide-react";

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="container flex justify-center py-12 sm:py-20">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold">{title}</h1>
        {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
        <div className="panel mt-8 p-5 sm:p-7 shadow-lift">{children}</div>
        {footer && <div className="mt-6 text-center text-sm text-muted">{footer}</div>}
        <p className="mt-8 flex items-center justify-center gap-2 text-xs text-muted">
          <ShieldCheck className="h-3.5 w-3.5" /> Connexion chiffrée. Votre mot de passe n&apos;est jamais stocké en clair.
        </p>
      </div>
    </div>
  );
}
