import Link from "next/link";
import { SITE } from "@/lib/site";

/** The Orvix symbol (streams). Two cut-outs: one drawn for dark backgrounds, one for light. */
export function Mark({ className = "h-9" }: { className?: string }) {
  return (
    <span className={`relative inline-block shrink-0 aspect-[1.42] ${className}`} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/symbol-on-light-128.webp" alt="" width={180} height={128} className="absolute inset-0 h-full w-full object-contain dark:hidden" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/symbol-on-dark-128.webp" alt="" width={180} height={128} className="absolute inset-0 hidden h-full w-full object-contain dark:block" />
    </span>
  );
}

/** Wordmark built like the logo: heavy ORVIX, tracked gradient TECHNOLOGIES. */
export function Logo({ href = "/", tag }: { href?: string; tag?: string }) {
  return (
    <Link href={href} className="flex shrink-0 items-center gap-2.5" aria-label={`${SITE.fullName}, accueil`}>
      <Mark />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.28rem] font-extrabold tracking-tight">ORVIX</span>
        <span className="text-grad mt-[3px] font-display text-[0.56rem] font-bold tracking-[0.34em]">TECHNOLOGIES</span>
      </span>
      {tag && <span className="ml-1 rounded-full border border-line px-2 py-0.5 text-[11px] font-semibold text-muted">{tag}</span>}
    </Link>
  );
}
