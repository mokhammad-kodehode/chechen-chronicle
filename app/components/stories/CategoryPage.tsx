"use client";

import { LocalizedLink } from "@/app/components/common/LocalizedLink";
import type { Category, Story } from "./storiesData";

// ──────────────────────────────────────────────
// Single category page — header with category info + grid of stories.
//
// Reached via /istorii/<slug>. The header sits at the top with the
// category's numeral, glyph and intro; below it a vertical stack of
// story cards (active ones link out, placeholders show "Скоро").
// ──────────────────────────────────────────────

export function CategoryPage({ category: cat }: { category: Category }) {
  return (
    <div className="min-h-screen bg-[#0c0805] text-amber-50">
      {/* Back link */}
      <div className="fixed left-4 top-20 z-50 md:left-8 md:top-24">
        <LocalizedLink
          href="/istorii"
          className="inline-flex items-center gap-2 rounded-full border border-amber-100/15 bg-amber-950/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-amber-100/80 backdrop-blur transition hover:border-amber-100/40 hover:bg-amber-950 hover:text-white"
        >
          ← Все категории
        </LocalizedLink>
      </div>

      {/* Header */}
      <section className="relative overflow-hidden border-b border-amber-100/10 px-6 pb-16 pt-32 md:pb-20 md:pt-40">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 40%, #f3ead4 0%, transparent 45%), radial-gradient(circle at 70% 60%, #b08866 0%, transparent 35%)",
          }}
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <div className="flex items-center justify-center gap-4 text-amber-100/40">
            <span className="font-display text-5xl font-semibold leading-none md:text-6xl">
              {cat.numeral}
            </span>
            <span className="h-px w-16 bg-current md:w-24" />
          </div>
          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.35em] text-amber-300">
            {cat.kicker}
          </p>
          <div className="mt-6 flex justify-center text-amber-100/70">
            {cat.glyph}
          </div>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-[1.75] text-amber-50/75 md:text-lg">
            {cat.intro}
          </p>
        </div>
      </section>

      {/* Story list */}
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto grid max-w-3xl gap-5">
          {cat.stories.map((story, idx) => (
            <StoryCard key={`${cat.id}-${idx}`} story={story} />
          ))}
        </div>
      </section>
    </div>
  );
}

function StoryCard({ story }: { story: Story }) {
  const isActive = story.href !== null;

  const inner = (
    <div className="relative flex h-full flex-col gap-3 p-6 md:p-8">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-300/80 md:text-[11px]">
          {story.era}
        </span>
        {!isActive && (
          <span className="rounded-full border border-amber-100/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.25em] text-amber-100/40 md:text-[10px]">
            Скоро
          </span>
        )}
      </div>

      <div>
        <h3 className="font-display text-2xl font-semibold leading-tight tracking-tight md:text-3xl">
          {story.title}
        </h3>
        <p className="mt-1 font-display text-base italic text-amber-200/60 md:text-lg">
          {story.subtitle}
        </p>
      </div>

      <p className="text-sm leading-[1.6] text-amber-50/70 md:text-[15px]">
        {story.body}
      </p>

      {isActive && (
        <div className="mt-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-amber-200">
          <span>Открыть</span>
          <span
            aria-hidden
            className="inline-block transition-transform duration-300 group-hover/card:translate-x-2"
          >
            →
          </span>
        </div>
      )}
    </div>
  );

  const base =
    "group/card relative overflow-hidden rounded-lg border transition-all duration-300";

  if (!isActive) {
    return (
      <div
        className={[
          base,
          "border-amber-100/8 bg-amber-950/15 opacity-50",
        ].join(" ")}
      >
        {inner}
      </div>
    );
  }

  return (
    <LocalizedLink
      href={story.href!}
      className={[
        base,
        "border-amber-100/15 bg-amber-950/25 hover:-translate-y-0.5 hover:border-amber-100/40 hover:bg-amber-950/45",
      ].join(" ")}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
        style={{
          background:
            "radial-gradient(ellipse 60% 80% at 20% 0%, rgba(243,234,212,0.10) 0%, transparent 70%)",
        }}
      />
      {inner}
    </LocalizedLink>
  );
}
