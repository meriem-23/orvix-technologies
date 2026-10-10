"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UploadCloud } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { createRelease } from "@/app/actions/admin";
import { FormMessage } from "@/components/forms";
import type { ActionState } from "@/lib/types";

const ALLOWED = /\.(exe|msi|zip|rar|7z|apk|dmg|pkg|appimage|deb)$/i;

export function ReleaseUploader({ productId, slug }: { productId: string; slug: string }) {
  const router = useRouter();
  const [state, setState] = useState<ActionState>({});
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const file = fd.get("file") as File | null;
    const version = String(fd.get("version") ?? "").trim();
    const notes = String(fd.get("notes") ?? "");
    if (!file || !file.size) return setState({ error: "Choisissez le fichier d'installation." });
    if (!ALLOWED.test(file.name)) return setState({ error: "Formats acceptés : .exe, .msi, .zip, .rar, .7z, .apk, .dmg, .pkg, .AppImage, .deb" });
    if (!/^[0-9A-Za-z._-]{1,30}$/.test(version)) return setState({ error: "Version invalide (ex. 2.4.1)." });

    setBusy(true); setState({});
    const safeName = file.name.replace(/[^0-9A-Za-z._-]+/g, "_").slice(-120);
    const path = `${slug}/${version}/${safeName}`;
    // Direct browser → private bucket upload; the storage policy only lets admins write.
    const supabase = createClient();
    const { error } = await supabase.storage.from("releases").upload(path, file, { upsert: false, contentType: "application/octet-stream" });
    if (error) {
      setBusy(false);
      return setState({ error: error.message.includes("exists") ? "Un fichier existe déjà pour cette version." : "Échec de l'envoi du fichier. Vérifiez la limite de taille du bucket." });
    }
    const res = await createRelease({ product_id: productId, version, file_path: path, file_size: file.size, notes });
    setBusy(false);
    setState(res);
    if (res.ok) { form.reset(); router.refresh(); }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
        <div>
          <label htmlFor="version" className="label">Version</label>
          <input id="version" name="version" className="field font-mono" placeholder="2.4.1" required maxLength={30} />
        </div>
        <div>
          <label htmlFor="file" className="label">Installateur</label>
          <input id="file" name="file" type="file" required className="field pt-2.5 file:mr-3 file:rounded file:border-0 file:bg-brand/15 file:px-2 file:py-0.5 file:text-xs file:font-semibold file:text-brand-strong" />
        </div>
      </div>
      <div>
        <label htmlFor="notes" className="label">Nouveautés (visible par les clients)</label>
        <textarea id="notes" name="notes" className="field min-h-[90px]" maxLength={3000} />
      </div>
      <FormMessage state={state} />
      <button className="btn-primary sm:justify-self-start" disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />} {busy ? "Envoi en cours…" : "Publier la version"}
      </button>
    </form>
  );
}
