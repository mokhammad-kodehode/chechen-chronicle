import { LocalizedLink } from "@/app/components/common/LocalizedLink";
import { StoriesBannerCanvasDynamic } from "@/app/components/stories/StoriesBannerCanvasDynamic";
import type { Dictionary } from "@/app/lib/i18n/shared";

// Museum entrance — the first screen of the home page.
//
// Dark hall with the "threads of memory" constellation (the same 3D
// backdrop as the /istorii banner) behind a frontispiece title. Two
// ways in: walk into the 3D halls, or add your own family's story.

type Props = {
  dict: Dictionary["home"]["museum"]["hero"];
};

export function MuseumHero({ dict }: Props) {
  return (
    <section className="relative flex min-h-[calc(100svh-4rem)] items-center overflow-hidden bg-[#0c0805] px-6 py-24 text-amber-50">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 [mask-image:linear-gradient(to_bottom,#000_0%,#000_70%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,#000_0%,#000_70%,transparent_100%)]"
      >
        <StoriesBannerCanvasDynamic />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_60%_55%_at_50%_50%,rgba(12,8,5,0.88)_0%,rgba(12,8,5,0.55)_45%,transparent_85%)]"
      />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
        <p
          className="animate-rise text-[11px] font-semibold uppercase tracking-[0.42em] text-amber-300/80"
          style={{ animationDelay: "60ms" }}
        >
          {dict.kicker}
        </p>

        <h1
          className="animate-rise mt-7 font-display text-[64px] font-semibold leading-[0.95] tracking-tight sm:text-[96px] md:text-[128px]"
          style={{ animationDelay: "140ms" }}
        >
          {dict.title}
        </h1>

        <p
          className="animate-rise mt-5 font-display text-xl font-medium italic text-amber-100/80 md:text-3xl"
          style={{ animationDelay: "220ms" }}
        >
          {dict.subtitle}
        </p>

        <div
          className="animate-rise mt-10 flex w-full max-w-xs items-center gap-4 text-amber-100/30"
          style={{ animationDelay: "300ms" }}
        >
          <span className="h-px flex-1 bg-current" />
          <span className="font-display text-[13px] tracking-[0.6em]">⁂</span>
          <span className="h-px flex-1 bg-current" />
        </div>

        <p
          className="animate-rise mt-8 max-w-2xl text-base leading-[1.75] text-amber-50/75 md:text-lg"
          style={{ animationDelay: "380ms" }}
        >
          {dict.description}
        </p>

        <div
          className="animate-rise mt-10 flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row sm:gap-6"
          style={{ animationDelay: "460ms" }}
        >
          <LocalizedLink
            href="/#stories-preview"
            className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-sm bg-amber-100 px-8 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#0c0805] transition hover:bg-white sm:w-auto"
          >
            {dict.ctaEnter}
            <span aria-hidden>↓</span>
          </LocalizedLink>
          <LocalizedLink
            href="/family-archive/submit"
            className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-sm border border-amber-100/35 px-8 text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-100 transition hover:border-amber-100/70 hover:bg-amber-100/5 sm:w-auto"
          >
            {dict.ctaShare}
          </LocalizedLink>
        </div>
      </div>
    </section>
  );
}
