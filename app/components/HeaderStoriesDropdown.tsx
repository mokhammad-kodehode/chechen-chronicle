"use client";

import { useParams } from "next/navigation";
import { LocalizedLink } from "./common/LocalizedLink";
import { getCategories } from "@/app/components/stories/storiesData";
import type { Dictionary } from "@/app/lib/i18n/shared";

// Mega-menu panel that opens on hover of the "Истории" navbar item.
// Three columns — one per category (Жилища / Орудия / Воины) — each
// listing its stories. Active stories link straight to the story
// page; placeholders are dimmed with a "скоро" tag.
//
// The header link of each column is itself clickable → goes to the
// category page. So a user can drill all the way to a specific story
// in one move OR open the whole category.

export function HeaderStoriesDropdown({ dict }: { dict: Dictionary }) {
  const tComingSoon = dict.stories.comingSoon;
  const params = useParams();
  const lang = typeof params?.lang === "string" ? params.lang : "ru";
  const categories = getCategories(lang);
  return (
    <div className="grid w-[640px] gap-x-6 gap-y-1 rounded-xl border border-amber-900/15 bg-amber-50/95 p-6 shadow-[0_20px_60px_-20px_rgba(120,53,15,0.35)] backdrop-blur-xl md:grid-cols-3">
      {categories.map((cat) => (
        <div key={cat.id} className="flex flex-col">
          {/* Category header — clickable, leads to /istorii/<slug> */}
          <LocalizedLink
            href={`/istorii/${cat.slug}`}
            className="group/cat flex items-baseline gap-2 border-b border-amber-900/15 pb-2"
          >
            <span className="font-display text-lg font-semibold text-amber-900/45 transition-colors group-hover/cat:text-amber-900">
              {cat.numeral}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-700 transition-colors group-hover/cat:text-amber-900">
              {cat.kicker}
            </span>
          </LocalizedLink>

          {/* Stories inside this category */}
          <ul className="mt-3 flex flex-col gap-1">
            {cat.stories.map((story, idx) => {
              const isActive = story.href !== null;
              return (
                <li key={`${cat.id}-${idx}`}>
                  {isActive ? (
                    <LocalizedLink
                      href={story.href!}
                      className="group/story block rounded-md px-2 py-1.5 transition-colors hover:bg-amber-100/60"
                    >
                      <p className="font-display text-[13px] font-medium leading-snug text-amber-950 transition-colors group-hover/story:text-amber-900">
                        {story.title}
                      </p>
                      <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-amber-900/55">
                        {story.era}
                      </p>
                    </LocalizedLink>
                  ) : (
                    <div className="flex items-center justify-between gap-2 px-2 py-1.5">
                      <div className="min-w-0">
                        <p className="truncate font-display text-[13px] font-medium leading-snug text-amber-950/45">
                          {story.title}
                        </p>
                        <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-amber-900/35">
                          {story.era}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full border border-amber-900/15 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.22em] text-amber-900/45">
                        {tComingSoon}
                      </span>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
