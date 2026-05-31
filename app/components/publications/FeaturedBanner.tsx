import Image from "next/image";
import { LocalizedLink } from "../common/LocalizedLink";
import { PublicationCategoryBadge } from "./PublicationCategoryBadge";
import { formatPublicationDate, type Publication } from "@/app/lib/publications";
import type { Locale } from "@/app/lib/i18n/config";
import type { Dictionary } from "@/app/lib/i18n/shared";

// Featured banner — the big "hero" spread shared by the home page and
// the publications page: cover image on the left, an editorial block on
// the right (featured chip + category + serif headline + italic lede +
// meta + read link), on cream parchment. One component, so both pages
// open with an identical featured publication.

type Props = {
  publication: Publication;
  lang: Locale;
  dict: Dictionary["publications"];
  /** Tags the link with ?from=… for the article's context-aware back button. */
  from?: string;
};

export function FeaturedBanner({ publication: p, lang, dict, from }: Props) {
  const href = from
    ? `/publications/${p.slug}?from=${from}`
    : `/publications/${p.slug}`;
  const date = formatPublicationDate(p.publishedAt, lang);
  const minutes = dict.minutesShort.replace("{n}", String(p.readingTimeMinutes));

  return (
    <section className="relative overflow-hidden bg-[#F4EFE3] text-amber-950">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={{
          background:
            "radial-gradient(circle at 20% 15%, rgba(244,231,200,0.6) 0%, transparent 55%), radial-gradient(circle at 80% 85%, rgba(180,130,80,0.08) 0%, transparent 45%)",
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-900/30 to-transparent"
      />

      <div className="relative mx-auto max-w-7xl px-6 pt-6 md:pt-8">
        <article className="grid grid-cols-1 gap-8 pt-6 pb-12 md:grid-cols-[1.15fr_1fr] md:gap-12 md:pt-8 md:pb-16">
          <LocalizedLink
            href={href}
            className="group/cover relative block aspect-[4/3] overflow-hidden bg-amber-100/40 md:aspect-[5/4]"
          >
            {p.coverImageUrl ? (
              <Image
                src={p.coverImageUrl}
                alt={p.coverImageAlt ?? p.title}
                fill
                priority
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover transition duration-[1200ms] ease-out group-hover/cover:scale-[1.025]"
                {...(p.coverImageLqip
                  ? {
                      placeholder: "blur" as const,
                      blurDataURL: p.coverImageLqip,
                    }
                  : {})}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-100 via-stone-100 to-amber-50 text-amber-900/40">
                <span className="h-3 w-3 rotate-45 bg-amber-900/30" />
              </div>
            )}
          </LocalizedLink>

          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-800/85 md:text-[11px]">
              <span className="rounded-full border border-amber-800/40 px-2.5 py-1">
                {dict.featuredLabel}
              </span>
              <PublicationCategoryBadge
                category={p.category}
                dict={dict.categories}
              />
            </div>

            <LocalizedLink href={href} className="group/title mt-5 block">
              <h1 className="font-display text-[32px] font-semibold leading-[1.05] tracking-tight text-amber-950 transition-colors duration-300 group-hover/title:text-amber-900 sm:text-[42px] md:text-[52px]">
                {p.title}
              </h1>
            </LocalizedLink>

            <p className="mt-4 font-display text-base italic leading-[1.5] text-amber-800/85 md:text-lg">
              {p.excerpt}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] uppercase tracking-[0.22em] text-amber-900/70 md:text-[11px]">
              <span className="font-semibold text-amber-900">
                {p.author.name}
              </span>
              <span aria-hidden className="h-1 w-1 rounded-full bg-amber-900/30" />
              <span>{date}</span>
              <span aria-hidden className="h-1 w-1 rounded-full bg-amber-900/30" />
              <span>{minutes}</span>
            </div>

            <LocalizedLink
              href={href}
              className="group/read mt-8 inline-flex items-center gap-3 self-start text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-900 transition-colors duration-300 hover:text-amber-950"
            >
              <span>{dict.readLong}</span>
              <span
                aria-hidden
                className="transition-transform duration-300 group-hover/read:translate-x-1.5"
              >
                →
              </span>
            </LocalizedLink>
          </div>
        </article>
      </div>
    </section>
  );
}
