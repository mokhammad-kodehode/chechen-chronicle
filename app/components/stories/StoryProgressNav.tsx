"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useScroll } from "@react-three/drei";

// Vertical progress navigator for story pages.
//
// Rendered inline inside <Scroll html> — the existing "← Назад"
// button uses the same `fixed` positioning trick and it works, so
// we don't need a portal. Drei's Html overlay is itself positioned
// to fill the viewport, so `position: fixed` children sit where you
// expect them on screen.
//
// A thin vertical track with an amber-coloured fill grows downward
// as the reader scrolls through the story. Each section title sits
// next to its respective position on the track — past sections
// brighten, upcoming sections stay dim. Click any title to smooth-
// scroll straight to that section.

type Section = { id: string; title: string };

type Props = {
  sections: Section[];
};

type Labels = { ariaLabel: string };

const LABELS_BY_LANG: Record<string, Labels> = {
  ru: { ariaLabel: "Главы истории" },
  en: { ariaLabel: "Story chapters" },
  ce: { ariaLabel: "Главы истории" },
};

function getLabels(lang: string | undefined): Labels {
  return (lang && LABELS_BY_LANG[lang]) || LABELS_BY_LANG.ru!;
}

export function StoryProgressNav({ sections }: Props) {
  const scroll = useScroll();
  const params = useParams();
  const lang = typeof params?.lang === "string" ? params.lang : "ru";
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const el = scroll?.el;
    if (!el) return;
    const update = () => {
      const max = el.scrollHeight - el.clientHeight;
      const o = max > 0 ? el.scrollTop / max : 0;
      setOffset(Math.min(Math.max(o, 0), 1));
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    return () => el.removeEventListener("scroll", update);
  }, [scroll]);

  const goToSection = (idx: number) => {
    const el = scroll?.el;
    if (!el) return;
    el.scrollTo({ top: idx * el.clientHeight, behavior: "smooth" });
  };

  const total = sections.length;
  const activeIdx = Math.min(Math.floor(offset * total), total - 1);
  const fillRatio = offset;
  const labels = getLabels(lang);

  return (
    <nav
      aria-label={labels.ariaLabel}
      className="pointer-events-auto fixed left-5 top-1/2 z-[55] -translate-y-1/2 md:left-8"
    >
      <div className="flex items-stretch gap-5">
        {/* Vertical track + amber fill */}
        <div className="relative w-[2px] shrink-0 overflow-hidden rounded-full bg-amber-100/15">
          <div
            className="absolute inset-x-0 top-0 rounded-full bg-gradient-to-b from-amber-200 to-amber-400 transition-[height] duration-500 ease-out"
            style={{ height: `${fillRatio * 100}%` }}
          />
        </div>

        {/* Section titles, equally spaced */}
        <ul className="flex flex-col justify-between gap-5">
          {sections.map((sec, idx) => {
            const isActive = idx === activeIdx;
            const isPast = idx < activeIdx;
            return (
              <li key={sec.id}>
                <button
                  type="button"
                  onClick={() => goToSection(idx)}
                  aria-current={isActive ? "true" : undefined}
                  className={[
                    "text-left font-display text-sm leading-tight transition-all duration-300 hover:translate-x-0.5 hover:text-white md:text-base",
                    isActive
                      ? "font-semibold text-white"
                      : isPast
                      ? "text-amber-100/65"
                      : "text-amber-100/30",
                  ].join(" ")}
                >
                  {sec.title}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
