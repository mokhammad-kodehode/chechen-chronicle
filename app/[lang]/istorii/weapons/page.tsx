import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/app/lib/i18n/config";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { CategoryPage } from "@/app/components/stories/CategoryPage";
import { getCategoryBySlug } from "@/app/components/stories/storiesData";

export const metadata: Metadata = {
  title: "Орудия — 3D хроники",
  description:
    "Сталь Кавказа: кинжал, шашка, длинноствольный мушкет. От бронзового века до начала XX.",
};

export default async function WeaponsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const category = getCategoryBySlug("weapons", lang);
  if (!category) notFound();
  return <CategoryPage category={category} dict={dict} />;
}
