import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

export const revalidate = 60;

import {
  getAllPublicationSlugs,
  getPublicationBySlug,
  getRelatedPublications,
} from "@/app/lib/publications";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { isLocale, LOCALES, type Locale } from "@/app/lib/i18n/config";
import { LocalizedLink } from "@/app/components/common/LocalizedLink";
import { PublicationCategoryBadge } from "@/app/components/publications/PublicationCategoryBadge";
import { PublicationMeta } from "@/app/components/publications/PublicationMeta";
import { PublicationArticle } from "@/app/components/publications/PublicationArticle";
import { PublicationCard } from "@/app/components/publications/PublicationCard";
import { ReadingProgressBar } from "@/app/components/publications/ReadingProgressBar";

type Params = { lang: string; slug: string };

export async function generateStaticParams() {
  const slugs = await getAllPublicationSlugs();
  return LOCALES.flatMap((lang) => slugs.map((slug) => ({ lang, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const publication = await getPublicationBySlug(
    slug,
    isLocale(lang) ? lang : "ru"
  );
  if (!publication) return { title: "Публикация не найдена" };
  return {
    title: publication.title,
    description: publication.excerpt,
  };
}

export default async function PublicationPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const publication = await getPublicationBySlug(slug, lang as Locale);
  if (!publication) notFound();

  const dict = await getDictionary(lang as Locale);
  const related = await getRelatedPublications(slug, lang as Locale);

  // Context-aware back link: arrived from the home page (link tagged
  // ?from=home) → "← На главную". Otherwise → "← Все публикации".
  const { from } = await searchParams;
  const fromHome = from === "home";
  const backHref = fromHome ? "/" : "/publications";
  const backLabel = fromHome
    ? dict.publications.homeBack
    : dict.publications.back;

  return (
    <>
      <ReadingProgressBar />

      {/* HERO */}
      <section className="relative overflow-hidden bg-amber-950 text-white">
        <div className="absolute inset-0">
          {publication.coverImageUrl ? (
            <Image
              src={publication.coverImageUrl}
              alt={publication.coverImageAlt ?? publication.title}
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-50"
              {...(publication.coverImageLqip
                ? {
                    placeholder: "blur" as const,
                    blurDataURL: publication.coverImageLqip,
                  }
                : {})}
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-amber-900 via-amber-950 to-stone-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-amber-950 via-amber-950/70 to-amber-950/30" />
        </div>

        <div className="animate-fade-fast relative mx-auto max-w-3xl px-4 py-20 md:py-28">
          <LocalizedLink
            href={backHref}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-100/80 hover:text-white"
          >
            {backLabel}
          </LocalizedLink>

          <div className="mt-6">
            <PublicationCategoryBadge
              category={publication.category}
              size="md"
              dict={dict.publications.categories}
            />
          </div>

          <h1 className="mt-6 text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
            {publication.title}
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-amber-50/90 md:text-lg">
            {publication.excerpt}
          </p>

          <div className="mt-8">
            <PublicationMeta
              author={publication.author}
              publishedAt={publication.publishedAt}
              readingTimeMinutes={publication.readingTimeMinutes}
              variant="light"
              lang={lang as Locale}
              dict={dict.publications}
            />
          </div>
        </div>
      </section>

      {/* BODY */}
      <section className="animate-fade-fast bg-[#FBF7F0] py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4">
          <div className="article-ornament mb-10 md:mb-14">
            <span className="article-ornament-glyph">❦</span>
          </div>

          <PublicationArticle blocks={publication.body} />

          {publication.enable3DView ? (
            <div className="mt-12 overflow-hidden rounded-xl border border-amber-900/20 bg-gradient-to-br from-amber-950 to-stone-900 text-amber-50 shadow-lg">
              <div className="grid items-center gap-6 px-6 py-7 md:grid-cols-[1fr_auto] md:gap-10 md:px-10 md:py-9">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-300/80">
                    Артефакт
                  </p>
                  <h3 className="mt-2 text-xl font-semibold tracking-tight text-amber-50 md:text-2xl">
                    Посмотреть предмет в 3D
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-amber-100/75 md:text-[15px]">
                    Объект можно вращать, приближать и рассматривать со всех
                    сторон. Откроется в полноэкранном просмотрщике.
                  </p>
                </div>
                <LocalizedLink
                  href={`/publications/${publication.slug}/3d`}
                  className="group inline-flex h-12 items-center justify-center gap-2 self-start rounded-full bg-amber-50 px-7 text-sm font-semibold text-amber-950 transition hover:bg-white md:self-center"
                >
                  Открыть 3D
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
          ) : null}

          {publication.tags.length > 0 ? (
            <div className="mt-14 flex flex-wrap items-center gap-2 border-t border-amber-900/10 pt-8">
              <span className="text-xs uppercase tracking-widest text-neutral-500">
                {dict.publications.topics}
              </span>
              {publication.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-amber-900/20 px-3 py-1 text-xs text-amber-900"
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-10 flex items-center gap-4 rounded border border-amber-900/15 bg-amber-50/40 p-5">
            {publication.author.avatarUrl ? (
              <Image
                src={publication.author.avatarUrl}
                alt={publication.author.name}
                width={48}
                height={48}
                className="h-12 w-12 shrink-0 rounded-full object-cover ring-1 ring-amber-900/20"
              />
            ) : (
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-amber-900/30 bg-white text-sm font-semibold text-amber-900">
                {publication.author.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)}
              </div>
            )}
            <div className="text-sm">
              <p className="font-semibold text-amber-950">
                {publication.author.name}
              </p>
              {publication.author.role ? (
                <p className="text-neutral-600">{publication.author.role}</p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="border-t border-amber-900/10 bg-[#FBF7F0] py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-2xl font-semibold tracking-tight text-amber-950 md:text-3xl">
                {dict.publications.more}
              </h2>
              <LocalizedLink
                href="/publications"
                className="text-xs font-semibold uppercase tracking-widest text-amber-900 hover:underline"
              >
                {dict.publications.moreLink}
              </LocalizedLink>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <PublicationCard
                  key={p.id}
                  publication={p}
                  lang={lang as Locale}
                  dict={dict.publications}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
