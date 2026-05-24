import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/app/lib/i18n/config";
import { WatchtowerStoryDynamic } from "@/app/components/stories/WatchtowerStoryDynamic";

export const metadata: Metadata = {
  title: "Башня с площадкой — без шатра, с машикулями",
  description:
    "Кавказская сторожевая башня с плоской боевой площадкой, двойным рядом машикулей и каменной будкой наблюдателя на вершине.",
};

export default async function WatchtowerStoryPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <WatchtowerStoryDynamic />;
}
