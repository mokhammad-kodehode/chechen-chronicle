import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/app/lib/i18n/config";
import { TowerStoryDynamic } from "@/app/components/stories/TowerStoryDynamic";

export const metadata: Metadata = {
  title: "Башня — договор рода с горой",
  description:
    "История вайнахской башни: типология, конструкция, и почему башня — это не дом и не крепость.",
};

export default async function TowerStoryPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <TowerStoryDynamic />;
}
