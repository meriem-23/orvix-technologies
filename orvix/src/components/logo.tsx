import Link from "next/link";
import { SITE } from "@/lib/site";

/** Placeholder mark until the final logo is ready (drop it in /public and swap here). */
export function Mark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="10" className="fill-brand" />
      <path d="M20 8.5a11.5 11.5 0 1 0 8.13 3.37" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" />
      <path d="M24 16 31.5 8.5M31.5 8.5h-6M31.5 8.5v6" fill="none" stroke="rgb(var(--gold))" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ href = "/", suffix }: { href?: string; suffix?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 shrink-0" aria-label={`${SITE.fullName}, accueil`}>
      <Mark />
      <span className="font-display text-[1.15rem] font-semibold tracking-tight">
        {SITE.name}
        <span className="text-muted font-normal"> {suffix ?? "Technologies"}</span>
      </span>
    </Link>
  );
}
