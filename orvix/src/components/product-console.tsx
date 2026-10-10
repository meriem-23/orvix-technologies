"use client";
import Link from "next/link";
import { useState } from "react";
import { Check, KeyRound, Monitor } from "lucide-react";
import { ProductIcon } from "./product-icon";
import { CATEGORY_LABEL } from "@/lib/format";
import type { Category } from "@/lib/types";

type Item = { slug: string; name: string; tagline: string; category: Category; features: string[]; modules: string[]; platforms: string[] };

/**
 * The hero's signature element: a working "window" that lets visitors flip
 * through every Orvix product and see what it actually manages.
 */
export function ProductConsole({ items }: { items: Item[] }) {
  const [active, setActive] = useState(items[0]?.slug);
  const [tab, setTab] = useState(0);
  const current = items.find((i) => i.slug === active) ?? items[0];
  if (!current) return null;

  const groups = (Object.keys(CATEGORY_LABEL) as Category[])
    .map((c) => ({ c, list: items.filter((i) => i.category === c) }))
    .filter((g) => g.list.length);

  const select = (slug: string) => { setActive(slug); setTab(0); };

  return (
    <div className="relative">
      {/* Mobile product switcher */}
      <div className="lg:hidden -mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]" role="tablist" aria-label="Logiciels">
        {items.map((i) => (
          <button
            key={i.slug}
            role="tab"
            aria-selected={i.slug === current.slug}
            onClick={() => select(i.slug)}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium ${
              i.slug === current.slug ? "border-brand bg-brand text-brand-ink" : "border-line bg-raised text-muted"
            }`}
          >
            <ProductIcon slug={i.slug} className="h-4 w-4" /> {i.name.replace(/^Orvix /, "")}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-raised shadow-glow">
        {/* Title bar */}
        <div className="flex items-center justify-between gap-3 border-b border-line bg-surface px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand text-brand-ink">
              <ProductIcon slug={current.slug} className="h-4 w-4" />
            </span>
            <span className="truncate font-display text-sm font-semibold">{current.name}</span>
          </div>
          <span className="chip shrink-0 border border-gold/40 text-gold">
            <KeyRound className="h-3 w-3" /> Licence activée
          </span>
        </div>

        <div className="grid lg:grid-cols-[200px_1fr]">
          {/* Desktop rail */}
          <nav className="hidden lg:block border-r border-line bg-surface/60 p-2 max-h-[440px] overflow-y-auto" aria-label="Logiciels">
            {groups.map((g) => (
              <div key={g.c} className="mb-2">
                <p className="px-2 pb-1 pt-2 text-[11px] font-semibold text-muted">{CATEGORY_LABEL[g.c]}</p>
                {g.list.map((i) => (
                  <button
                    key={i.slug}
                    onClick={() => select(i.slug)}
                    aria-current={i.slug === current.slug}
                    className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] ${
                      i.slug === current.slug ? "bg-brand/15 text-ink font-semibold" : "text-muted hover:text-ink hover:bg-raised"
                    }`}
                  >
                    <ProductIcon slug={i.slug} className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{i.name.replace(/^Orvix /, "")}</span>
                  </button>
                ))}
              </div>
            ))}
          </nav>

          <div className="min-w-0 p-4 sm:p-5">
            <div className="flex gap-1 overflow-x-auto border-b border-line [scrollbar-width:none]" role="tablist" aria-label="Modules">
              {current.modules.map((m, idx) => (
                <button
                  key={m}
                  role="tab"
                  aria-selected={idx === tab}
                  onClick={() => setTab(idx)}
                  className={`-mb-px shrink-0 border-b-2 px-3 pb-2.5 text-sm ${
                    idx === tab ? "border-brand text-ink font-semibold" : "border-transparent text-muted hover:text-ink"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <p className="mt-4 text-sm text-muted">{current.tagline}</p>

            <ul className="mt-4 divide-y divide-line rounded-md border border-line">
              {current.features.slice(0, 5).map((f, idx) => (
                <li key={f} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
                  <span className="flex min-w-0 items-center gap-2.5">
                    <Check className="h-4 w-4 shrink-0 text-ok" />
                    <span className="truncate">{f}</span>
                  </span>
                  <span className="hidden sm:block h-1.5 shrink-0 rounded-full bg-brand/25" style={{ width: `${36 + ((idx * 17 + tab * 11) % 44)}px` }} />
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                <Monitor className="h-3.5 w-3.5" /> {current.platforms.join(", ")}
              </span>
              <Link href={`/logiciels/${current.slug}`} className="text-sm font-semibold text-brand-strong hover:underline underline-offset-4">
                Découvrir {current.name}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
