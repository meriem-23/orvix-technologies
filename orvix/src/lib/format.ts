import type { Category, HardwareCategory, SoftwareCategory, RequestKind, RequestStatus, TicketStatus } from "./types";

export const CATEGORY_LABEL: Record<Category, string> = {
  sante: "Santé",
  commerce: "Commerce",
  services: "Services",
  agences: "Agences",
  publicite: "Solutions publicitaires",
  informatique: "Informatique et PC",
};

export const SOFTWARE_CATEGORIES: SoftwareCategory[] = ["sante", "commerce", "services", "agences"];
export const HARDWARE_CATEGORIES: HardwareCategory[] = ["publicite", "informatique"];

export const REQUEST_KIND_LABEL: Record<RequestKind, string> = {
  demo: "Démo",
  achat: "Achat",
  sur_mesure: "Projet sur mesure",
  contact: "Contact",
};

export const REQUEST_STATUS_LABEL: Record<RequestStatus, string> = {
  nouvelle: "Nouvelle",
  en_cours: "En cours",
  traitee: "Traitée",
  refusee: "Refusée",
};

export const TICKET_STATUS_LABEL: Record<TicketStatus, string> = {
  ouvert: "Ouvert",
  en_attente: "Réponse reçue",
  resolu: "Résolu",
  ferme: "Fermé",
};

export const LICENSE_STATUS_LABEL = { active: "Active", suspendue: "Suspendue", expiree: "Expirée" } as const;

const dzd = new Intl.NumberFormat("fr-DZ", { maximumFractionDigits: 0 });

export function price(p: { price_dzd: number | null; pricing_model: string }) {
  if (p.price_dzd == null || p.pricing_model === "devis") return "Sur devis";
  return `${dzd.format(p.price_dzd)} DA${p.pricing_model === "abonnement" ? " / mois" : ""}`;
}

export function date(d: string | null | undefined, withTime = false) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(new Date(d));
}

export function bytes(n: number) {
  if (!n) return "—";
  const u = ["o", "Ko", "Mo", "Go"];
  let i = 0;
  while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(i ? 1 : 0)} ${u[i]}`;
}
