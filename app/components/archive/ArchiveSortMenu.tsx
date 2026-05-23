"use client";

import type { Dictionary } from "@/app/lib/i18n/shared";

export type ArchiveSort = "newest" | "oldest" | "dateAsc" | "dateDesc";

type Props = {
  value: ArchiveSort;
  onChange: (next: ArchiveSort) => void;
  dict: Dictionary["archive"]["sort"];
};

export function ArchiveSortMenu({ value, onChange, dict }: Props) {
  return (
    <label className="flex items-center gap-2 text-sm text-neutral-700">
      <span className="text-[11px] uppercase tracking-widest text-neutral-500">
        {dict.label}:
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ArchiveSort)}
        className="h-9 rounded-md border border-amber-900/20 bg-white px-2 text-sm focus:border-amber-900/60 focus:outline-none"
      >
        <option value="newest">{dict.newest}</option>
        <option value="oldest">{dict.oldest}</option>
        <option value="dateDesc">{dict.dateDesc}</option>
        <option value="dateAsc">{dict.dateAsc}</option>
      </select>
    </label>
  );
}
