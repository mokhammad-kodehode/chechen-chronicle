import Image from "next/image";
import type { Dictionary } from "@/app/lib/i18n/shared";

type Props = {
  dict: Dictionary["publications"]["hero"];
};

export function PublicationsHero({ dict }: Props) {
  return (
    <section className="relative overflow-hidden border-b border-amber-900/10">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/images/publication.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Soft warm tint to keep text readable on top of the photo */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FBF7F0]/40 via-[#FBF7F0]/35 to-[#FBF7F0]/55" />
      </div>

      <div className="relative mx-auto flex min-h-[65svh] max-w-6xl items-center px-4 py-16 md:min-h-[70svh] md:py-24">
        <div className="mx-auto w-full min-w-0 max-w-3xl text-center">
          {/* Decorative book ornament */}
          <svg
            width="44"
            height="44"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-fade-fast mx-auto mb-6 text-amber-900/70"
            style={{ animationDelay: "0ms" }}
            aria-hidden
          >
            <path d="M2 4h6.5a3.5 3.5 0 0 1 3.5 3.5V21a2.5 2.5 0 0 0-2.5-2.5H2z" />
            <path d="M22 4h-6.5A3.5 3.5 0 0 0 12 7.5V21a2.5 2.5 0 0 1 2.5-2.5H22z" />
          </svg>

          <h1
            className="animate-fade-fast text-4xl font-semibold tracking-tight text-amber-950 sm:text-5xl md:text-6xl"
            style={{ animationDelay: "100ms" }}
          >
            {dict.title}
          </h1>

          <p
            className="animate-fade-fast mx-auto mt-5 max-w-2xl text-base leading-7 text-neutral-800"
            style={{ animationDelay: "200ms" }}
          >
            {dict.description}
          </p>

          {/* Bottom ornament — diamond appears with container,
              then horizontal lines extend outward from it */}
          <div
            className="animate-fade-fast mt-10 flex items-center justify-center gap-4 text-amber-900/50"
            style={{ animationDelay: "300ms" }}
          >
            <span
              className="animate-line-extend h-px w-20 origin-right bg-amber-900/40"
              style={{ animationDelay: "850ms" }}
            />
            <span className="h-1.5 w-1.5 rotate-45 bg-amber-900/50" />
            <span
              className="animate-line-extend h-px w-20 origin-left bg-amber-900/40"
              style={{ animationDelay: "850ms" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
