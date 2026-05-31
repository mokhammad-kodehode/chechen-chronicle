import Image from "next/image";
import { LocalizedLink } from "../common/LocalizedLink";
import { PublicationCard } from "@/app/components/publications/PublicationCard";
import { PublicationCategoryBadge } from "@/app/components/publications/PublicationCategoryBadge";
import { FeaturedBanner } from "@/app/components/publications/FeaturedBanner";
import {
  arrangeForHome,
  contentDepth,
  formatPublicationDate,
  getAllPublications,
  getHomeCuration,
  type Publication,
} from "@/app/lib/publications";
import type { Locale } from "@/app/lib/i18n/config";
import type { Dictionary } from "@/app/lib/i18n/shared";

// Content-driven span for the bento grid below the main spread.
// Heavier copy (longer title + excerpt) earns a wider tile so the
// layout breathes around long reads and packs short notes tightly.
function spanForCard(p: Publication): string {
  return contentDepth(p) > 180 ? "lg:col-span-6" : "lg:col-span-3";
}


// Home page front — newspaper A1 (NYT-style). Three stacked sections:
//
//   I.   FEATURED BANNER — the `featured` publication as a big cover +
//        headline spread. The only section on cream parchment.
//   II.  A1 SPREAD       — main column (2 stacked main posts) + a right
//        sidebar (one image-led "top" post, then compact items), with
//        an adaptive bento grid of extras and an "all publications"
//        link below. Rendered on white.
//   III. SIDE TEASERS    — two panels linking to Archive + 3D stories.
//
// The slower manuscript identity spread lives on /about.

type Props = {
  lang: Locale;
  dict: Dictionary;
};

