"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { LocalizedLink } from "@/app/components/common/LocalizedLink";
import { Reveal } from "@/app/components/common/Reveal";
import { getCategories, type Category } from "@/app/components/stories/storiesData";
import { format, type Dictionary } from "@/app/lib/i18n/shared";

// Home → Stories preview. Dark editorial "portal" between the bright hero
// and the timeline. Banner heading + three category "doors" (large
// numerals, glyph, brief intro, CTA per door).

type StoriesLabels = Dictionary["stories"];

export function HomeStoriesPreview({ dict }: { dict: Dictionary }) {
  const t = dict.stories;
  const params = useParams();
  const lang = typeof params?.lang === "string" ? params.lang : "ru";
  const categories = getCategories(lang);
  return (
    <section
      id="stories-preview"
      className="relative scroll-mt-20 overflow-hidden bg-[#0c0805] py-20 text-amber-50 md:py-28"
    >
      {/* Soft ornamental backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, #f3ead4 0%, transparent 45%), radial-gradient(circle at 80% 75%, #b08866 0%, transparent 40%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-100/20 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-100/20 to-transparent"
      />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Three category doors */}
        <div className="group/grid grid border border-amber-100/10 md:grid-cols-3">
          {categories.map((cat, idx) => (
            <Reveal
              key={cat.id}
              delay={150 + idx * 120}
              className={[
                "border-amber-100/10",
                idx > 0 ? "border-t md:border-l md:border-t-0" : "",
              ].join(" ")}
            >
              <CategoryDoor category={cat} labels={t} />
            </Reveal>
          ))}
        </div>

        {/* CTA */}
        <Reveal delay={650} className="mt-14 text-center md:mt-20">
          <LocalizedLink
            href="/istorii"
            className="group/cta inline-flex items-center gap-3 px-4 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-amber-100 transition-colors duration-300 hover:text-white"
          >
            <span>{t.openCTA}</span>
            <span
              aria-hidden
              className="inline-block transition-transform duration-300 group-hover/cta:translate-x-1"
            >
              →
            </span>
          </LocalizedLink>
        </Reveal>
      </div>
    </section>
  );
}

function CategoryDoor({
  category: cat,
  labels,
}: {
  category: Category;
  labels: StoriesLabels;
}) {
  const activeCount = cat.stories.filter((s) => s.href !== null).length;
  const total = cat.stories.length;

  return (
    <LocalizedLink
      // ?from=home flags the entry point so CategoryPage's back button
      // can read it and offer "← На главную" instead of "← Все категории".
      href={`/istorii/${cat.slug}?from=home`}
      className="group/door relative flex h-full min-h-[460px] flex-col justify-between overflow-hidden px-7 py-10 transition-all duration-500 group-hover/grid:opacity-50 hover:!opacity-100 md:min-h-[560px] md:px-8 md:py-12"
    >
      {/* Background cover image */}
      {cat.coverImage && (
        <Image
          src={cat.coverImage}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="pointer-events-none absolute inset-0 object-cover opacity-60 brightness-[0.7] saturate-[0.85] transition-all duration-[1400ms] ease-out group-hover/door:scale-[1.06] group-hover/door:opacity-80 group-hover/door:brightness-90 group-hover/door:saturate-100"
        />
      )}

      {/* Dark gradient veil — top transparent, bottom near-black so the
          footer content stays legible regardless of the underlying image */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0c0805]/55 via-[#0c0805]/35 to-[#0c0805]/95"
      />

      {/* Soft amber wash that intensifies on hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover/door:opacity-100"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 50% 40%, rgba(243,234,212,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Top: numeral + kicker chip */}
      <div className="relative flex items-start justify-between">
        <span
          aria-hidden
          className="font-display text-7xl font-semibold leading-none text-amber-50/85 drop-shadow-[0_6px_18px_rgba(0,0,0,0.6)] transition-all duration-500 group-hover/door:text-amber-100 md:text-8xl"
        >
          {cat.numeral}
        </span>
        <span className="mt-3 rounded-full border border-amber-100/25 bg-[#0c0805]/55 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-200 backdrop-blur-sm md:text-[11px]">
          {cat.kicker}
        </span>
      </div>

      {/* Bottom: glyph + count + CTA over the dark gradient */}
      <div className="relative">
        <div className="text-amber-100/80 transition-colors duration-500 group-hover/door:text-amber-100">
          {cat.glyph}
        </div>

        <div className="mt-6 text-[11px] uppercase tracking-[0.25em] text-amber-100/65">
          <span className="font-semibold text-amber-200">{activeCount}</span>
          {" "}
          {format(labels.outOf, {
            active: "",
            total,
            word: pickStoryWord(total, labels),
          })
            .replace(/^\s+/, "")
            .trim()}
        </div>

        <div className="mt-5 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-amber-200">
          <span>{labels.open}</span>
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

// Pick the right plural form using the labels' stories_one / _few /
// _many keys. Works for both Russian-style 3-form pluralisation and
// English-style 2-form (one/many).
function pickStoryWord(n: number, labels: StoriesLabels): string {
  const lastTwo = n % 100;
  if (lastTwo >= 11 && lastTwo <= 14) return labels.stories_many;
  const last = n % 10;
  if (last === 1) return labels.stories_one;
  if (last >= 2 && last <= 4) return labels.stories_few;
  return labels.stories_many;
}

function wordForStories(n: number): string {
  const lastTwo = n % 100;
  if (lastTwo >= 11 && lastTwo <= 14) return "историй";
  const last = n % 10;
  if (last === 1) return "истории";
  if (last >= 2 && last <= 4) return "историй";
  return "историй";
}
