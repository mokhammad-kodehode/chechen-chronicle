import { LocalizedLink } from "@/app/components/common/LocalizedLink";

type Props = {
  kicker?: string;
  title: string;
  text: string;
  cta: string;
  /** Optional secondary link (e.g. "the whole Family Archive"). */
  secondary?: { href: string; label: string };
};

// Dark band that invites a reader to send their family's story. Used
// on the museum home page, the archive list and every story page —
// the archive only grows if the invitation is everywhere.
export function FamilyShareCta({ kicker, title, text, cta, secondary }: Props) {
  return (
    <section className="relative overflow-hidden bg-[#0c0805] text-amber-50">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 20%, #f3ead4 0%, transparent 45%), radial-gradient(circle at 85% 80%, #b08866 0%, transparent 40%)",
        }}
      />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-6 py-16 text-center md:py-20">
        {kicker ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-amber-300/80">
            {kicker}
          </p>
        ) : null}
        <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
          {title}
        </h2>
        <p className="mt-4 max-w-2xl text-[15px] leading-[1.7] text-amber-50/75 md:text-base">
          {text}
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
          <LocalizedLink
            href="/family-archive/submit"
            className="inline-flex h-12 items-center justify-center gap-3 rounded-sm bg-amber-100 px-7 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#0c0805] transition hover:bg-white"
          >
            {cta}
            <span aria-hidden>→</span>
          </LocalizedLink>
          {secondary ? (
            <LocalizedLink
              href={secondary.href}
              className="group/sec inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-100/80 transition hover:text-white"
            >
              <span>{secondary.label}</span>
              <span
                aria-hidden
                className="transition-transform duration-300 group-hover/sec:translate-x-1"
              >
                →
              </span>
            </LocalizedLink>
          ) : null}
        </div>
      </div>
    </section>
  );
}
