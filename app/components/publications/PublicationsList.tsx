"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Publication, PublicationCategory } from "@/app/lib/publications";
import type { Dictionary } from "@/app/lib/i18n/shared";
import type { Locale } from "@/app/lib/i18n/config";
import { PublicationCard } from "./PublicationCard";
import { PublicationFilters } from "./PublicationFilters";

type Props = {
  publications: Publication[];
  categories: PublicationCategory[];
  lang: Locale;
  dict: Dictionary["publications"];
};

function isCategory(
  value: string,
  categories: PublicationCategory[]
): value is PublicationCategory {
  return (categories as string[]).includes(value);
}

export function PublicationsList({ publications, categories, lang, dict }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const catParam = searchParams.get("cat");
  const active: PublicationCategory | "all" =
    catParam && isCategory(catParam, categories) ? catParam : "all";
  const query = searchParams.get("q") ?? "";

  const updateParams = (next: {
    cat?: PublicationCategory | "all";
    q?: string;
  }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next.cat !== undefined) {
      if (next.cat === "all") params.delete("cat");
      else params.set("cat", next.cat);
    }
    if (next.q !== undefined) {
      if (!next.q) params.delete("q");
      else params.set("q", next.q);
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return publications.filter((p) => {
      if (active !== "all" && p.category !== active) return false;
      if (!q) return true;
      const haystack = [p.title, p.excerpt, ...p.tags].join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [publications, active, query]);

  return (
    <div>
      <PublicationFilters
        categories={categories}
        active={active}
        onChange={(cat) => updateParams({ cat })}
        query={query}
        onQueryChange={(q) => updateParams({ q })}
        total={filtered.length}
        dict={dict}
      />

      {filtered.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-sm text-neutral-600">{dict.empty.text}</p>
          <button
            type="button"
            onClick={() => updateParams({ cat: "all", q: "" })}
            className="mt-4 inline-flex h-9 items-center justify-center rounded border border-amber-900/40 px-4 text-xs font-semibold uppercase tracking-widest text-amber-900 hover:bg-amber-50"
          >
            {dict.empty.reset}
          </button>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <PublicationCard
              key={p.id}
              publication={p}
              lang={lang}
              dict={dict}
            />
          ))}
        </div>
      )}
    </div>
  );
}
