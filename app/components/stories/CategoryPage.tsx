"use client";

import { Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { LocalizedLink } from "@/app/components/common/LocalizedLink";
import type { Category, Story } from "./storiesData";
import type { Dictionary } from "@/app/lib/i18n/shared";

// ──────────────────────────────────────────────
// Single category page — header with category info + grid of stories.
//
// Reached via /istorii/<slug>. If any story in the category has an
// `image` field, the header gains a portrait-collage row showing those
// images stacked at slight angles, like clippings pinned to a board.
// ──────────────────────────────────────────────

export function CategoryPage({
  category: cat,
  dict,
}: {
  category: Category;
  dict: Dictionary;
}) {
  // Collect portraits available for this category (used by the header
  // collage and to know whether to render it at all).
  const portraits = cat.stories.filter((s) => s.image);
  const t = dict.stories;

  return (
    <div className="min-h-screen bg-[#0c0805] text-amber-50">
      {/* Back link — wrapped in Suspense because useSearchParams forces
          a dynamic boundary; fallback renders the default "categories"
          variant so there's still a back button while params resolve. */}
      <Suspense fallback={<BackLink fromHome={false} labels={t} />}>
        <BackLinkWithParams labels={t} />
      </Suspense>

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

        {/* Collage row — shown only if at least one story has an image.
            Placeholders fill in to keep the row balanced even when most
            stories don't have images yet. */}
        {portraits.length > 0 && (
          <CollageRow
            stories={cat.stories}
            categoryGlyph={cat.glyph}
            labels={t}
          />
        )}

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

      {/* Story list — anchor for "back from story → land on the choice
          list" auto-scroll. Story pages link to /istorii/<slug>#stories
          so the user returns straight to the cards, skipping the header. */}
      <section id="stories" className="scroll-mt-20 px-6 py-16 md:py-24">
        <div className="mx-auto grid max-w-3xl gap-5">
          {cat.stories.map((story, idx) => (
            <StoryCard
              key={`${cat.id}-${idx}`}
              story={story}
              labels={t}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

// ──────────────────────────────────────────────
// BACK LINK — destination depends on entry point.
//
//   • Arrived from the home preview (link tagged ?from=home)
//       → "← На главную" → "/"
//   • Anywhere else (default)
//       → "← Все категории" → "/istorii#categories"
//
// Split into a presentational `BackLink` and a `BackLinkWithParams`
// wrapper so the Suspense fallback can render the same chrome without
// needing useSearchParams.
// ──────────────────────────────────────────────

function BackLinkWithParams({ labels }: { labels: Dictionary["stories"] }) {
  const searchParams = useSearchParams();
  const fromHome = searchParams?.get("from") === "home";
  return <BackLink fromHome={fromHome} labels={labels} />;
}

function BackLink({
  fromHome,
  labels,
}: {
  fromHome: boolean;
  labels?: Dictionary["stories"];
}) {
  const href = fromHome ? "/#stories-preview" : "/istorii#categories";
  const label = labels
    ? fromHome
      ? labels.homeBack
      : labels.categoriesAll
    : fromHome
    ? "← На главную"
    : "← Все категории";
  return (
    <div className="fixed left-4 top-20 z-50 md:left-8 md:top-24">
      <LocalizedLink
        href={href}
        className="inline-flex items-center gap-2 rounded-full border border-amber-100/15 bg-amber-950/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-amber-100/80 backdrop-blur transition hover:border-amber-100/40 hover:bg-amber-950 hover:text-white"
      >
        {label}
      </LocalizedLink>
    </div>
  );
}

// ──────────────────────────────────────────────
// COLLAGE ROW — pinned-clipping look at the top of the category header.
// Image tiles show the portrait with an era label; placeholders are
// styled like miniature editorial "doors" (roman numeral + era kicker +
// faded category glyph + "Скоро" pill) so the row reads as intentional
// even when only one portrait is filled in.
// ──────────────────────────────────────────────

function CollageRow({
  stories,
  categoryGlyph,
  labels,
}: {
  stories: Story[];
  categoryGlyph: React.ReactNode;
  labels?: Dictionary["stories"];
}) {
  // Tilt angles cycle so adjacent tiles aren't parallel — gives the
  // hand-pinned feel without randomness on every render.
  const tilts = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2"];

  return (
    <div className="relative mx-auto mb-14 flex max-w-3xl flex-wrap items-end justify-center gap-3 md:gap-5">
      {stories.map((story, idx) => (
        <CollageTile
          key={`${story.title}-${idx}`}
          story={story}
          index={idx}
          tilt={tilts[idx % tilts.length] ?? ""}
          categoryGlyph={categoryGlyph}
          labels={labels}
        />
      ))}
    </div>
  );
}

function CollageTile({
  story,
  index,
  tilt,
  categoryGlyph,
  labels,
}: {
  story: Story;
  index: number;
  tilt: string;
  categoryGlyph: React.ReactNode;
  labels?: Dictionary["stories"];
}) {
  const tComingSoon = labels?.comingSoon ?? "Скоро";
  const base = [
    "group/tile relative h-40 w-28 overflow-hidden rounded-md border border-amber-100/15 shadow-[0_8px_28px_-12px_rgba(0,0,0,0.7)] transition-all duration-500 hover:!rotate-0 hover:scale-105 md:h-52 md:w-40",
    tilt,
  ].join(" ");

  if (story.image) {
    return (
      <div className={base}>
        <Image
          src={story.image}
          alt={story.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 112px, 160px"
        />
        {/* Bottom gradient so the era label stays legible */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0c0805] via-[#0c0805]/20 to-transparent"
        />
        <div className="absolute inset-x-0 bottom-0 p-2.5 md:p-3">
          <p className="text-[8px] font-semibold uppercase tracking-[0.3em] text-amber-300/90 md:text-[10px]">
            {story.era}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={[
        base,
        "bg-amber-950/20 transition-colors hover:border-amber-100/30 hover:bg-amber-950/35",
      ].join(" ")}
    >
      <div className="flex h-full flex-col p-2.5 md:p-3">
        {/* Top: numeral + era */}
        <div className="flex items-start justify-between gap-2">
          <span
            aria-hidden
            className="font-display text-lg font-semibold leading-none text-amber-200/35 transition-colors group-hover/tile:text-amber-200/70 md:text-2xl"
          >
            {romanNumeral(index + 1)}
          </span>
          <span className="text-right text-[7px] font-semibold uppercase tracking-[0.25em] text-amber-100/45 md:text-[9px]">
            {story.era}
          </span>
        </div>

        {/* Middle: faded category glyph */}
        <div className="flex flex-1 items-center justify-center text-amber-100/15 transition-colors group-hover/tile:text-amber-100/30 [&>svg]:h-10 [&>svg]:w-10 md:[&>svg]:h-14 md:[&>svg]:w-14">
          {categoryGlyph}
        </div>

        {/* Bottom: Скоро pill */}
        <div className="flex justify-center">
          <span className="rounded-full border border-amber-100/15 px-2 py-0.5 text-[7px] font-semibold uppercase tracking-[0.25em] text-amber-100/45 md:text-[9px]">
            {tComingSoon}
          </span>
        </div>
      </div>
    </div>
  );
}

function romanNumeral(n: number): string {
  return ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"][n - 1] ?? String(n);
}

// ──────────────────────────────────────────────
// STORY CARD — with optional left-side portrait when `image` is set.
// ──────────────────────────────────────────────

function StoryCard({
  story,
  labels,
}: {
  story: Story;
  labels?: Dictionary["stories"];
}) {
  const isActive = story.href !== null;
  const hasImage = Boolean(story.image);
  const tComingSoon = labels?.comingSoon ?? "Скоро";
  const tOpen = labels?.open ?? "Открыть";

  const inner = (
    <div
      className={[
        "relative grid h-full gap-0 md:gap-0",
        hasImage ? "md:grid-cols-[180px_1fr]" : "grid-cols-1",
      ].join(" ")}
    >
      {hasImage && (
        <div className="relative h-44 w-full overflow-hidden md:h-auto md:min-h-[200px]">
          <Image
            src={story.image!}
            alt={story.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 180px"
          />
          {/* Bottom gradient on mobile so text below blends; right
              gradient on md+ so the portrait fades into the card. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0c0805]/70 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-amber-950/30"
          />
        </div>
      )}

      <div className="relative flex flex-col gap-3 p-6 md:p-8">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-300/80 md:text-[11px]">
            {story.era}
          </span>
          {!isActive && (
            <span className="rounded-full border border-amber-100/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.25em] text-amber-100/40 md:text-[10px]">
              {tComingSoon}
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
            <span>{tOpen}</span>
            <span
              aria-hidden
              className="inline-block transition-transform duration-300 group-hover/card:translate-x-2"
            >
              →
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const base =
    "group/card relative overflow-hidden rounded-lg border transition-all duration-300";

  if (!isActive) {
    return (
      <div
        className={[base, "border-amber-100/8 bg-amber-950/15 opacity-50"].join(
          " "
        )}
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