export async function HomeHero({ lang, dict }: Props) {
  // Banner gets the explicit "featured" pub (or the latest). Below
  // the banner, an A1 newspaper spread:
  //   mainPosts  → 2 stacked posts in the wide left column; each is one
  //                <article> (text + cover image) with a shared hover.
  //   smallPosts → 3–4 compact items stacked in the right sidebar,
  //                separated from the main story by a vertical hairline.
  //   bentoExtras→ remaining publications shown in an adaptive bento
  //                grid below a horizontal hairline. Long-copy posts
  //                earn a wider tile so the layout breathes naturally.
  const [real, curation] = await Promise.all([
    getAllPublications(lang),
    getHomeCuration(lang),
  ]);
  const { banner, mainPosts, smallPosts, bentoExtras } = arrangeForHome(
    real,
    curation.featured,
    curation.pinnedIds
  );

  const pubsDict = dict.publications;
  const homePubs = dict.home.publications;

  return (
    <>
      {/* ── I. FEATURED BANNER — shared with the publications page. */}
      {banner ? (
        <FeaturedBanner
          publication={banner}
          lang={lang}
          dict={pubsDict}
          from="home"
        />
      ) : null}

      {/* ── II. NYT A1 SPREAD — LEFT column stacks 2 main posts
            (text + image each, one above the other), RIGHT column is
            a sidebar of compact small posts with thumbnails. A
            vertical hairline on lg+ separates the two zones. */}
      {mainPosts.length > 0 ? (
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-6 pt-8 pb-10 md:pt-12 md:pb-14">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-x-6">
              {/* LEFT — stack of 2 main posts */}
              <div className="flex flex-col gap-8 lg:col-span-8 lg:gap-10">
                {mainPosts.map((p, idx) => (
                  <div key={p.id} className="flex flex-col gap-8 lg:gap-10">
                    {idx > 0 ? (
                      <div
                        aria-hidden
                        className="h-px bg-amber-900/15"
                      />
                    ) : null}
                    <MainPost
                      publication={p}
                      lang={lang}
                      readLabel={pubsDict.readLong}
                      minutesTemplate={pubsDict.minutesShort}
                      categoriesDict={pubsDict.categories}
                    />
                  </div>
                ))}
              </div>

              {/* RIGHT — sidebar: 1 "top" post with big image and
                  excerpt, then compact list of posts with small right-
                  hand thumbnails (NYT-style). On lg+ the vertical
                  border-l separates the sidebar from the main column;
                  on smaller viewports (where the sidebar stacks below
                  the main posts) we draw a HORIZONTAL hairline + top
                  padding so the section break is still visible. */}
              {smallPosts.length > 0 ? (
                <div className="flex flex-col border-t border-amber-900/20 pt-10 lg:col-span-4 lg:border-l lg:border-t-0 lg:border-amber-900/15 lg:pl-6 lg:pt-0">
                  <TopSidebarPost
                    publication={smallPosts[0]!}
                    minutesTemplate={pubsDict.minutesShort}
                    categoriesDict={pubsDict.categories}
                  />
                  {smallPosts.slice(1).map((p) => (
                    <CompactPost
                      key={p.id}
                      publication={p}
                      minutesTemplate={pubsDict.minutesShort}
                    />
                  ))}
                </div>
              ) : null}
            </div>

            {/* Horizontal hairline + adaptive bento grid for extras */}
            {bentoExtras.length > 0 ? (
              <>
                <div aria-hidden className="mt-10 h-px bg-amber-900/15" />
                <div className="mt-10 grid grid-flow-dense grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-12">
                  {bentoExtras.map((p) => (
                    <div key={p.id} className={spanForCard(p)}>
                      <PublicationCard
                        publication={p}
                        lang={lang}
                        dict={pubsDict}
                        from="home"
                      />
                    </div>
                  ))}
                </div>
              </>
            ) : null}

            <div className="mt-10 flex justify-center">
              <LocalizedLink
                href="/publications"
                className="group/cta inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-amber-900 transition-colors duration-300 hover:text-amber-950"
              >
                <span>{homePubs.linkAll}</span>
                <span
                  aria-hidden
                  className="transition-transform duration-300 group-hover/cta:translate-x-1.5"
                >
                  →
                </span>
              </LocalizedLink>
            </div>
          </div>
        </section>
      ) : null}

      {/* ── III. SIDE TEASERS — Archive + 3D Chronicles on white. */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 pb-20 md:pb-24">
          <div className="grid grid-cols-1 gap-px overflow-hidden border border-amber-900/15 bg-amber-900/15 md:grid-cols-2">
            <TeaserPanel
              kicker={dict.archive.hero.kicker}
              title={dict.archive.hero.title}
              description={dict.archive.hero.description}
              href="/archive"
              linkLabel={dict.nav.archive}
            />
            <TeaserPanel
              kicker={dict.stories.hero.kicker}
              title={dict.stories.hero.title}
              description={dict.stories.hero.description}
              href="/istorii"
              linkLabel={dict.stories.openCTA}
            />
          </div>
        </div>
      </section>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────
// MAIN POST — text column (LEFT) + image column (CENTRE) of the A1
// spread, wrapped in ONE <article> so the reader knows they belong
// to the same publication. `group/main` syncs the hover between
// columns: pointing at the image highlights the title and vice-versa.
// No vertical divider between the columns — that would split the
// post in two visually.
// ──────────────────────────────────────────────────────────────────

function MainPost({
  publication: p,
  lang,
  readLabel,
  minutesTemplate,
  categoriesDict,
}: {
  publication: Publication;
  lang: Locale;
  readLabel: string;
  minutesTemplate: string;
  categoriesDict: Dictionary["publications"]["categories"];
}) {
  const href = `/publications/${p.slug}?from=home`;
  const date = formatPublicationDate(p.publishedAt, lang);
  const minutes = minutesTemplate.replace("{n}", String(p.readingTimeMinutes));

  return (
    <article className="group/main grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-x-10">
      {/* LEFT (1/3) — text */}
      <div className="flex flex-col">
        <PublicationCategoryBadge category={p.category} dict={categoriesDict} />

        <LocalizedLink href={href} className="mt-3 block">
          <h2 className="font-display text-[22px] font-semibold leading-[1.05] tracking-tight text-amber-950 transition-colors duration-300 group-hover/main:text-amber-900 sm:text-[24px] lg:text-[26px] xl:text-[30px]">
            {p.title}
          </h2>
        </LocalizedLink>

        <p className="mt-3 font-display text-[14px] italic leading-[1.55] text-amber-800/85 lg:text-[15px]">
          {p.excerpt}
        </p>

        {/* Meta — author on top line (bold), date · minutes on the
            second line. Tighter tracking so the narrow LEFT column
            fits everything without wrapping into 3+ rows. */}
        <div className="mt-4 flex flex-col gap-1.5 text-[10px] uppercase tracking-[0.18em] text-amber-900/70">
          <span className="font-semibold text-amber-900">{p.author.name}</span>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>{date}</span>
            <span aria-hidden className="h-1 w-1 rounded-full bg-amber-900/30" />
            <span>{minutes}</span>
          </div>
        </div>

        <LocalizedLink
          href={href}
          className="mt-5 inline-flex items-center gap-3 self-start text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-900 transition-colors duration-300 group-hover/main:text-amber-950"
        >
          <span>{readLabel}</span>
          <span
            aria-hidden
            className="transition-transform duration-300 group-hover/main:translate-x-1.5"
          >
            →
          </span>
        </LocalizedLink>
      </div>

      {/* CENTRE (2/3) — cover image of the SAME post */}
      <LocalizedLink
        href={href}
        className="relative block aspect-[16/9] overflow-hidden bg-amber-100/40 lg:col-span-2"
      >
        {p.coverImageUrl ? (
          <Image
            src={p.coverImageUrl}
            alt={p.coverImageAlt ?? p.title}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover transition duration-[1200ms] ease-out group-hover/main:scale-[1.025]"
            {...(p.coverImageLqip
              ? {
                  placeholder: "blur" as const,
                  blurDataURL: p.coverImageLqip,
                }
              : {})}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-100 via-stone-100 to-amber-50 text-amber-900/40">
            <span className="h-3 w-3 rotate-45 bg-amber-900/30" />
          </div>
        )}
      </LocalizedLink>
    </article>
  );
}

// ──────────────────────────────────────────────────────────────────
// TOP SIDEBAR POST — first item in the right sidebar, NYT-style:
// big top image, category, headline, brief excerpt, minutes. Acts
// as the anchor of the sidebar.
// ──────────────────────────────────────────────────────────────────

function TopSidebarPost({
  publication: p,
  minutesTemplate,
  categoriesDict,
}: {
  publication: Publication;
  minutesTemplate: string;
  categoriesDict: Dictionary["publications"]["categories"];
}) {
  const href = `/publications/${p.slug}?from=home`;
  const minutes = minutesTemplate.replace("{n}", String(p.readingTimeMinutes));

  return (
    <article className="group/top flex flex-col gap-3 pb-5">
      {p.coverImageUrl ? (
        <LocalizedLink
          href={href}
          className="relative block aspect-[4/3] overflow-hidden bg-amber-100/40"
        >
          <Image
            src={p.coverImageUrl}
            alt={p.coverImageAlt ?? p.title}
            fill
            sizes="(min-width: 1024px) 22vw, 50vw"
            className="object-cover transition duration-700 group-hover/top:scale-[1.03]"
            {...(p.coverImageLqip
              ? {
                  placeholder: "blur" as const,
                  blurDataURL: p.coverImageLqip,
                }
              : {})}
          />
        </LocalizedLink>
      ) : null}

      <PublicationCategoryBadge category={p.category} dict={categoriesDict} />

      <LocalizedLink href={href} className="block">
        <h3 className="font-display text-lg font-semibold leading-snug tracking-tight text-amber-950 transition-colors duration-300 group-hover/top:text-amber-900 lg:text-xl">
          {p.title}
        </h3>
      </LocalizedLink>

      <p className="text-[13px] leading-[1.55] text-amber-900/70">
        {p.excerpt}
      </p>

      <p className="text-[10px] uppercase tracking-[0.22em] text-amber-900/60">
        {minutes}
      </p>
    </article>
  );
}

// ──────────────────────────────────────────────────────────────────
// COMPACT POST — secondary items in the right sidebar, NYT-style:
// title + minutes on the LEFT, small square thumbnail on the RIGHT.
// No excerpt. A top hairline separates each from the previous item.
// ──────────────────────────────────────────────────────────────────

function CompactPost({
  publication: p,
  minutesTemplate,
}: {
  publication: Publication;
  minutesTemplate: string;
}) {
  const href = `/publications/${p.slug}?from=home`;
  const minutes = minutesTemplate.replace("{n}", String(p.readingTimeMinutes));
  const hasThumb = Boolean(p.coverImageUrl);

  return (
    <article
      className={[
        "group/cp grid gap-4 border-t border-amber-900/15 py-4",
        hasThumb ? "grid-cols-[1fr_84px]" : "grid-cols-1",
      ].join(" ")}
    >
      <div className="flex min-w-0 flex-col gap-2">
        <LocalizedLink href={href} className="block">
          <h4 className="font-display text-[15px] font-semibold leading-snug tracking-tight text-amber-950 transition-colors duration-300 group-hover/cp:text-amber-900 lg:text-base">
            {p.title}
          </h4>
        </LocalizedLink>
        <p className="text-[10px] uppercase tracking-[0.22em] text-amber-900/60">
          {minutes}
        </p>
      </div>

      {hasThumb ? (
        <LocalizedLink
          href={href}
          className="relative aspect-square self-start overflow-hidden bg-amber-100/40"
        >
          <Image
            src={p.coverImageUrl!}
            alt={p.coverImageAlt ?? p.title}
            fill
            sizes="84px"
            className="object-cover transition duration-500 group-hover/cp:scale-[1.04]"
            {...(p.coverImageLqip
              ? {
                  placeholder: "blur" as const,
                  blurDataURL: p.coverImageLqip,
                }
              : {})}
          />
        </LocalizedLink>
      ) : null}
    </article>
  );
}

// ──────────────────────────────────────────────────────────────────
// TEASER PANEL — one of the two side cards (Archive / 3D Stories).
// On white, separated by a hairline gap. Callers pass a plain label;
// the panel renders the trailing arrow itself.
// ──────────────────────────────────────────────────────────────────

function TeaserPanel({
  kicker,
  title,
  description,
  href,
  linkLabel,
}: {
  kicker: string;
  title: string;
  description: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <LocalizedLink
      href={href}
      className="group/teaser flex flex-col gap-4 bg-white p-8 transition-colors duration-300 hover:bg-amber-50 md:p-10"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-amber-800/70 md:text-[11px]">
        {kicker}
      </p>
      <h3 className="font-display text-2xl font-semibold leading-tight tracking-tight text-amber-950 md:text-3xl">
        {title}
      </h3>
      <p className="text-sm leading-[1.6] text-amber-900/75 md:text-[15px]">
        {description}
      </p>
      <span className="mt-auto inline-flex items-center gap-2 pt-4 text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-900 md:text-[11px]">
        <span>{linkLabel}</span>
        <span
          aria-hidden
          className="transition-transform duration-300 group-hover/teaser:translate-x-1.5"
        >
          →
        </span>
      </span>
    </LocalizedLink>
  );
}
