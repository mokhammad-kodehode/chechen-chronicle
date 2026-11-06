import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { LocalizedLink } from "@/app/components/common/LocalizedLink";
import { FamilyKindBadge } from "@/app/components/family/FamilyKindBadge";
import { FamilyShareCta } from "@/app/components/family/FamilyShareCta";
import {
  getAllFamilyStorySlugs,
  getFamilyStoryBySlug,
} from "@/app/lib/familyArchive";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { format } from "@/app/lib/i18n/shared";
import { isLocale, LOCALES } from "@/app/lib/i18n/config";

export const revalidate = 60;

type Params = { lang: string; slug: string };

const META_COLS: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
};

export async function generateStaticParams() {
  const slugs = await getAllFamilyStorySlugs();
  return LOCALES.flatMap((lang) => slugs.map((slug) => ({ lang, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const story = await getFamilyStoryBySlug(slug);
  if (!story) return { title: "История не найдена" };
  return {
    title: story.title,
    description: story.excerpt,
    openGraph: story.cover ? { images: [story.cover.url] } : undefined,
  };
}

export default async function FamilyStoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const [dict, story] = await Promise.all([
    getDictionary(lang),
    getFamilyStoryBySlug(slug),
  ]);
  if (!story) notFound();
  const t = dict.family;

  const meta = [
    { label: t.detail.kind, value: t.kinds[story.kind] },
    { label: t.detail.era, value: story.era },
    { label: t.detail.place, value: story.place },
    { label: t.detail.teip, value: story.teip },
  ].filter((m): m is { label: string; value: string } => Boolean(m.value));

  const [lead, ...rest] = story.paragraphs;

  return (
    <>
      {/* Header */}
      <section className="border-b border-amber-900/10 bg-[#F4EFE3]">
        <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
          <LocalizedLink
            href="/family-archive"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-900 transition hover:text-amber-950"
          >
            {t.detail.back}
          </LocalizedLink>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <FamilyKindBadge kind={story.kind} size="md" dict={t.kinds} />
            {story.era ? (
              <span className="text-sm font-semibold tracking-widest text-amber-900/70">
                {story.era}
              </span>
            ) : null}
          </div>

          <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-amber-950 md:text-5xl">
            {story.title}
          </h1>

          <p className="mt-5 font-display text-base italic text-amber-800/85 md:text-lg">
            {story.storyteller
              ? format(t.detail.storyteller, { name: story.storyteller })
              : t.detail.anonymous}
          </p>
        </div>
      </section>

      {/* Body */}
      <section className="bg-white py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-4">
          {meta.length > 0 ? (
            <dl
              className={[
                "mb-10 grid grid-cols-2 gap-px overflow-hidden border border-amber-900/15 bg-amber-900/15",
                META_COLS[meta.length] ?? "sm:grid-cols-4",
              ].join(" ")}
            >
              {meta.map((m, i) => (
                <div
                  key={m.label}
                  className={[
                    "bg-[#FBF7F0] px-4 py-3",
                    // Odd count on the 2-column phone grid: let the last
                    // cell span the row instead of leaving a hole.
                    meta.length % 2 === 1 && i === meta.length - 1
                      ? "col-span-2 sm:col-span-1"
                      : "",
                  ].join(" ")}
                >
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-900/60">
                    {m.label}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-amber-950">
                    {m.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}

          {story.images[0] ? (
            <StoryFigure image={story.images[0]} priority openLabel={t.detail.openPhoto} />
          ) : null}

          <div className="space-y-5 font-display text-[18px] leading-[1.75] text-amber-950/90 md:text-[19px]">
            {lead ? (
              <p className="first-letter:float-left first-letter:pr-3 first-letter:pt-1 first-letter:font-display first-letter:text-[64px] first-letter:font-semibold first-letter:leading-[0.85] first-letter:text-amber-800">
                {lead}
              </p>
            ) : null}
            {rest.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {story.images.length > 1 ? (
            <div className="mt-14">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-900/70">
                {t.detail.photos}
              </h2>
              <div className="mt-5 grid gap-6 sm:grid-cols-2">
                {story.images.slice(1).map((img) => (
                  <StoryFigure key={img.url} image={img} openLabel={t.detail.openPhoto} />
                ))}
              </div>
            </div>
          ) : null}

          {story.editorNote ? (
            <aside className="mt-14 border-l-4 border-amber-800/60 bg-[#FBF7F0] px-6 py-5">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-900">
                {t.detail.editorNote}
              </h2>
              <p className="mt-3 whitespace-pre-line text-[15px] leading-[1.7] text-amber-950/85">
                {story.editorNote}
              </p>
            </aside>
          ) : null}
        </div>
      </section>

      <FamilyShareCta
        title={t.detail.shareTitle}
        text={t.detail.shareText}
        cta={t.detail.shareCta}
        secondary={{
          href: "/family-archive",
          label: dict.home.museum.family.linkAll,
        }}
      />
    </>
  );
}

function StoryFigure({
  image,
  priority,
  openLabel,
}: {
  image: {
    url: string;
    fullUrl: string;
    caption?: string;
    lqip?: string;
    width?: number;
    height?: number;
  };
  priority?: boolean;
  openLabel: string;
}) {
  const ratio =
    image.width && image.height ? image.width / image.height : 4 / 3;
  return (
    <figure className="mb-10">
      <a
        href={image.fullUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={openLabel}
        className="group relative block overflow-hidden bg-amber-50"
        style={{ aspectRatio: String(Math.min(Math.max(ratio, 0.6), 2)) }}
      >
        <Image
          src={image.url}
          alt={image.caption ?? ""}
          fill
          priority={priority}
          sizes="(min-width: 768px) 768px, 100vw"
          className="object-contain transition duration-700 group-hover:scale-[1.015]"
          {...(image.lqip
            ? { placeholder: "blur" as const, blurDataURL: image.lqip }
            : {})}
        />
      </a>
      {image.caption ? (
        <figcaption className="mt-3 text-sm italic leading-[1.55] text-amber-900/70">
          {image.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
