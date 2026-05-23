import React from "react";

export type TimelineItem = {
  id: string;
  yearLabel: string; // "VIII–VII вв. до н.э."
  title: string;     // "Древние поселения"
  text: string;      // описание
  side?: "left" | "right";
  imageUrl?: string; // позже: портрет/фото/артефакт
  icon?: React.ReactNode; // позже: иконка
};

type Props = {
  item: TimelineItem;
};

export function TimelineItemCard({ item }: Props) {
  return (
    <article
      className={[
        "w-full max-w-xl rounded border border-amber-900/20 bg-white/80 shadow-sm backdrop-blur",
        "px-7 py-6",
      ].join(" ")}
    >
      <div className="flex items-start gap-4">
        {/* Left visual: (будем улучшать: иконка/портрет) */}
        <div className="mt-1 hidden h-12 w-12 shrink-0 items-center justify-center rounded border border-amber-900/15 bg-amber-50/60 sm:flex">
          <span className="h-2 w-2 rotate-45 bg-amber-900/35" />
        </div>

        <div className="min-w-0">
          <div className="inline-flex items-center rounded bg-amber-900 px-3 py-1 text-[11px] font-semibold tracking-widest text-white">
            {item.yearLabel}
          </div>

          <h3 className="mt-3 text-xl font-semibold tracking-tight text-amber-950">
            {item.title}
          </h3>

          <p className="mt-3 text-sm leading-6 text-neutral-700">
            {item.text}
          </p>
        </div>
      </div>
    </article>
  );
}
