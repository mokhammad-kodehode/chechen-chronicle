import { LocalizedLink } from "@/app/components/common/LocalizedLink";
import { PublicationCard } from "@/app/components/publications/PublicationCard";
import { getAllPublications } from "@/app/lib/publications";
import type { Dictionary } from "@/app/lib/i18n/shared";
import type { Locale } from "@/app/lib/i18n/config";

// "Свежие публикации" preview as the next manuscript spread after the
// hero. Same parchment surface, hairline page-seam at the top, roman
// chapter mark and ornamental divider. The card grid keeps the
// existing PublicationCard component — only the section frame is
// re-skinned for manuscript continuity.

type Props = {
  lang: Locale;
  dict: Dictionary;
};

export async function HomePublicationsPreview({ lang, dict }: Props) {
  const all = await getAllPublications();
  const preview = all.slice(0, 3);
  if (preview.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-[#F4EFE3] py-24 text-amber-950 md:py-32">
      {/* Page-seam hairline */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-900/25 to-transparent"
      />
      {/* Subtle paper warmth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          background:
            "radial-gradient(circle at 75% 20%, rgba(244,231,200,0.55) 0%, transparent 55%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Section header — same kicker + roman numeral language as
            the chapter index in the hero. */}
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-amber-800/70">
            Глава II
          </p>
          <h2 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-amber-950 md:text-5xl">
            {dict.home.publications.title}
          </h2>
          <p className="mt-3 font-display text-base italic text-amber-800/80 md:text-lg">
            {dict.home.publications.subtitle}
          </p>

          {/* Ornament divider */}
          <div className="mt-8 flex w-full max-w-[180px] items-center gap-3 text-amber-900/35">
            <span className="h-px flex-1 bg-current" />
            <span className="font-display text-[12px] tracking-[0.5em]">⁂</span>
            <span className="h-px flex-1 bg-current" />
          </div>
        </div>

        {/* Card grid */}
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 md:mt-20">
          {preview.map((p) => (
            <PublicationCard
              key={p.id}
              publication={p}
              lang={lang}
              dict={dict.publications}
            />
          ))}
        </div>

        {/* "Все публикации →" — editorial CTA, no boxy button */}
        <div className="mt-16 flex justify-center">
          <LocalizedLink
            href="/publications"
            className="group/cta inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-amber-900 transition-colors duration-300 hover:text-amber-950"
          >
            <span>{dict.home.publications.linkAll}</span>
            <span
              aria-hidden
              className="inline-block transition-transform duration-300 group-hover/cta:translate-x-1.5"
            >
              →
            </span>
          </LocalizedLink>
        </div>
      </div>
    </section>
  );
}
