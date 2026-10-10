import {
  Pill, Stethoscope, Glasses, ShoppingBasket, UtensilsCrossed, Boxes,
  Scissors, Baby, Music, Plane, Ruler, AppWindow,
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
};

export function ProductIcon({ slug, className = "h-5 w-5" }: { slug: string; className?: string }) {
  const Icon = MAP[slug] ?? AppWindow;
  return <Icon className={className} />;
}
