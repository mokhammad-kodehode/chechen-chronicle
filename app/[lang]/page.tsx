import { notFound } from "next/navigation";
import { HomeHero } from "@/app/components/home/HomeHero";
import { HomeStoriesPreview } from "@/app/components/home/HomeStoriesPreview";
import { HomeTimelinePreview } from "@/app/components/home/HomeTimelinePreview";
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
      <HomeHero lang={lang as Locale} dict={dict} />
      <HomeStoriesPreview dict={dict} />
      <HomeTimelinePreview dict={dict.home.timeline} />
    </>
  );
}
