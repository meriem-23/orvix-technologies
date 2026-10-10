"use client";
import { useState } from "react";
import { Copy, Check, Eye, EyeOff } from "lucide-react";

export function LicenseKey({ value }: { value: string }) {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  const masked = value.split("-").map((g, i) => (i < 2 ? g : "••••")).join("-");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard blocked */ }
  };

  return (
    <div className="flex items-center gap-1 rounded-md border border-line bg-surface pl-3">
      <code className="min-w-0 flex-1 truncate py-2 font-mono text-[13px] tracking-wider">{show ? value : masked}</code>
      <button type="button" onClick={() => setShow((v) => !v)} className="flex h-9 w-9 items-center justify-center text-muted hover:text-ink" aria-label={show ? "Masquer la clé" : "Afficher la clé"}>
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
      <button type="button" onClick={copy} className="flex h-9 w-9 items-center justify-center text-muted hover:text-ink" aria-label="Copier la clé">
        {copied ? <Check className="h-4 w-4 text-ok" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}
