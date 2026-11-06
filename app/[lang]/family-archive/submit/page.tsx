import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LocalizedLink } from "@/app/components/common/LocalizedLink";
import { FamilySubmitForm } from "@/app/components/family/FamilySubmitForm";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { isLocale } from "@/app/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.family.submit.metaTitle,
    description: dict.family.submit.metaDescription,
  };
}

export default async function FamilySubmitPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const t = dict.family.submit;

  return (
    <>
      <section className="border-b border-amber-900/10 bg-[#F4EFE3]">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <LocalizedLink
            href="/family-archive"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-900 transition hover:text-amber-950"
          >
            {t.back}
          </LocalizedLink>
          <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.38em] text-amber-800/75">
            {t.kicker}
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-amber-950 md:text-6xl">
            {t.title}
          </h1>
          <p className="mt-5 max-w-2xl font-display text-lg italic leading-[1.6] text-amber-900/80">
            {t.description}
          </p>
        </div>
      </section>

      <section className="bg-white py-12 md:py-16">
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-[1fr_320px] lg:gap-16">
          <div className="min-w-0">
            <FamilySubmitForm dict={t} kinds={dict.family.kinds} />
          </div>

          <aside className="order-first space-y-6 lg:order-none lg:sticky lg:top-8 lg:self-start">
            <div className="border border-amber-900/15 bg-[#FBF7F0] p-6">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-900">
                {t.tipsHeading}
              </h2>
              <ul className="mt-4 space-y-3">
                {t.tips.map((tip) => (
                  <li
                    key={tip}
                    className="flex gap-3 text-sm leading-[1.55] text-amber-900/80"
                  >
                    <span
                      aria-hidden
                      className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-amber-800/50"
                    />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
