/** Public URL of a product photo stored in the "catalog" bucket ("" when none). */
export function productImageUrl(path: string | null | undefined): string {
  if (!path) return "";
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return "";
  return `${base}/storage/v1/object/public/catalog/${path}`;
}
