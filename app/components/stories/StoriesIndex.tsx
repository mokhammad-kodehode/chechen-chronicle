"use client";

import { useParams } from "next/navigation";
import { LocalizedLink } from "@/app/components/common/LocalizedLink";
import { Reveal } from "@/app/components/common/Reveal";
import { getCategories } from "./storiesData";
import { StoriesBannerCanvasDynamic } from "./StoriesBannerCanvasDynamic";
import { format, type Dictionary } from "@/app/lib/i18n/shared";

// 3D stories index — top-level menu.
//
// Banner heading + manuscript-style chapter rows (one per category).
// Clicking a row navigates to /istorii/<slug>.

export function StoriesIndex({ dict }: { dict: Dictionary }) {
  const t = dict.stories;
  const params = useParams();
  const lang = typeof params?.lang === "string" ? params.lang : "ru";
  const categories = getCategories(lang);
  return (
    <div className="min-h-screen bg-[#0c0805] text-amber-50">
      {/* ── Banner hero ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-amber-100/10 px-6 pb-24 pt-24 md:pb-32 md:pt-32">
        {/* Animated 3D dust field — fades softly into the next section
            via mask-image so there's no hard cutoff at the seam. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 [mask-image:linear-gradient(to_bottom,#000_0%,#000_55%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,#000_0%,#000_55%,transparent_100%)]"
        >
          <StoriesBannerCanvasDynamic />
        </div>

        {/* Soft radial wash on top of the canvas — keeps the centre
            slightly dimmer so the title stays crisp */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, #f3ead4 0%, transparent 40%), radial-gradient(circle at 80% 70%, #b08866 0%, transparent 35%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_55%_50%_at_50%_50%,rgba(12,8,5,0.85)_0%,rgba(12,8,5,0.5)_45%,transparent_85%)]"
        />

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-amber-300/80">
              {t.hero.kicker}
            </p>
            <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
              {t.hero.title}
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-[1.75] text-amber-50/80 md:text-lg">
              {t.hero.description}
            </p>

            <div className="mx-auto mt-10 flex max-w-[200px] items-center gap-3 text-amber-100/30">
              <span className="h-px flex-1 bg-current" />
              <span className="text-[10px] tracking-[0.5em]">⁂</span>
              <span className="h-px flex-1 bg-current" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Chapter rows — anchor target for "← Все категории"
           buttons on the individual category pages. */}
      <section
        id="categories"
        className="relative mx-auto max-w-5xl scroll-mt-20 px-6 pb-16 pt-4 md:pb-24 md:pt-6"
      >
        <div className="border-t border-amber-100/10">
          {categories.map((cat, idx) => {
            const activeCount = cat.stories.filter((s) => s.href !== null).length;
            const total = cat.stories.length;
            const featured = cat.stories.find((s) => s.href !== null);
            return (
              <Reveal key={cat.id} delay={120 + idx * 120}>
                <LocalizedLink
                  href={`/istorii/${cat.slug}`}
                  className="group/row relative block border-b border-amber-100/10 transition-colors duration-500 hover:bg-amber-100/[0.025]"
                >
                  {/* Hover side accent — vertical bar that grows in */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute left-0 top-1/2 h-0 w-[2px] -translate-y-1/2 bg-amber-200 transition-all duration-500 group-hover/row:h-2/3"
                  />

                  <div className="grid grid-cols-[auto_1fr_auto] items-center gap-5 px-2 py-8 md:grid-cols-[120px_56px_1fr_auto_40px] md:gap-8 md:px-6 md:py-12">
                    {/* Numeral */}
                    <span
                      aria-hidden
                      className="font-display text-5xl font-semibold leading-none text-amber-200/30 transition-all duration-500 group-hover/row:translate-x-1 group-hover/row:text-amber-200 md:text-7xl"
                    >
                      {cat.numeral}
                    </span>

                    {/* Glyph (desktop only) */}
                    <span
                      aria-hidden
                      className="hidden text-amber-100/40 transition-colors duration-500 group-hover/row:text-amber-100 md:inline-block"
                    >
                      {cat.glyph}
                    </span>

                    {/* Kicker + featured hint */}
                    <div className="min-w-0">
                      <h2 className="font-display text-2xl font-semibold tracking-tight text-amber-50 md:text-3xl">
                        {cat.kicker}
                      </h2>
                      {featured && (
                        <p className="mt-1.5 truncate text-xs text-amber-100/55 md:text-sm">
                          <span className="text-amber-200/70">→</span>{" "}
                          {featured.title}
                          <span className="text-amber-100/30">
                            {" "}
                            · {featured.subtitle}
                          </span>
                        </p>
                      )}
                    </div>

                    {/* Count (desktop only) */}
                    <span className="hidden text-[10px] uppercase tracking-[0.3em] text-amber-100/40 md:inline-block">
                      <span className="font-semibold text-amber-200/80">
                        {activeCount}
                      </span>
                      <span className="text-amber-100/25"> / {total}</span>
                    </span>

                    {/* Arrow */}
                    <span
                      aria-hidden
                      className="justify-self-end text-xl text-amber-200/60 transition-all duration-300 group-hover/row:translate-x-1.5 group-hover/row:text-amber-200 md:text-2xl"
                    >
                      →
                    </span>
                  </div>
                </LocalizedLink>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <section className="border-t border-amber-100/10 px-6 py-16 text-center md:py-20">
        <p className="mx-auto max-w-2xl text-sm leading-[1.7] text-amber-100/50 md:text-base">
          {t.footerNote}
        </p>
      </section>
    </div>
  );
}
