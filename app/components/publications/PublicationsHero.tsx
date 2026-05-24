import Image from "next/image";
import heroPhoto from "@/public/images/publication.png";
import type { Dictionary } from "@/app/lib/i18n/shared";

type Props = {
  dict: Dictionary["publications"]["hero"];
};

export function PublicationsHero({ dict }: Props) {
  return (
    <section className="relative overflow-hidden border-b border-amber-900/10 bg-[#EFE4CC]">
      {/* Background photo with sepia "ageing" + slow ken-burns */}
      <div className="absolute inset-0">
        <Image
          src={heroPhoto}
          alt=""
          fill
          priority
          placeholder="blur"
          sizes="100vw"
          className="animate-hero-photo object-cover object-center"
        />

        {/* Paper tint — fades in as the photo "ages" */}
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

      <div className="relative mx-auto flex min-h-[60svh] max-w-6xl items-center px-4 py-16 md:min-h-[65svh] md:py-24">
        <div className="mx-auto w-full min-w-0 max-w-3xl text-center">
          {dict.kicker ? (
            <div
              className="animate-rise mx-auto inline-flex items-center justify-center rounded border border-amber-900/40 bg-white/60 px-4 py-2 text-[11px] font-semibold tracking-widest text-amber-900 backdrop-blur"
              style={{ animationDelay: "80ms" }}
            >
              {dict.kicker}
            </div>
          ) : null}

          <h1
            className="animate-rise mt-6 text-4xl font-semibold tracking-tight text-amber-950 sm:text-5xl md:text-6xl"
            style={{ animationDelay: "160ms" }}
          >
            {dict.title}
          </h1>

          <p
            className="animate-rise mx-auto mt-5 max-w-2xl text-base leading-7 text-neutral-800 md:text-lg"
            style={{ animationDelay: "240ms" }}
          >
            {dict.description}
          </p>

          {/* Bottom diamond ornament — appears with text, lines extend outward */}
          <div
            className="animate-rise mt-10 flex items-center justify-center gap-4 text-amber-900/40 md:mt-12"
            style={{ animationDelay: "320ms" }}
          >
            <span
              className="animate-line-extend h-px w-20 origin-right bg-amber-900/40"
              style={{ animationDelay: "720ms" }}
            />
            <span className="h-1.5 w-1.5 rotate-45 bg-amber-900/50" />
            <span
              className="animate-line-extend h-px w-20 origin-left bg-amber-900/40"
              style={{ animationDelay: "720ms" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
