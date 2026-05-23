import { LocalizedLink } from "@/app/components/common/LocalizedLink";
import { PublicationCard } from "@/app/components/publications/PublicationCard";
import { getAllPublications } from "@/app/lib/publications";
import type { Dictionary } from "@/app/lib/i18n/shared";
import type { Locale } from "@/app/lib/i18n/config";

type Props = {
  lang: Locale;
  dict: Dictionary;
};

export async function HomePublicationsPreview({ lang, dict }: Props) {
  const all = await getAllPublications();
  const preview = all.slice(0, 3);
  if (preview.length === 0) return null;

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-amber-950 md:text-4xl">
            <span className="inline-flex items-center gap-4">
              <span className="h-px w-10 bg-amber-900/40" />
              {dict.home.publications.title}
              <span className="h-px w-10 bg-amber-900/40" />
            </span>
          </h2>
          <p className="mt-3 text-sm italic text-amber-900/70">
            {dict.home.publications.subtitle}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {preview.map((p) => (
            <PublicationCard
              key={p.id}
              publication={p}
              lang={lang}
              dict={dict.publications}
            />
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <LocalizedLink
            href="/publications"
            className="group inline-flex h-11 items-center justify-center gap-2 rounded border border-amber-900/60 bg-white px-6 text-sm font-semibold text-amber-900 transition hover:bg-amber-50"
          >
            {dict.home.publications.linkAll}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition group-hover:translate-x-0.5"
              aria-hidden
            >
              <path d="M5 12h14" />
              <path d="M13 5l7 7-7 7" />
            </svg>
          </LocalizedLink>
        </div>
      </div>
    </section>
  );
}
