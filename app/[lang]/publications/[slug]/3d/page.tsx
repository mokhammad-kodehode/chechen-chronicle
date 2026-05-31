import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicationBySlug } from "@/app/lib/publications";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/app/lib/i18n/config";
import { LocalizedLink } from "@/app/components/common/LocalizedLink";
import { CoinViewer } from "@/app/components/publications/CoinViewer";

export const revalidate = 60;

type Params = { lang: string; slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const publication = await getPublicationBySlug(
    slug,
    isLocale(lang) ? lang : "ru"
  );
  if (!publication) return { title: "Не найдено" };
  return {
    title: `${publication.title} — 3D-просмотр`,
    description: publication.excerpt,
  };
}

export default async function Publication3DPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const publication = await getPublicationBySlug(slug, lang as Locale);
  if (!publication) notFound();
  if (!publication.enable3DView) notFound();

  const dict = await getDictionary(lang as Locale);

  return (
    <div className="relative flex h-[calc(100vh-4rem)] min-h-[600px] flex-col bg-amber-950 text-amber-50">
      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between border-b border-amber-100/10 bg-amber-950/70 px-4 py-4 backdrop-blur md:px-8">
        <LocalizedLink
          href={`/publications/${publication.slug}`}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-100/80 transition hover:text-white"
        >
          ← {dict.publications.back}
        </LocalizedLink>

        <h1 className="hidden text-sm font-semibold tracking-tight text-amber-50 md:block">
          {publication.title}
        </h1>

        <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-100/60">
          3D-просмотр
        </span>
      </div>

      {/* Mobile title */}
      <div className="border-b border-amber-100/10 bg-amber-950/70 px-4 py-3 text-center text-sm font-semibold text-amber-50 md:hidden">
        {publication.title}
      </div>

      {/* Canvas */}
      <div className="relative flex-1">
        <CoinViewer modelUrl={publication.model3dUrl} />

        {/* Controls hint */}
        <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-amber-100/15 bg-amber-950/70 px-5 py-2 text-[11px] uppercase tracking-widest text-amber-100/70 backdrop-blur">
          Левая кнопка — вращать · Колесо — масштаб
        </div>

        {/* Source badge */}
        <div className="pointer-events-none absolute right-4 top-4 rounded border border-amber-100/15 bg-amber-950/70 px-3 py-1.5 text-[10px] uppercase tracking-widest text-amber-100/60 backdrop-blur">
          {publication.model3dUrl
            ? "Модель: загружена"
            : "Модель: процедурная"}
        </div>
      </div>
    </div>
  );
}
