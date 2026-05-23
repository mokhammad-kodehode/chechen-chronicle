"use client";

import type {
  ArchiveKind,
  ArchiveOriginalLanguage,
} from "@/app/lib/archive";
import type { Dictionary } from "@/app/lib/i18n/shared";

type Props = {
  dict: Dictionary["archive"];
  selectedKinds: Set<ArchiveKind>;
  toggleKind: (k: ArchiveKind) => void;
  selectedLanguages: Set<ArchiveOriginalLanguage>;
  toggleLanguage: (l: ArchiveOriginalLanguage) => void;
  query: string;
  clearQuery: () => void;
  yearFrom: number;
  yearTo: number;
  yearRange: { min: number; max: number };
  resetYears: () => void;
};

export function ArchiveActiveFilters({
  dict,
  selectedKinds,
  toggleKind,
  selectedLanguages,
  toggleLanguage,
  query,
  clearQuery,
  yearFrom,
  yearTo,
  yearRange,
  resetYears,
}: Props) {
  const yearActive = yearFrom !== yearRange.min || yearTo !== yearRange.max;

  const isEmpty =
    selectedKinds.size === 0 &&
    selectedLanguages.size === 0 &&
    !query &&
    !yearActive;

  if (isEmpty) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 pb-6">
      <span className="text-[11px] uppercase tracking-widest text-neutral-500">
        {dict.filters.activeLabel}
      </span>

      {Array.from(selectedKinds).map((k) => (
        <Chip key={`k-${k}`} label={dict.kinds[k]} onRemove={() => toggleKind(k)} />
      ))}

      {Array.from(selectedLanguages).map((l) => (
        <Chip
          key={`l-${l}`}
          label={dict.languages[l]}
          onRemove={() => toggleLanguage(l)}
        />
      ))}

      {yearActive ? (
        <Chip label={`${yearFrom} — ${yearTo}`} onRemove={resetYears} />
      ) : null}

      {query ? <Chip label={`«${query}»`} onRemove={clearQuery} /> : null}
    </div>
  );
}

function Chip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-900/30 bg-amber-50 px-3 py-1 text-xs text-amber-900">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Снять фильтр"
        className="text-amber-900/60 transition hover:text-amber-950"
      >
        ×
      </button>
    </span>
  );
}
