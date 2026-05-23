"use client";

import { PublicationCategory } from "@/app/lib/publications";
import { format, type Dictionary } from "@/app/lib/i18n/shared";

type Props = {
  categories: PublicationCategory[];
  active: PublicationCategory | "all";
  onChange: (next: PublicationCategory | "all") => void;
  query: string;
  onQueryChange: (next: string) => void;
  total: number;
  dict: Dictionary["publications"];
};

export function PublicationFilters({
  categories,
  active,
  onChange,
  query,
  onQueryChange,
  total,
  dict,
}: Props) {
  return (
    <div className="flex flex-col gap-5 border-b border-amber-900/10 pb-6 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <FilterPill
          label={dict.filters.all}
          active={active === "all"}
          onClick={() => onChange("all")}
        />
        {categories.map((cat) => (
          <FilterPill
            key={cat}
            label={dict.categories[cat]}
            active={active === cat}
            onClick={() => onChange(cat)}
          />
        ))}
      </div>

      <div className="flex items-center gap-3">
        <label className="relative block">
          <span className="sr-only">{dict.filters.searchLabel}</span>
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={dict.filters.searchPlaceholder}
            className="h-10 w-full min-w-[260px] rounded-md border border-amber-900/20 bg-white px-3 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-amber-900/60 focus:outline-none"
          />
        </label>
        <span className="hidden whitespace-nowrap text-xs text-neutral-500 md:inline">
          {format(dict.filters.found, { n: total })}
        </span>
      </div>
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full border px-3.5 py-1.5 text-xs font-semibold tracking-wide transition",
        active
          ? "border-amber-900 bg-amber-900 text-white"
          : "border-amber-900/25 bg-white text-amber-900 hover:border-amber-900/60",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
