"use client";

import { LocalizedLink } from "@/app/components/common/LocalizedLink";
import { CATEGORIES, type Category } from "./storiesData";

// ──────────────────────────────────────────────
// 3D stories index — top-level menu.
//
// Shows ONLY the three category entries. Clicking a category navigates
// to /istorii/<slug>, where the user sees the stories within that
// category. This keeps the top-level navigation light: choose a theme
// first, then a specific story.
// ──────────────────────────────────────────────

export function StoriesIndex() {
  return (
    <div className="min-h-screen bg-[#0c0805] text-amber-50">
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-amber-100/10 px-6 pb-16 pt-24 md:pb-20 md:pt-32">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, #f3ead4 0%, transparent 40%), radial-gradient(circle at 80% 70%, #b08866 0%, transparent 35%)",
          }}
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-amber-300/80">
            Истории в объёме
          </p>
          <p className="mx-auto mt-8 max-w-xl text-base leading-[1.75] text-amber-50/80 md:text-lg">
            Архив трёхмерных историй: жилища, орудия и люди Кавказа.
            Каждая глава разворачивается при скролле — текст и модель идут
            синхронно, эпоху можно увидеть, а не только прочитать.
          </p>
          <div className="mx-auto mt-10 flex max-w-xs items-center gap-4 text-amber-100/30">
            <span className="h-px flex-1 bg-current" />
            <span className="text-xs tracking-[0.4em]">⁂</span>
            <span className="h-px flex-1 bg-current" />
          </div>
        </div>
      </section>

      {/* ── Three large category gates ───────────────────────────── */}
      <div className="group/grid grid md:grid-cols-3">
        {CATEGORIES.map((cat, idx) => (
          <CategoryGate key={cat.id} category={cat} index={idx} />
        ))}
      </div>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <section className="border-t border-amber-100/10 px-6 py-16 text-center md:py-20">
        <p className="mx-auto max-w-2xl text-sm leading-[1.7] text-amber-100/50 md:text-base">
          Архив пополняется по мере появления 3D-сканов, документов и
          архивных источников. Если у вас есть материал — напишите редакции.
        </p>
      </section>
    </div>
  );
}

function CategoryGate({
  category: cat,
  index,
}: {
  category: Category;
  index: number;
}) {
  const activeCount = cat.stories.filter((s) => s.href !== null).length;
  const total = cat.stories.length;

  return (
    <LocalizedLink
      href={`/istorii/${cat.slug}`}
      className={[
        "group/door relative flex min-h-[68vh] flex-col justify-between overflow-hidden border-amber-100/10 px-8 py-14 transition-all duration-500 md:min-h-[78vh] md:py-20",
        "border-b md:border-b-0",
        index < CATEGORIES.length - 1 ? "md:border-r" : "",
        "group-hover/grid:opacity-50 hover:!opacity-100 hover:bg-amber-950/30",
      ].join(" ")}
    >
      {/* Radial glow on hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover/door:opacity-100"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(243,234,212,0.10) 0%, transparent 70%)",
        }}
      />

      {/* Top: numeral + kicker */}
      <div className="relative flex items-start justify-between">
        <span
          aria-hidden
          className="font-display text-7xl font-semibold leading-none text-amber-200/25 transition-all duration-500 group-hover/door:text-amber-200/70 md:text-8xl"
        >
          {cat.numeral}
        </span>
        <span className="mt-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-300 md:text-[11px]">
          {cat.kicker}
        </span>
      </div>

      {/* Middle: glyph */}
      <div className="relative my-10 flex flex-col items-start gap-6 md:my-14">
        <div className="text-amber-100/60 transition-colors duration-500 group-hover/door:text-amber-100">
          {cat.glyph}
        </div>
      </div>

      {/* Bottom: intro + counts + CTA */}
      <div className="relative">
        <p className="text-sm leading-[1.65] text-amber-50/75 md:text-base">
          {cat.intro}
        </p>

        <div className="mt-6 flex items-baseline gap-2 text-[11px] uppercase tracking-[0.25em] text-amber-100/45">
          <span className="font-semibold text-amber-200/80">{activeCount}</span>
          <span>из {total} {wordForStories(total)}</span>
        </div>

        <div className="mt-6 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-amber-200">
          <span>Открыть</span>
          <span
            aria-hidden
            className="inline-block transition-transform duration-300 group-hover/door:translate-x-2"
          >
            →
          </span>
        </div>
      </div>
    </LocalizedLink>
  );
}

function wordForStories(n: number): string {
  // Russian pluralization: 1 история, 2-4 истории, 5+ историй
  const lastTwo = n % 100;
  if (lastTwo >= 11 && lastTwo <= 14) return "историй";
  const last = n % 10;
  if (last === 1) return "истории";
  if (last >= 2 && last <= 4) return "историй";
  return "историй";
}
