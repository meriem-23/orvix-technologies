"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, Loader2, UploadCloud } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { createExternalRelease, createRelease } from "@/app/actions/admin";
import { FormMessage } from "@/components/forms";
import type { ActionState } from "@/lib/types";

const FREE_LIMIT = 50 * 1024 * 1024;
const ALLOWED = /\.(exe|msi|zip|rar|7z|apk|dmg|pkg|appimage|deb)$/i;

export function ReleaseUploader({ productId, slug }: { productId: string; slug: string }) {
  const router = useRouter();
  const [state, setState] = useState<ActionState>({});
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"file" | "link">("file");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const version = String(fd.get("version") ?? "").trim();
    const notes = String(fd.get("notes") ?? "");
    if (!/^[0-9A-Za-z._-]{1,30}$/.test(version)) return setState({ error: "Version invalide (ex. 2.4.1)." });

    if (mode === "link") {
      const url = String(fd.get("url") ?? "").trim();
      if (!url.startsWith("https://")) return setState({ error: "Collez un lien qui commence par https://" });
      setBusy(true); setState({});
      const res = await createExternalRelease({ product_id: productId, version, external_url: url, notes });
      setBusy(false); setState(res);
      if (res.ok) { form.reset(); router.refresh(); }
      return;
    }

    const file = fd.get("file") as File | null;
    if (!file || !file.size) return setState({ error: "Choisissez le fichier d'installation." });
    if (!ALLOWED.test(file.name)) return setState({ error: "Formats acceptés : .exe, .msi, .zip, .rar, .7z, .apk, .dmg, .pkg, .AppImage, .deb" });
    setBusy(true); setState({});
    const safeName = file.name.replace(/[^0-9A-Za-z._-]+/g, "_").slice(-120);
    const path = `${slug}/${version}/${safeName}`;
    // Direct browser → private bucket upload; the storage policy only lets admins write.
    const supabase = createClient();
    const { error } = await supabase.storage.from("releases").upload(path, file, { upsert: false, contentType: "application/octet-stream" });
    if (error) {
      setBusy(false);
      return setState({
        error: error.message.includes("exists")
          ? "Un fichier existe déjà pour cette version."
          : file.size > FREE_LIMIT
            ? "Fichier trop gros pour votre stockage Supabase (50 Mo max en offre gratuite). Utilisez « Lien externe »."
            : "Échec de l'envoi du fichier. Vérifiez la limite de taille du bucket.",
      });
    }
    const res = await createRelease({ product_id: productId, version, file_path: path, file_size: file.size, notes });
    setBusy(false);
    setState(res);
    if (res.ok) { form.reset(); router.refresh(); }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Source de l'installateur">
        {([["file", "Envoyer le fichier", UploadCloud], ["link", "Lien externe", Link2]] as const).map(([v, label, Icon]) => (
          <button key={v} type="button" role="radio" aria-checked={mode === v} onClick={() => { setMode(v); setState({}); }}
            className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold ${mode === v ? "border-brand bg-brand/10 text-ink" : "border-line text-muted hover:text-ink"}`}>
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
        <div>
          <label htmlFor="version" className="label">Version</label>
          <input id="version" name="version" className="field font-mono" placeholder="2.4.1" required maxLength={30} />
        </div>
        {mode === "file" ? (
          <div>
            <label htmlFor="file" className="label">Installateur</label>
            <input id="file" name="file" type="file" required className="field pt-2.5 file:mr-3 file:rounded file:border-0 file:bg-brand/15 file:px-2 file:py-0.5 file:text-xs file:font-semibold file:text-brand-strong" />
          </div>
        ) : (
          <div>
            <label htmlFor="url" className="label">Lien de téléchargement</label>
            <input id="url" name="url" type="url" required className="field" placeholder="https://github.com/…/releases/download/…/Setup.exe" maxLength={1000} />
            <p className="mt-1.5 text-xs text-muted">GitHub Releases, Google Drive (« Tous les utilisateurs disposant du lien »)… Le lien n&apos;est donné qu&apos;aux clients avec une licence active.</p>
          </div>
        )}
      </div>
      <div>
        <label htmlFor="notes" className="label">Nouveautés (visible par les clients)</label>
        <textarea id="notes" name="notes" className="field min-h-[90px]" maxLength={3000} />
      </div>
      <FormMessage state={state} />
      <button className="btn-primary sm:justify-self-start" disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "file" ? <UploadCloud className="h-4 w-4" /> : <Link2 className="h-4 w-4" />} {busy ? "Envoi en cours…" : "Publier la version"}
      </button>
    </form>
  );
}
