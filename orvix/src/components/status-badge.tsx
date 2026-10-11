const TONE: Record<string, string> = {
  // licences
  active: "bg-ok/10 text-ok",
  suspendue: "bg-warn/15 text-warn",
  expiree: "bg-muted/15 text-muted",
  // requests
  nouvelle: "bg-brand/15 text-brand-strong",
  en_cours: "bg-warn/15 text-warn",
  traitee: "bg-ok/10 text-ok",
  refusee: "bg-muted/15 text-muted",
  // tickets
  ouvert: "bg-brand/15 text-brand-strong",
  en_attente: "bg-accent/15 text-accent",
  resolu: "bg-ok/10 text-ok",
  ferme: "bg-muted/15 text-muted",
  // priority
  urgente: "bg-danger/10 text-danger",
  normale: "bg-surface text-muted border border-line",
  basse: "bg-surface text-muted border border-line",
};

export function StatusBadge({ value, label }: { value: string; label: string }) {
  return <span className={`chip ${TONE[value] ?? "bg-surface text-muted"}`}>{label}</span>;
}
