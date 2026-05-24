import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/app/lib/i18n/config";
import { DaggerStoryDynamic } from "@/app/components/stories/DaggerStoryDynamic";

export const metadata: Metadata = {
  title: "Кинжал — кама",
  description:
    "Кавказский кинжал кама: символ мужества и чести. Прямой обоюдоострый клинок, серебро с чернью, имя, которое наследуется через поколения.",
};

export default async function DaggerStoryPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <DaggerStoryDynamic />;
}
