import "server-only";
import { cache } from "react";
import catalog from "@/data/catalog.json";
import { createClient } from "@/lib/supabase/server";
import { hasSupabase } from "@/lib/env";
import { SITE } from "@/lib/site";
import type { Product } from "@/lib/types";

// Built-in catalogue, used only until Supabase is connected (preview mode).
const fallback: Product[] = (catalog as unknown as Product[]).map((p) => ({
  ...p,
  id: p.slug,
  image_path: "",
  in_stock: true,
  price_dzd: null,
  pricing_model: "devis",
  is_published: true,
}));

export const getProducts = cache(async (): Promise<Product[]> => {
  if (!hasSupabase) return fallback;
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("is_published", true)
    .order("sort_order");
  return (data as Product[] | null) ?? [];
});

export const getSoftware = cache(async () => (await getProducts()).filter((p) => p.kind === "logiciel"));
export const getHardware = cache(async () => (await getProducts()).filter((p) => p.kind === "materiel"));

export const getProduct = cache(async (slug: string, kind?: Product["kind"]) => {
  const all = await getProducts();
  return all.find((p) => p.slug === slug && (!kind || p.kind === kind)) ?? null;
});

export type Settings = { phone: string; whatsapp: string; email: string; city: string; announcement: string };

export const getSettings = cache(async (): Promise<Settings> => {
  const base: Settings = { phone: SITE.phone, whatsapp: SITE.whatsapp, email: SITE.email, city: SITE.city, announcement: "" };
  if (!hasSupabase) return base;
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("key,value");
  for (const row of data ?? []) {
    if (row.key in base && row.value) (base as Record<string, string>)[row.key] = row.value;
  }
  return base;
});
