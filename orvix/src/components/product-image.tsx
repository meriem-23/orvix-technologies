import { ProductIcon } from "./product-icon";
import { productImageUrl } from "@/lib/images";

/** Product photo, or a branded placeholder until the admin uploads one. */
export function ProductImage({
  slug, category, image_path, name, className = "aspect-[4/3]",
}: {
  slug: string; category: string; image_path: string; name: string; className?: string;
}) {
  const url = productImageUrl(image_path);
  return (
    <div className={`relative overflow-hidden rounded-md bg-surface ${className}`}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={name} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-grad absolute inset-0 opacity-[0.13] dark:opacity-25" />
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-magenta/20 blur-3xl" />
          <div className="absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-blue/25 blur-3xl" />
          <ProductIcon slug={slug} category={category} className="relative h-14 w-14 text-brand-strong" />
        </div>
      )}
    </div>
  );
}
