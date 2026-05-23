import { LocalizedLink } from "@/app/components/common/LocalizedLink";
import { Reveal } from "@/app/components/common/Reveal";
import { TimelineItemCard, TimelineItem } from "@/app/components/timeline/TimelineItemCard";
import type { Dictionary } from "@/app/lib/i18n/shared";

const items: TimelineItem[] = [
  {
    id: "ancient",
    yearLabel: "VIII–VII вв. до н.э.",
    title: "Древние поселения",
    text: "Археологические находки свидетельствуют о присутствии древних племён на территории Кавказа. Первые поселения в горных районах, развитие земледелия и скотоводства.",
    side: "left",
  },
  {
    id: "early-medieval",
    yearLabel: "V–X века н.э.",
    title: "Раннее средневековье",
    text: "Формирование местных племенных союзов. Влияние Великого шёлкового пути на развитие торговли и культурных связей.",
    side: "right",
  },
  {
    id: "towers",
    yearLabel: "XIII–XV века",
    title: "Эпоха башенной архитектуры",
    text: "Расцвет строительства каменных башен и укреплений. Формирование тейповой системы общественного устройства.",
    side: "left",
  },
];

type Props = {
  dict: Dictionary["home"]["timeline"];
};

export function HomeTimelinePreview({ dict }: Props) {
  return (
    <section className="bg-[#FBF7F0] py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-amber-950 md:text-4xl">
            <span className="inline-flex items-center gap-4">
              <span className="h-px w-10 bg-amber-900/40" />
              {dict.title}
              <span className="h-px w-10 bg-amber-900/40" />
            </span>
          </h2>
          <p className="mt-3 text-sm italic text-amber-900/70">{dict.subtitle}</p>
        </div>

        <div className="relative mt-16">
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-amber-900/20 md:block" />

          <div className="space-y-16 md:space-y-20">
            {items.map((item, idx) => {
              const isRight = item.side === "right";

              return (
                <div key={item.id} className="relative">
                  <div className="absolute left-1/2 top-8 hidden -translate-x-1/2 md:block">
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-900" />
                    <div className="mx-auto mt-2 h-5 w-px bg-amber-900/25" />
                  </div>

                  <div className="md:grid md:grid-cols-2 md:gap-10">
                    <div className={isRight ? "md:col-start-1 md:opacity-0" : "md:col-start-1"}>
                      {!isRight && (
                        <Reveal delay={idx * 80} from="left">
                          <div className="flex md:justify-end">
                            <TimelineItemCard item={item} />
                          </div>
                        </Reveal>
                      )}
                    </div>

                    <div className={isRight ? "md:col-start-2" : "md:col-start-2 md:opacity-0"}>
                      {isRight && (
                        <Reveal delay={idx * 80} from="right">
                          <div className="flex md:justify-start">
                            <TimelineItemCard item={item} />
                          </div>
                        </Reveal>
                      )}
                    </div>

                    <div className="md:hidden">
                      <Reveal delay={idx * 80} from="up">
                        <TimelineItemCard item={item} />
                      </Reveal>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-14 text-center">
            <LocalizedLink
              href="/timeline"
              className="inline-flex h-11 items-center justify-center rounded border border-amber-900/60 bg-white px-6 text-sm font-semibold text-amber-900 hover:bg-white/80"
            >
              {dict.linkAll}
            </LocalizedLink>
          </div>
        </div>
      </div>
    </section>
  );
}
