import {
  Pill, Stethoscope, Glasses, ShoppingBasket, UtensilsCrossed, Boxes,
  Scissors, Baby, Music, Plane, Ruler, AppWindow, Projector, Monitor, Laptop, ScanBarcode, Megaphone, Cpu,
} from "lucide-react";

const MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  pharmacie: Pill,
  "cabinet-medical": Stethoscope,
  opticien: Glasses,
  superette: ShoppingBasket,
  restaurant: UtensilsCrossed,
  "gestion-stock": Boxes,
  "salon-coiffure": Scissors,
  creche: Baby,
  "dj-evenements": Music,
  "agence-voyage": Plane,
  "agence-architecture": Ruler,
  "projecteur-logo": Projector,
  "poste-caisse": ScanBarcode,
  "pc-bureau": Monitor,
  "pc-portable": Laptop,
};

const BY_CATEGORY: Record<string, React.ComponentType<{ className?: string }>> = {
  publicite: Megaphone,
  informatique: Cpu,
};

export function ProductIcon({ slug, category, className = "h-5 w-5" }: { slug: string; category?: string; className?: string }) {
  const Icon = MAP[slug] ?? (category && BY_CATEGORY[category]) ?? AppWindow;
  return <Icon className={className} />;
}
