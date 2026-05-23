import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  getAllArchiveItems,
  getAllArchiveKinds,
  getAllArchiveLanguages,
  getArchiveYearRange,
} from "@/app/lib/archive";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { isLocale } from "@/app/lib/i18n/config";
import { ArchiveHero } from "@/app/components/archive/ArchiveHero";
import { ArchiveBrowser } from "@/app/components/archive/ArchiveBrowser";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.archive.metaTitle,
    description: dict.archive.metaDescription,
  };
}

export default async function ArchivePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const items = getAllArchiveItems();
  const allKinds = getAllArchiveKinds();
  const allLanguages = getAllArchiveLanguages();
  const yearRange = getArchiveYearRange();

  return (
    <>
      <ArchiveHero dict={dict.archive.hero} count={items.length} />

      <section className="bg-white py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4">
          <Suspense
            fallback={
              <div className="h-10 animate-pulse rounded bg-amber-50" />
            }
          >
            <ArchiveBrowser
              items={items}
              allKinds={allKinds}
              allLanguages={allLanguages}
              yearRange={yearRange}
              dict={dict.archive}
            />
          </Suspense>
        </div>
      </section>
    </>
  );
}
