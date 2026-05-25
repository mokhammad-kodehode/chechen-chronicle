import { LocalizedLink } from "@/app/components/common/LocalizedLink";
import { Reveal } from "@/app/components/common/Reveal";
import type { Dictionary } from "@/app/lib/i18n/shared";

// "Из хроники" — closing manuscript spread of the home page.
//
// Three timeline entries laid out as an editorial chronicle: thin
// hairlines separating each entry, big serif year label on the left,
// title + body on the right. No card chrome — feels like the entries
// in a printed almanac.

type Item = {
  id: string;
  yearLabel: string;
  title: string;
  text: string;
};

const ITEMS: Item[] = [
  {
    id: "ancient",
    yearLabel: "VIII–VII в. до н.э.",
    title: "Древние поселения",
    text: "Археологические находки свидетельствуют о присутствии древних племён на Кавказе. Первые поселения в горах, развитие земледелия и скотоводства.",
  },
  {
    id: "early-medieval",
    yearLabel: "V–X в. н.э.",
    title: "Раннее средневековье",
    text: "Формирование местных племенных союзов. Влияние Великого шёлкового пути на торговлю и культурные связи.",
  },
  {
    id: "towers",
    yearLabel: "XIII–XV в.",
    title: "Эпоха башенной архитектуры",
    text: "Расцвет строительства каменных башен и укреплений. Формирование тейповой системы общественного устройства.",
  },
];

type Props = {
  dict: Dictionary["home"]["timeline"];
};

export function HomeTimelinePreview({ dict }: Props) {
  return (
    <section className="relative overflow-hidden bg-[#F4EFE3] py-24 text-amber-950 md:py-32">
      {/* Page-seam hairline */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-900/25 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          background:
            "radial-gradient(circle at 25% 80%, rgba(244,231,200,0.6) 0%, transparent 55%)",
        }}
      />

      <div className="relative mx-auto max-w-4xl px-6">
        {/* Section header — same vocabulary as the publications spread */}
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-amber-800/70">
            Глава IV
          </p>
          <h2 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-amber-950 md:text-5xl">
            {dict.title}
          </h2>
          <p className="mt-3 font-display text-base italic text-amber-800/80 md:text-lg">
            {dict.subtitle}
          </p>

          <div className="mt-8 flex w-full max-w-[180px] items-center gap-3 text-amber-900/35">
            <span className="h-px flex-1 bg-current" />
            <span className="font-display text-[12px] tracking-[0.5em]">⁂</span>
            <span className="h-px flex-1 bg-current" />
          </div>
        </div>

        {/* Chronicle entries — editorial list, hairline separators,
            no card chrome. Year on the left rail, body on the right. */}
        <ul className="mt-16 divide-y divide-amber-900/15 border-y border-amber-900/15">
          {ITEMS.map((item, idx) => (
            <li key={item.id}>
              <Reveal delay={idx * 100}>
                <div className="grid grid-cols-1 gap-3 px-2 py-8 md:grid-cols-[180px_1fr] md:gap-10 md:px-4 md:py-10">
                  {/* Year label — serif, faded, sits like a margin note */}
                  <p className="font-display text-xl font-semibold leading-tight tracking-tight text-amber-800/65 md:text-2xl">
                    {item.yearLabel}
                  </p>

                  <div className="min-w-0">
                    <h3 className="font-display text-2xl font-semibold leading-tight tracking-tight text-amber-950 md:text-3xl">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-[15px] leading-[1.65] text-amber-900/75 md:text-base md:leading-[1.7]">
                      {item.text}
                    </p>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>

        {/* "Открыть всю хронологию →" — editorial link */}
        <div className="mt-14 flex justify-center">
          <LocalizedLink
            href="/timeline"
            className="group/cta inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-amber-900 transition-colors duration-300 hover:text-amber-950"
          >
            <span>{dict.linkAll}</span>
            <span
              aria-hidden
              className="inline-block transition-transform duration-300 group-hover/cta:translate-x-1.5"
            >
              →
            </span>
          </LocalizedLink>
        </div>
      </div>
    </section>
  );
}
