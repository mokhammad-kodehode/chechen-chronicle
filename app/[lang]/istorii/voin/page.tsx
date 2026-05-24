import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/app/lib/i18n/config";
import { WarriorStoryDynamic } from "@/app/components/stories/WarriorStoryDynamic";

export const metadata: Metadata = {
  title: "Воин — Хранитель порога",
  description:
    "Кавказский воин Средневековья: адат, шашка и кинжал, имя в роду. Не профессиональный солдат, а защитник земли и башни.",
};

export default async function WarriorStoryPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <WarriorStoryDynamic />;
}
