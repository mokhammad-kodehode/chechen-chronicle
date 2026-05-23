import { notFound } from "next/navigation";
import { HomeHero } from "@/app/components/home/HomeHero";
import { HomeTimelinePreview } from "@/app/components/home/HomeTimelinePreview";
import { HomePublicationsPreview } from "@/app/components/home/HomePublicationsPreview";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/app/lib/i18n/config";

export const revalidate = 60;

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <HomeHero dict={dict.home.hero} />
      <HomePublicationsPreview lang={lang as Locale} dict={dict} />
      <HomeTimelinePreview dict={dict.home.timeline} />
    </>
  );
}
