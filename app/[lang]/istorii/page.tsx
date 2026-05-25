import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/app/lib/i18n/config";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { StoriesIndex } from "@/app/components/stories/StoriesIndex";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.stories.metaTitle,
    description: dict.stories.metaDescription,
  };
}

export default async function IstoriiIndexPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return <StoriesIndex dict={dict} />;
}
