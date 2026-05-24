import Image from "next/image";
import heroTower from "@/public/images/hero-tower.webp";
import { LocalizedLink } from "../common/LocalizedLink";
import type { Dictionary } from "@/app/lib/i18n/shared";

type Props = {
  dict: Dictionary["home"]["hero"];
};

export function HomeHero({ dict }: Props) {
  return (
    <section className="relative overflow-hidden bg-[#EFE4CC]">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src={heroTower}
          alt={dict.title}
          fill
          priority
          placeholder="blur"
          sizes="100vw"
          className="animate-hero-photo object-cover object-[65%_center] sm:object-center"
        />

        {/* Base paper tint — fades in as the photo "ages" */}
        <div className="animate-paper-age absolute inset-0 bg-gradient-to-b from-[#F4F0E8]/75 via-[#F7F2E8]/68 to-[#F4F0E8]/58" />

        {/* Soft vignette */}
        <div
          className="animate-fade absolute inset-0"
          style={{
            background:
              "radial-gradient(70% 60% at 50% 38%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.18) 55%, rgba(0,0,0,0.06) 100%)",
            animationDelay: "100ms",
          }}
        />
      </div>

      <div className="relative mx-auto flex min-h-svh max-w-6xl items-center px-4 py-10 md:py-14">
        <div className="mx-auto w-full max-w-2xl text-center">
          <div
            className="animate-rise mx-auto inline-flex items-center justify-center rounded border border-amber-900/40 bg-white/60 px-4 py-2 text-[11px] font-semibold tracking-widest text-amber-900 backdrop-blur"
            style={{ animationDelay: "80ms" }}
          >
            {dict.kicker}
          </div>

          <h1
            className="animate-rise mt-6 text-4xl font-semibold tracking-tight text-amber-950 md:text-6xl"
            style={{ animationDelay: "160ms" }}
          >
            {dict.title}
          </h1>

          <p
            className="animate-rise mt-3 text-lg font-semibold italic text-amber-900/90 md:text-xl"
            style={{ animationDelay: "240ms" }}
          >
            {dict.subtitle}
          </p>

          <p
            className="animate-rise mx-auto mt-6 max-w-xl text-sm leading-6 text-neutral-700 md:text-base"
            style={{ animationDelay: "320ms" }}
          >
            {dict.description}
          </p>

          <div
            className="animate-rise mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
            style={{ animationDelay: "400ms" }}
          >
            <LocalizedLink
              href="/istorii/bashnya"
              className="inline-flex h-11 items-center justify-center rounded border border-amber-900 bg-amber-900 px-6 text-sm font-semibold text-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-amber-800 hover:shadow-md active:translate-y-0"
            >
              {dict.buttonStart}
            </LocalizedLink>

            <LocalizedLink
              href="/map"
              className="inline-flex h-11 items-center justify-center rounded border border-amber-900/60 bg-white/70 px-6 text-sm font-semibold text-amber-900 transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-sm active:translate-y-0"
            >
              {dict.buttonMap}
            </LocalizedLink>
          </div>

          {/* ornament */}
          <div
            className="animate-rise mt-10 flex items-center justify-center gap-4 text-amber-900/40 md:mt-12"
            style={{ animationDelay: "480ms" }}
          >
            <span className="animate-shimmer h-px w-20 origin-right bg-amber-900/30" />
            <span className="h-1.5 w-1.5 rotate-45 bg-amber-900/40" />
            <span className="animate-shimmer h-px w-20 origin-left bg-amber-900/30" />
          </div>
        </div>
      </div>
    </section>
  );
}
