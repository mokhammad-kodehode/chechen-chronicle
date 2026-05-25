import { LocalizedLink } from "@/app/components/common/LocalizedLink";
import type { Dictionary } from "@/app/lib/i18n/shared";

// About / "О проекте" — the manuscript-style identity spread that
// used to be the home hero. Three spreads on one parchment surface:
//
//   I.  TITLE SPREAD     — frontispiece: volume + giant Playfair title.
//   II. EDITOR'S LETTER  — two-column manifesto with a drop cap.
//   III. CHAPTER INDEX   — table of contents linking to Publications,
//                          Archive and 3D Stories.
//
// The home page is now publication-led (a newsroom front page), so
// this slow editorial frontispiece lives here as the project's
// "about the volume" page.

type Props = {
  dict: Dictionary;
};

export function AboutPage({ dict }: Props) {
  const hero = dict.home.hero;
  const manifesto = dict.home.manifesto;
  const chapters = dict.home.chapters;

  return (
    <section className="relative overflow-hidden bg-[#F4EFE3] text-amber-950">
      {/* Subtle paper texture + page-seam hairlines */}
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
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-900/30 to-transparent"
      />

      {/* ── I. TITLE SPREAD ─────────────────────────────────────── */}
      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-6 pt-20 text-center md:pt-28">
        <div
          className="animate-rise flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.42em] text-amber-800/70"
          style={{ animationDelay: "60ms" }}
        >
          <span className="h-px w-10 bg-amber-900/30" />
          <span>{hero.volume}</span>
          <span className="h-px w-10 bg-amber-900/30" />
        </div>

        <h1
          className="animate-rise mt-8 font-display text-[64px] font-semibold leading-[0.95] tracking-tight text-amber-950 sm:text-[88px] md:text-[120px]"
          style={{ animationDelay: "140ms" }}
        >
          {hero.title}
        </h1>

        <p
          className="animate-rise mt-4 font-display text-xl font-medium italic text-amber-800/80 md:text-3xl"
          style={{ animationDelay: "220ms" }}
        >
          {hero.subtitle}
        </p>

        <div
          className="animate-rise mt-12 flex w-full max-w-md items-center gap-4 text-amber-900/45"
          style={{ animationDelay: "300ms" }}
        >
          <span className="h-px flex-1 bg-current" />
          <span className="font-display text-[15px] tracking-[0.6em]">⁂</span>
          <span className="h-px flex-1 bg-current" />
        </div>

        <p
          className="animate-rise mt-8 text-[11px] font-semibold uppercase tracking-[0.38em] text-amber-900/70 md:text-xs"
          style={{ animationDelay: "380ms" }}
        >
          {hero.dateline}
        </p>
      </div>

      {/* ── II. EDITOR'S LETTER ─────────────────────────────────── */}
      <div className="relative mx-auto max-w-3xl px-6 pt-24 pb-16 md:pt-32 md:pb-20">
        <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-amber-800/70">
          {manifesto.heading}
        </p>

        <div className="mt-6 columns-1 gap-12 text-amber-950/85 md:columns-2 md:gap-14 [&_p]:font-display [&_p]:text-[17px] [&_p]:leading-[1.65] md:[&_p]:text-[18px] md:[&_p]:leading-[1.7]">
          <p className="break-inside-avoid first-letter:float-left first-letter:pr-3 first-letter:pt-1 first-letter:font-display first-letter:text-[64px] first-letter:font-semibold first-letter:leading-[0.85] first-letter:text-amber-800 md:first-letter:text-[80px]">
            {manifesto.paragraph1}
          </p>
          <p className="mt-5 break-inside-avoid">{manifesto.paragraph2}</p>
        </div>

        <p className="mt-8 text-right font-display text-sm italic text-amber-800/70 md:text-base">
          {manifesto.signature}
        </p>
      </div>

      {/* ── III. CHAPTER INDEX ──────────────────────────────────── */}
      <div className="relative mx-auto max-w-4xl px-6 pb-28 md:pb-36">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.38em] text-amber-800/70">
          {chapters.heading}
        </p>

        <ul className="mt-10 divide-y divide-amber-900/15 border-y border-amber-900/15">
          <ChapterRow item={chapters.publications} href="/publications" />
          <ChapterRow item={chapters.archive} href="/archive" />
          <ChapterRow item={chapters.stories} href="/istorii" />
        </ul>
      </div>
    </section>
  );
}

function ChapterRow({
  item,
  href,
}: {
  item: { numeral: string; name: string; description: string };
  href: string;
}) {
  return (
    <li>
      <LocalizedLink
        href={href}
        className="group/chap relative flex items-baseline gap-6 px-2 py-6 transition-colors duration-300 hover:bg-amber-100/30 md:gap-10 md:px-4 md:py-8"
      >
        <span
          aria-hidden
          className="w-10 shrink-0 font-display text-3xl font-semibold leading-none text-amber-800/45 transition-colors duration-300 group-hover/chap:text-amber-900 md:w-14 md:text-4xl"
        >
          {item.numeral}
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="font-display text-2xl font-semibold tracking-tight text-amber-950 md:text-3xl">
            {item.name}
          </h3>
          <p className="mt-1.5 text-sm leading-[1.55] text-amber-900/65 md:text-[15px]">
            {item.description}
          </p>
        </div>

        <span
          aria-hidden
          className="shrink-0 text-xl text-amber-800/55 transition-all duration-300 group-hover/chap:translate-x-1.5 group-hover/chap:text-amber-900 md:text-2xl"
        >
          →
        </span>
      </LocalizedLink>
    </li>
  );
}
