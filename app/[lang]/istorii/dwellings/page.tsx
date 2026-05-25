import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/app/lib/i18n/config";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { CategoryPage } from "@/app/components/stories/CategoryPage";
import { getCategoryBySlug } from "@/app/components/stories/storiesData";

export const metadata: Metadata = {
  title: "Жилища — 3D хроники",
  description:
    "Башни, склепы, дома Кавказа. Архитектура от древних укрытий до сёл нового времени.",
};

export default async function DwellingsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const category = getCategoryBySlug("dwellings", lang);
  if (!category) notFound();
  return <CategoryPage category={category} dict={dict} />;
}
