import Image from "next/image";
import { LocalizedLink } from "@/app/components/common/LocalizedLink";
import { Publication } from "@/app/lib/publications";
import type { Dictionary } from "@/app/lib/i18n/shared";
import type { Locale } from "@/app/lib/i18n/config";
import { PublicationCategoryBadge } from "./PublicationCategoryBadge";
import { PublicationMeta } from "./PublicationMeta";
import { Publication3DBadge } from "./Publication3DBadge";

type Props = {
  publication: Publication;
  lang: Locale;
  dict: Dictionary["publications"];
};

export function PublicationFeaturedCard({ publication, lang, dict }: Props) {
  const href = `/publications/${publication.slug}`;
  return (
    <article className="group relative overflow-hidden rounded-xl border border-amber-900/20 bg-white shadow-sm">
      {publication.enable3DView ? (
        <div className="absolute right-4 top-4 z-10">
          <Publication3DBadge slug={publication.slug} size="md" />
        </div>
      ) : null}
      <div className="grid md:grid-cols-5">
        <LocalizedLink
          href={href}
          className="relative block aspect-[16/10] overflow-hidden bg-amber-50 md:col-span-3 md:aspect-auto md:min-h-[360px]"
        >
          {publication.coverImageUrl ? (
            <Image
              src={publication.coverImageUrl}
              alt={publication.coverImageAlt ?? publication.title}
              fill
              priority
              sizes="(min-width: 768px) 60vw, 100vw"
              className="object-cover transition duration-700 group-hover:scale-[1.02]"
              {...(publication.coverImageLqip
                ? {
                    placeholder: "blur" as const,
                    blurDataURL: publication.coverImageLqip,
                  }
                : {})}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-100 via-stone-100 to-amber-50 text-amber-900/40">
              <span className="h-4 w-4 rotate-45 bg-amber-900/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent md:hidden" />
        </LocalizedLink>

        <div className="flex flex-col justify-between p-6 md:col-span-2 md:p-10">
          <div>
            <div className="flex items-center gap-3">
              <PublicationCategoryBadge
                category={publication.category}
                size="md"
                dict={dict.categories}
              />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-900/70">
                {dict.featuredLabel}
              </span>
            </div>

            <LocalizedLink href={href}>
              <h2 className="mt-5 text-2xl font-semibold leading-tight tracking-tight text-amber-950 transition group-hover:text-amber-900 md:text-3xl">
                {publication.title}
              </h2>
            </LocalizedLink>

            <p className="mt-4 text-sm leading-7 text-neutral-700 md:text-base">
              {publication.excerpt}
            </p>
          </div>

          <div className="mt-8 space-y-5">
            <PublicationMeta
              author={publication.author}
              publishedAt={publication.publishedAt}
              readingTimeMinutes={publication.readingTimeMinutes}
              lang={lang}
              dict={dict}
            />
            <LocalizedLink
              href={href}
              className="inline-flex h-11 items-center justify-center rounded border border-amber-900 bg-amber-900 px-6 text-sm font-semibold text-white transition hover:bg-amber-800"
            >
              {dict.readLong}
            </LocalizedLink>
          </div>
        </div>
      </div>
    </article>
  );
}
