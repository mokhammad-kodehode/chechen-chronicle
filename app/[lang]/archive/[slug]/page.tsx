import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllArchiveItems,
  getArchiveItemBySlug,
} from "@/app/lib/archive";
import { getPublicationBySlug } from "@/app/lib/publications";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { isLocale, LOCALES, type Locale } from "@/app/lib/i18n/config";
import { LocalizedLink } from "@/app/components/common/LocalizedLink";
import { ArchiveKindBadge } from "@/app/components/archive/ArchiveKindBadge";
import { ArchiveMetaList } from "@/app/components/archive/ArchiveMetaList";
import { ArchiveViewer } from "@/app/components/archive/ArchiveViewer";

type Params = { lang: string; slug: string };

export function generateStaticParams() {
  return LOCALES.flatMap((lang) =>
    getAllArchiveItems().map((i) => ({ lang, slug: i.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = getArchiveItemBySlug(slug);
  if (!item) return { title: "Запись не найдена" };
  return {
    title: item.title,
    description: item.description,
  };
}

export default async function ArchiveItemPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const item = getArchiveItemBySlug(slug);
  if (!item) notFound();

  const dict = await getDictionary(lang as Locale);

  const relatedPublications = item.relatedPublicationSlugs
    ? (
        await Promise.all(
          item.relatedPublicationSlugs.map((s) => getPublicationBySlug(s))
        )
      ).filter((p): p is NonNullable<typeof p> => Boolean(p))
    : [];

  return (
    <>
      {/* Header */}
      <section className="border-b border-amber-900/10 bg-[#FBF7F0] py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4">
          <LocalizedLink
            href="/archive"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-900 transition hover:text-amber-950"
          >
            {dict.archive.detail.back}
          </LocalizedLink>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <ArchiveKindBadge
              kind={item.kind}
              size="md"
              dict={dict.archive.kinds}
            />
            <span className="text-sm font-semibold tracking-widest text-amber-900/70">
              {item.date}
            </span>
          </div>

          <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-amber-950 md:text-4xl">
            {item.title}
          </h1>
        </div>
      </section>

      {/* Body: viewer + metadata */}
      <section className="bg-white py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
            <div>
              <ArchiveViewer item={item} />

              {item.description ? (
                <div className="mt-10">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-amber-900/70">
                    {dict.archive.detail.description}
                  </h2>
                  <p className="mt-3 whitespace-pre-line text-base leading-7 text-neutral-800">
                    {item.description}
                  </p>
                </div>
              ) : null}

              {item.tags.length > 0 ? (
                <div className="mt-8 flex flex-wrap items-center gap-2">
                  <span className="text-xs uppercase tracking-widest text-neutral-500">
                    {dict.archive.detail.tags}
                  </span>
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-amber-900/20 px-3 py-1 text-xs text-amber-900"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-lg border border-amber-900/15 bg-amber-50/40 p-6">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-amber-900/70">
                  {dict.archive.detail.metadata}
                </h2>
                <div className="mt-5">
                  <ArchiveMetaList item={item} dict={dict.archive} />
                </div>

                {item.fileUrl ? (
                  <a
                    href={item.fileUrl}
                    download
                    className="mt-6 inline-flex h-10 w-full items-center justify-center rounded border border-amber-900 bg-amber-900 px-4 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-amber-800"
                  >
                    {dict.archive.detail.download}
                  </a>
                ) : null}
              </div>

              {relatedPublications.length > 0 ? (
                <div className="rounded-lg border border-amber-900/15 bg-white p-6">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-amber-900/70">
                    {dict.archive.detail.relatedPublications}
                  </h2>
                  <ul className="mt-4 space-y-3">
                    {relatedPublications.map((pub) => (
                      <li key={pub.id}>
                        <LocalizedLink
                          href={`/publications/${pub.slug}`}
                          className="block rounded border border-transparent p-3 transition hover:border-amber-900/20 hover:bg-amber-50/40"
                        >
                          <p className="text-sm font-semibold leading-snug text-amber-950">
                            {pub.title}
                          </p>
                          <p className="mt-1 line-clamp-2 text-xs text-neutral-600">
                            {pub.excerpt}
                          </p>
                        </LocalizedLink>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
