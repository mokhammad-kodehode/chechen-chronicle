import { LocalizedLink } from "@/app/components/common/LocalizedLink";
import { format, type Dictionary } from "@/app/lib/i18n/shared";

type Props = {
  dict: Dictionary["family"]["hero"];
  count: number;
};

export function FamilyArchiveHero({ dict, count }: Props) {
  return (
    <section className="relative overflow-hidden border-b border-amber-900/10 bg-[#F4EFE3]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 55% at 50% 0%, rgba(146,64,14,0.09) 0%, rgba(255,255,255,0) 60%), radial-gradient(circle at 85% 90%, rgba(180,130,80,0.10) 0%, transparent 45%)",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="animate-rise text-[11px] font-semibold uppercase tracking-[0.38em] text-amber-800/75">
            {dict.kicker}
          </p>
          <h1
            className="animate-rise mt-6 font-display text-5xl font-semibold leading-[1.02] tracking-tight text-amber-950 md:text-7xl"
            style={{ animationDelay: "80ms" }}
          >
            {dict.title}
          </h1>
          <p
            className="animate-rise mx-auto mt-6 max-w-2xl font-display text-lg italic leading-[1.6] text-amber-900/80 md:text-xl"
            style={{ animationDelay: "160ms" }}
          >
            {dict.description}
          </p>

          <div
            className="animate-rise mt-10 flex flex-col items-center gap-4"
            style={{ animationDelay: "240ms" }}
          >
            <LocalizedLink
              href="/family-archive/submit"
              className="inline-flex h-12 items-center justify-center gap-3 rounded-sm bg-amber-900 px-7 text-[11px] font-semibold uppercase tracking-[0.28em] text-white transition hover:bg-amber-800"
            >
              {dict.cta}
              <span aria-hidden>→</span>
            </LocalizedLink>
            {count > 0 ? (
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-900/55">
                {format(dict.count, { n: count })}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
