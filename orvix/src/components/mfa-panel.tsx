"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import type { MfaState } from "@/lib/auth";

export function MfaPanel({ state }: { state: MfaState }) {
  const router = useRouter();
  const [qr, setQr] = useState<{ factorId: string; svg: string; secret: string } | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function startEnroll() {
    setBusy(true); setError("");
    const supabase = createClient();
    const { data: list } = await supabase.auth.mfa.listFactors();
    for (const f of list?.all ?? []) if (f.status !== "verified") await supabase.auth.mfa.unenroll({ factorId: f.id });
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `Admin ${Date.now()}` });
    setBusy(false);
    if (error || !data) return setError("Impossible de démarrer la configuration. Vérifiez que l'option MFA est activée dans Supabase.");
    setQr({ factorId: data.id, svg: data.totp.qr_code, secret: data.totp.secret });
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) return setError("Le code contient 6 chiffres.");
    setBusy(true); setError("");
    const supabase = createClient();
    let factorId = qr?.factorId;
    if (!factorId) {
      const { data } = await supabase.auth.mfa.listFactors();
      factorId = data?.totp.find((f) => f.status === "verified")?.id;
    }
    if (!factorId) { setBusy(false); return setError("Aucune application configurée."); }
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
    setBusy(false);
    if (error) return setError("Code incorrect ou expiré. Utilisez le code affiché en ce moment dans l'application.");
    router.replace("/admin");
    router.refresh();
  }

  if (state === "ok")
    return (
      <div className="panel flex items-start gap-4 p-5">
        <ShieldCheck className="h-6 w-6 shrink-0 text-ok" />
        <div>
          <p className="font-semibold">Double authentification active</p>
          <p className="mt-1 text-sm text-muted">Cette session est vérifiée. Le code vous sera redemandé à chaque nouvelle connexion.</p>
        </div>
      </div>
    );

  const codeForm = (
    <form onSubmit={verify} className="mt-5 grid gap-3">
      <label htmlFor="otp" className="label">Code à 6 chiffres</label>
      <input
        id="otp" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        inputMode="numeric" autoComplete="one-time-code" className="field text-center font-mono text-xl tracking-[0.5em]" autoFocus
      />
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <button className="btn-primary h-12" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />} Vérifier</button>
    </form>
  );

  if (state === "verify")
    return (
      <div className="panel p-5 sm:p-6">
        <p className="font-semibold">Entrez le code de votre application</p>
        <p className="mt-1 text-sm text-muted">Ouvrez votre application d&apos;authentification et saisissez le code Orvix affiché.</p>
        {codeForm}
      </div>
    );

  return (
    <div className="panel p-5 sm:p-6">
      <p className="font-semibold">Configurer la double authentification</p>
      <p className="mt-1 text-sm text-muted">Obligatoire pour accéder au panneau d&apos;administration. Cela prend une minute.</p>
      {!qr ? (
        <>
          {error && <p role="alert" className="mt-4 text-sm text-danger">{error}</p>}
          <button onClick={startEnroll} className="btn-primary mt-5" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />} Commencer</button>
        </>
      ) : (
        <>
          <ol className="mt-5 list-decimal space-y-2 pl-5 text-sm">
            <li>Scannez ce QR code avec votre application d&apos;authentification.</li>
            <li>Saisissez le code à 6 chiffres qu&apos;elle affiche.</li>
          </ol>
          <div className="mt-5 flex flex-col items-center gap-3 rounded-md bg-white p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr.svg} alt="QR code de configuration" className="h-48 w-48" />
          </div>
          <p className="mt-3 text-xs text-muted">Pas de caméra ? Saisissez cette clé : <code className="break-all font-mono text-ink">{qr.secret}</code></p>
          {codeForm}
        </>
      )}
    </div>
  );
}
