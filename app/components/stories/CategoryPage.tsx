"use client";

import Image from "next/image";
import { LocalizedLink } from "@/app/components/common/LocalizedLink";
import type { Category, Story } from "./storiesData";

// ──────────────────────────────────────────────
// Single category page — header with category info + grid of stories.
//
// Reached via /istorii/<slug>. If any story in the category has an
// `image` field, the header gains a portrait-collage row showing those
// images stacked at slight angles, like clippings pinned to a board.
// ──────────────────────────────────────────────

export function CategoryPage({ category: cat }: { category: Category }) {
  // Collect portraits available for this category (used by the header
  // collage and to know whether to render it at all).
  const portraits = cat.stories.filter((s) => s.image);

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

        {/* Collage row — shown only if at least one story has an image.
            Placeholders fill in to keep the row balanced even when most
            stories don't have images yet. */}
        {portraits.length > 0 && (
          <CollageRow stories={cat.stories} />
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

// ──────────────────────────────────────────────
// COLLAGE ROW — pinned-clipping look at the top of the category header.
// Each story (image or not) gets a slot; missing images fall back to a
// dark tile with the era as a label, so the row reads as a timeline
// even when only one portrait is filled in.
// ──────────────────────────────────────────────

function CollageRow({ stories }: { stories: Story[] }) {
  // Tilt angles cycle so adjacent tiles aren't parallel — gives the
  // hand-pinned feel without randomness on every render.
  const tilts = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2"];

  return (
    <div className="relative mx-auto mb-14 flex max-w-3xl flex-wrap items-end justify-center gap-3 md:gap-5">
      {stories.map((story, idx) => {
        const tilt = tilts[idx % tilts.length];
        return (
          <div
            key={`${story.title}-${idx}`}
            className={[
              "relative h-32 w-24 overflow-hidden rounded-md border border-amber-100/15 shadow-[0_8px_28px_-12px_rgba(0,0,0,0.7)] transition-transform duration-500 hover:rotate-0 hover:scale-105 md:h-44 md:w-36",
              tilt,
            ].join(" ")}
          >
            {story.image ? (
              <Image
                src={story.image}
                alt={story.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 96px, 144px"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center bg-amber-950/40 p-2 text-center">
                <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-amber-100/40 md:text-[10px]">
                  {story.era}
                </span>
                <span className="mt-2 text-[10px] uppercase tracking-[0.3em] text-amber-100/30">
                  ?
                </span>
              </div>
            )}
            {/* Subtle vignette on each tile to unify the look */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0c0805]/60 via-transparent to-transparent"
            />
          </div>
        );
      })}
    </div>
  );
}

// ──────────────────────────────────────────────
// STORY CARD — with optional left-side portrait when `image` is set.
// ──────────────────────────────────────────────

function StoryCard({ story }: { story: Story }) {
  const isActive = story.href !== null;
  const hasImage = Boolean(story.image);

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
