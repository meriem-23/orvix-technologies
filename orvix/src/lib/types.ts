export type SoftwareCategory = "sante" | "commerce" | "services" | "agences";
export type HardwareCategory = "publicite" | "informatique";
export type Category = SoftwareCategory | HardwareCategory;
export type ProductKind = "logiciel" | "materiel";

export type Product = {
  id: string;
  slug: string;
  name: string;
  kind: ProductKind;
  category: Category;
  image_path: string;
  in_stock: boolean;
  tagline: string;
  description: string;
  features: string[];
  modules: string[];
  platforms: string[];
  price_dzd: number | null;
  pricing_model: "licence" | "abonnement" | "devis";
  is_published: boolean;
  sort_order: number;
};

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  company: string;
  wilaya: string;
  role: "client" | "admin";
  is_blocked: boolean;
  created_at: string;
};

export type License = {
  id: string;
  user_id: string;
  product_id: string;
  license_key: string;
  status: "active" | "suspendue" | "expiree";
  max_devices: number;
  expires_at: string | null;
  notes: string;
  created_at: string;
};

export type Release = {
  id: string;
  product_id: string;
  version: string;
  file_path: string;
  file_size: number;
  external_url: string | null;
  notes: string;
  created_at: string;
};

export type RequestKind = "demo" | "achat" | "sur_mesure" | "contact";
export type RequestStatus = "nouvelle" | "en_cours" | "traitee" | "refusee";

export type RequestRow = {
  id: string;
  user_id: string | null;
  kind: RequestKind;
  product_id: string | null;
  name: string;
  email: string;
  phone: string;
  company: string;
  budget: string;
  message: string;
  status: RequestStatus;
  admin_note: string;
  created_at: string;
};

export type TicketStatus = "ouvert" | "en_attente" | "resolu" | "ferme";

export type Ticket = {
  id: string;
  user_id: string;
  product_id: string | null;
  subject: string;
  priority: "basse" | "normale" | "urgente";
  status: TicketStatus;
  created_at: string;
  updated_at: string;
};

export type TicketMessage = {
  id: string;
  ticket_id: string;
  author_id: string;
  is_staff: boolean;
  body: string;
  created_at: string;
};

export type ActionState = { ok?: boolean; error?: string; message?: string; fieldErrors?: Record<string, string> };
