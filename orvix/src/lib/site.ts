// Brand settings in ONE place. Change the name here and it changes everywhere.
export const SITE = {
  name: "Orvix",
  fullName: "Orvix Technologies",
  tagline: "Logiciels de gestion, matériel et solutions publicitaires",
  description:
    "Orvix Technologies conçoit des logiciels de gestion pour pharmacies, commerces, restaurants, cabinets et agences, vend du matériel informatique et des solutions publicitaires, et développe des sites et logiciels sur mesure.",
  // Defaults; the admin can override them in Paramètres (site_settings table).
  phone: "0668 79 22 39",
  whatsapp: "213668792239",
  email: "contact@orvix.dz",
  city: "Algérie",
  licensePrefix: "ORVX",
} as const;

export const whatsappLink = (number: string, text?: string) =>
  `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
