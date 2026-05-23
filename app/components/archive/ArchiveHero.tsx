import type { Dictionary } from "@/app/lib/i18n/shared";

type Props = {
  dict: Dictionary["archive"]["hero"];
  count: number;
};

export function ArchiveHero({ dict, count }: Props) {
  return (
    <section className="relative overflow-hidden border-b border-amber-900/10 bg-[#FBF7F0]">
      <div className="absolute inset-0 opacity-[0.5]" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 0%, rgba(146,64,14,0.08) 0%, rgba(255,255,255,0) 60%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center justify-center rounded border border-amber-900/40 bg-white/70 px-4 py-2 text-[11px] font-semibold tracking-widest text-amber-900 backdrop-blur">
            {dict.kicker}
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-amber-950 md:text-5xl">
            {dict.title}
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-neutral-700">
            {dict.description}
          </p>

          <p className="mt-6 text-xs uppercase tracking-widest text-amber-900/60">
            {count}
          </p>

          <div className="mt-10 flex items-center justify-center gap-4 text-amber-900/40">
            <span className="h-px w-20 bg-amber-900/30" />
            <span className="h-1.5 w-1.5 rotate-45 bg-amber-900/40" />
            <span className="h-px w-20 bg-amber-900/30" />
          </div>
        </div>
      </div>
    </section>
  );
}
