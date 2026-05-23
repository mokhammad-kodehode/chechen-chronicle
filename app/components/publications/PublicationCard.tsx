import Image from "next/image";
import { LocalizedLink } from "@/app/components/common/LocalizedLink";
import { Publication } from "@/app/lib/publications";
import type { Dictionary } from "@/app/lib/i18n/shared";
import type { Locale } from "@/app/lib/i18n/config";
import { PublicationCategoryBadge } from "./PublicationCategoryBadge";
import { PublicationMeta } from "./PublicationMeta";

type Props = {
  publication: Publication;
  lang: Locale;
  dict: Dictionary["publications"];
};

export function PublicationCard({ publication, lang, dict }: Props) {
  const href = `/publications/${publication.slug}`;
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-amber-900/15 bg-white shadow-sm transition hover:border-amber-900/40 hover:shadow-md">
      <LocalizedLink href={href} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-amber-50">
          {publication.coverImageUrl ? (
            <Image
              src={publication.coverImageUrl}
              alt={publication.coverImageAlt ?? publication.title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition duration-700 group-hover:scale-[1.03]"
              {...(publication.coverImageLqip
                ? {
                    placeholder: "blur" as const,
                    blurDataURL: publication.coverImageLqip,
                  }
                : {})}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-100 via-stone-100 to-amber-50 text-amber-900/40">
              <span className="h-3 w-3 rotate-45 bg-amber-900/30" />
            </div>
          )}
          <div className="absolute left-3 top-3">
            <PublicationCategoryBadge
              category={publication.category}
              dict={dict.categories}
            />
          </div>
        </div>
      </LocalizedLink>

      <div className="flex flex-1 flex-col px-5 py-5">
        <LocalizedLink href={href}>
          <h3 className="text-lg font-semibold tracking-tight text-amber-950 transition group-hover:text-amber-900 md:text-xl">
            {publication.title}
          </h3>
        </LocalizedLink>

        <p className="mt-3 line-clamp-3 text-sm leading-6 text-neutral-700">
          {publication.excerpt}
        </p>

        <div className="mt-5 flex flex-1 items-end justify-between gap-3 border-t border-amber-900/10 pt-4">
          <PublicationMeta
            author={publication.author}
            publishedAt={publication.publishedAt}
            readingTimeMinutes={publication.readingTimeMinutes}
            lang={lang}
            dict={dict}
          />
          <LocalizedLink
            href={href}
            className="text-xs font-semibold uppercase tracking-widest text-amber-900 transition group-hover:underline"
          >
            {dict.readShort}
          </LocalizedLink>
        </div>
      </div>
    </article>
  );
}
