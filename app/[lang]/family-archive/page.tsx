import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LocalizedLink } from "@/app/components/common/LocalizedLink";
import { FamilyArchiveHero } from "@/app/components/family/FamilyArchiveHero";
import { FamilyHowItWorks } from "@/app/components/family/FamilyHowItWorks";
import { FamilyShareCta } from "@/app/components/family/FamilyShareCta";
import { FamilyStoryCard } from "@/app/components/family/FamilyStoryCard";
import { getAllFamilyStories } from "@/app/lib/familyArchive";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { isLocale } from "@/app/lib/i18n/config";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.family.metaTitle,
    description: dict.family.metaDescription,
  };
}

export default async function FamilyArchivePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const [dict, stories] = await Promise.all([
    getDictionary(lang),
    getAllFamilyStories(),
  ]);
  const t = dict.family;

  return (
    <>
      <FamilyArchiveHero dict={t.hero} count={stories.length} />

      <section className="bg-white py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <FamilyHowItWorks dict={t.how} />
        </div>
      </section>

      <section className="bg-white pb-20 md:pb-28">
        <div className="mx-auto max-w-6xl px-4">
          {stories.length > 0 ? (
            <>
              <h2 className="mb-8 font-display text-3xl font-semibold tracking-tight text-amber-950 md:text-4xl">
                {t.listHeading}
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {stories.map((s) => (
                  <FamilyStoryCard key={s.id} story={s} dict={t} />
                ))}
              </div>
            </>
          ) : (
            <div className="mx-auto flex max-w-2xl flex-col items-center border border-dashed border-amber-900/30 bg-[#FBF7F0] px-6 py-14 text-center">
              <span
                aria-hidden
                className="font-display text-[15px] tracking-[0.6em] text-amber-900/40"
              >
                ⁂
              </span>
              <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight text-amber-950 md:text-3xl">
                {t.empty.title}
              </h2>
              <p className="mt-3 max-w-md text-[15px] leading-[1.7] text-amber-900/75">
                {t.empty.text}
              </p>
              <LocalizedLink
                href="/family-archive/submit"
                className="mt-8 inline-flex h-12 items-center justify-center gap-3 rounded-sm bg-amber-900 px-7 text-[11px] font-semibold uppercase tracking-[0.28em] text-white transition hover:bg-amber-800"
              >
                {t.empty.cta}
                <span aria-hidden>→</span>
              </LocalizedLink>
            </div>
          )}
        </div>
      </section>

      {stories.length > 0 ? (
        <FamilyShareCta
          title={t.detail.shareTitle}
          text={t.detail.shareText}
          cta={t.detail.shareCta}
        />
      ) : null}
    </>
  );
}
