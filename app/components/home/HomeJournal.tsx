import { LocalizedLink } from "@/app/components/common/LocalizedLink";
import { PublicationCard } from "@/app/components/publications/PublicationCard";
import type { Publication } from "@/app/lib/publications";
import type { Locale } from "@/app/lib/i18n/config";
import type { Dictionary } from "@/app/lib/i18n/shared";

// Home → «Из журнала». A short shelf of three articles, not a news
// front page: the museum doesn't depend on a steady stream of posts.

type Props = {
  publications: Publication[];
  lang: Locale;
  dict: Dictionary;
};

export function HomeJournal({ publications, lang, dict }: Props) {
  if (publications.length === 0) return null;
  const t = dict.home.publications;

  return (
    <section className="border-t border-amber-900/10 bg-[#FBF7F0] py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-amber-800/70">
              {dict.publications.hero.kicker}
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-amber-950 md:text-5xl">
              {t.title}
            </h2>
            <p className="mt-3 font-display text-base italic text-amber-800/80">
              {t.subtitle}
            </p>
          </div>
          <LocalizedLink
            href="/publications"
            className="group/all inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-900 hover:text-amber-950"
          >
            <span>{t.linkAll}</span>
            <span
              aria-hidden
              className="transition-transform duration-300 group-hover/all:translate-x-1"
            >
              →
            </span>
          </LocalizedLink>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {publications.map((p) => (
            <PublicationCard
              key={p.id}
              publication={p}
              lang={lang}
              dict={dict.publications}
              from="home"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
