import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";

export const revalidate = 60;

import {
  getAllCategories,
  getAllPublications,
  getHomeCuration,
} from "@/app/lib/publications";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/app/lib/i18n/config";
import { FeaturedBanner } from "@/app/components/publications/FeaturedBanner";
import { PublicationsList } from "@/app/components/publications/PublicationsList";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.publications.metaTitle,
    description: dict.publications.metaDescription,
  };
}

export default async function PublicationsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);

  const [curation, all, categories] = await Promise.all([
    getHomeCuration(lang as Locale),
    getAllPublications(lang as Locale),
    getAllCategories(),
  ]);
  const featured = curation.featured ?? all[0];
  const restOfList = featured ? all.filter((p) => p.id !== featured.id) : all;

  return (
    <>
      {featured ? (
        <FeaturedBanner
          publication={featured}
          lang={lang as Locale}
          dict={dict.publications}
        />
      ) : null}

      <section className="animate-fade-fast bg-white py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight text-amber-950 md:text-3xl">
              {dict.publications.allHeading}
            </h2>
            <p className="hidden text-sm text-neutral-500 md:block">
              {dict.publications.sortLabel}
            </p>
          </div>

          <Suspense
            fallback={
              <div className="mt-10 h-10 animate-pulse rounded bg-amber-50" />
            }
          >
            <PublicationsList
              publications={restOfList}
              categories={categories}
              lang={lang as Locale}
              dict={dict.publications}
            />
          </Suspense>
        </div>
      </section>
    </>
  );
}
