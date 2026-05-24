import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/app/lib/i18n/config";
import { StoriesIndex } from "@/app/components/stories/StoriesIndex";

export const metadata: Metadata = {
  title: "Истории в объёме — 3D хроники",
  description:
    "Три главы истории Чечни в трёхмерных сценах: башня, воин, кинжал. Каждая разворачивается при скролле — текст и модель синхронны.",
};

export default async function IstoriiIndexPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <StoriesIndex />;
}
