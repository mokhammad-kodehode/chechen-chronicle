import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/app/lib/i18n/config";
import { CategoryPage } from "@/app/components/stories/CategoryPage";
import { getCategoryBySlug } from "@/app/components/stories/storiesData";

export const metadata: Metadata = {
  title: "Воины — 3D хроники",
  description:
    "Защитники земли и рода. От древних воинов-горцев до бойцов Кавказской войны XIX века.",
};

export default async function WarriorsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const category = getCategoryBySlug("warriors");
  if (!category) notFound();
  return <CategoryPage category={category} />;
}
