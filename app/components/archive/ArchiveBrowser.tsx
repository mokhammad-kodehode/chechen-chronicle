"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArchiveItem,
  ArchiveKind,
  ArchiveOriginalLanguage,
} from "@/app/lib/archive";
import type { Dictionary } from "@/app/lib/i18n/shared";
import { ArchiveCard } from "./ArchiveCard";
import { ArchiveFilters } from "./ArchiveFilters";
import { ArchiveActiveFilters } from "./ArchiveActiveFilters";
import { ArchiveSortMenu, type ArchiveSort } from "./ArchiveSortMenu";

type Props = {
  items: ArchiveItem[];
  allKinds: ArchiveKind[];
  allLanguages: ArchiveOriginalLanguage[];
  yearRange: { min: number; max: number };
  dict: Dictionary["archive"];
};

export function ArchiveBrowser({
  items,
  allKinds,
  allLanguages,
  yearRange,
  dict,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ——— Read state from URL ———
  const selectedKinds = useMemo(
    () => new Set(parseList(searchParams.get("kinds")) as ArchiveKind[]),
    [searchParams]
  );
  const selectedLanguages = useMemo(
    () =>
      new Set(
        parseList(searchParams.get("langs")) as ArchiveOriginalLanguage[]
      ),
    [searchParams]
  );
  const query = searchParams.get("q") ?? "";
  const yearFrom = parseInt(searchParams.get("from") ?? "", 10) || yearRange.min;
  const yearTo = parseInt(searchParams.get("to") ?? "", 10) || yearRange.max;
  const sort = (searchParams.get("sort") as ArchiveSort) || "newest";

  // ——— URL update helper ———
  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") params.delete(key);
        else params.set(key, value);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const toggleKind = (k: ArchiveKind) => {
    const next = new Set(selectedKinds);
    if (next.has(k)) next.delete(k);
    else next.add(k);
    updateParams({ kinds: stringifyList(Array.from(next)) });
  };

  const toggleLanguage = (l: ArchiveOriginalLanguage) => {
    const next = new Set(selectedLanguages);
    if (next.has(l)) next.delete(l);
    else next.add(l);
    updateParams({ langs: stringifyList(Array.from(next)) });
  };

  const setQuery = (q: string) => updateParams({ q: q || null });
  const setYearRangeUrl = (from: number, to: number) => {
    updateParams({
      from: from === yearRange.min ? null : String(from),
      to: to === yearRange.max ? null : String(to),
    });
  };
  const resetYears = () =>
    updateParams({ from: null, to: null });
  const setSort = (s: ArchiveSort) =>
    updateParams({ sort: s === "newest" ? null : s });
  const reset = () =>
    router.replace(pathname, { scroll: false });

  // ——— Filter + sort ———
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = items.filter((i) => {
      if (selectedKinds.size > 0 && !selectedKinds.has(i.kind)) return false;
      if (
        selectedLanguages.size > 0 &&
        (!i.originalLanguage || !selectedLanguages.has(i.originalLanguage))
      )
        return false;
      if (i.dateSortable < yearFrom || i.dateSortable > yearTo) return false;
      if (q) {
        const haystack = [i.title, i.description, ...i.tags, i.place ?? "", i.source ?? ""]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    switch (sort) {
      case "oldest":
        result = [...result].sort(
          (a, b) => +new Date(a.addedAt) - +new Date(b.addedAt)
        );
        break;
      case "dateAsc":
        result = [...result].sort((a, b) => a.dateSortable - b.dateSortable);
        break;
      case "dateDesc":
        result = [...result].sort((a, b) => b.dateSortable - a.dateSortable);
        break;
      case "newest":
      default:
        result = [...result].sort(
          (a, b) => +new Date(b.addedAt) - +new Date(a.addedAt)
        );
    }

    return result;
  }, [items, selectedKinds, selectedLanguages, yearFrom, yearTo, query, sort]);

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <ArchiveFilters
        dict={dict}
        allKinds={allKinds}
        allLanguages={allLanguages}
        yearRange={yearRange}
        selectedKinds={selectedKinds}
        toggleKind={toggleKind}
        selectedLanguages={selectedLanguages}
        toggleLanguage={toggleLanguage}
        yearFrom={yearFrom}
        yearTo={yearTo}
        setYearRange={setYearRangeUrl}
        query={query}
        setQuery={setQuery}
        reset={reset}
      />

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
          <p className="text-xs uppercase tracking-widest text-neutral-500">
            {filtered.length} / {items.length}
          </p>
          <ArchiveSortMenu value={sort} onChange={setSort} dict={dict.sort} />
        </div>

        <ArchiveActiveFilters
          dict={dict}
          selectedKinds={selectedKinds}
          toggleKind={toggleKind}
          selectedLanguages={selectedLanguages}
          toggleLanguage={toggleLanguage}
          query={query}
          clearQuery={() => setQuery("")}
          yearFrom={yearFrom}
          yearTo={yearTo}
          yearRange={yearRange}
          resetYears={resetYears}
        />

        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-amber-900/30 bg-amber-50/40 p-12 text-center">
            <h3 className="text-lg font-semibold text-amber-950">
              {dict.empty.title}
            </h3>
            <p className="mt-2 text-sm text-neutral-600">{dict.empty.text}</p>
            <button
              type="button"
              onClick={reset}
              className="mt-6 inline-flex h-9 items-center justify-center rounded border border-amber-900/40 px-4 text-xs font-semibold uppercase tracking-widest text-amber-900 transition hover:bg-amber-50"
            >
              {dict.empty.reset}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((item) => (
              <ArchiveCard key={item.id} item={item} dict={dict} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function parseList(value: string | null): string[] {
  if (!value) return [];
  return value.split(",").filter(Boolean);
}

function stringifyList(values: string[]): string | null {
  if (values.length === 0) return null;
  return values.join(",");
}
