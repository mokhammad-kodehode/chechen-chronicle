import { notFound } from "next/navigation";
import { HomeHero } from "@/app/components/home/HomeHero";
import { HomeTimelinePreview } from "@/app/components/home/HomeTimelinePreview";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { isLocale } from "@/app/lib/i18n/config";

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
      <HomeHero
        backgroundImageUrl="/images/hero-tower.webp"
        dict={dict.home.hero}
      />
      <HomeTimelinePreview dict={dict.home.timeline} />
    </>
  );
}
