"use client";

import type {
  ArchiveKind,
  ArchiveOriginalLanguage,
} from "@/app/lib/archive";
import type { Dictionary } from "@/app/lib/i18n/shared";

type Props = {
  dict: Dictionary["archive"];
  allKinds: ArchiveKind[];
  allLanguages: ArchiveOriginalLanguage[];
  yearRange: { min: number; max: number };

  selectedKinds: Set<ArchiveKind>;
  toggleKind: (k: ArchiveKind) => void;

  selectedLanguages: Set<ArchiveOriginalLanguage>;
  toggleLanguage: (l: ArchiveOriginalLanguage) => void;

  yearFrom: number;
  yearTo: number;
  setYearRange: (from: number, to: number) => void;

  query: string;
  setQuery: (q: string) => void;

  reset: () => void;
};

export function ArchiveFilters({
  dict,
  allKinds,
  allLanguages,
  yearRange,
  selectedKinds,
  toggleKind,
  selectedLanguages,
  toggleLanguage,
  yearFrom,
  yearTo,
  setYearRange,
  query,
  setQuery,
  reset,
}: Props) {
  return (
    <aside className="space-y-7 rounded-lg border border-amber-900/15 bg-white p-5 lg:sticky lg:top-24">
      <div className="flex items-center justify-between border-b border-amber-900/10 pb-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-amber-950">
          {dict.filters.title}
        </h2>
        <button
          type="button"
          onClick={reset}
          className="text-[11px] font-semibold uppercase tracking-widest text-amber-900 transition hover:underline"
        >
          {dict.filters.reset}
        </button>
      </div>

      {/* Search */}
      <div>
        <label className="block">
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-amber-900/70">
            {dict.filters.searchLabel ?? "Поиск"}
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={dict.filters.searchPlaceholder}
            className="h-10 w-full rounded-md border border-amber-900/20 bg-white px-3 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-amber-900/60 focus:outline-none focus:ring-2 focus:ring-amber-900/15"
          />
        </label>
      </div>

      {/* Kind */}
      <div>
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-amber-900/70">
          {dict.filters.kind}
        </h3>
        <ul className="space-y-2">
          {allKinds.map((k) => (
            <li key={k}>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700 hover:text-amber-950">
                <input
                  type="checkbox"
                  checked={selectedKinds.has(k)}
                  onChange={() => toggleKind(k)}
                  className="h-4 w-4 rounded border-amber-900/30 text-amber-900 focus:ring-amber-900/40"
                />
                {dict.kinds[k]}
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Language */}
      {allLanguages.length > 0 ? (
        <div>
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-amber-900/70">
            {dict.filters.language}
          </h3>
          <ul className="space-y-2">
            {allLanguages.map((l) => (
              <li key={l}>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700 hover:text-amber-950">
                  <input
                    type="checkbox"
                    checked={selectedLanguages.has(l)}
                    onChange={() => toggleLanguage(l)}
                    className="h-4 w-4 rounded border-amber-900/30 text-amber-900 focus:ring-amber-900/40"
                  />
                  {dict.languages[l]}
                </label>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Year range */}
      <div>
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-amber-900/70">
          {dict.filters.year}
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={yearRange.min}
            max={yearRange.max}
            value={yearFrom}
            onChange={(e) =>
              setYearRange(Number(e.target.value) || yearRange.min, yearTo)
            }
            className="h-9 w-full rounded-md border border-amber-900/20 bg-white px-2 text-sm focus:border-amber-900/60 focus:outline-none focus:ring-2 focus:ring-amber-900/15"
          />
          <span className="text-neutral-400">—</span>
          <input
            type="number"
            min={yearRange.min}
            max={yearRange.max}
            value={yearTo}
            onChange={(e) =>
              setYearRange(yearFrom, Number(e.target.value) || yearRange.max)
            }
            className="h-9 w-full rounded-md border border-amber-900/20 bg-white px-2 text-sm focus:border-amber-900/60 focus:outline-none focus:ring-2 focus:ring-amber-900/15"
          />
        </div>
        <p className="mt-2 text-[11px] text-neutral-500">
          {yearRange.min} — {yearRange.max}
        </p>
      </div>
    </aside>
  );
}
