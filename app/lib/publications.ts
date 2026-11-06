import type { PortableTextBlock } from "@portabletext/types";
import { sanityClient } from "./sanity/client";
import { urlFor } from "./sanity/image";
import {
  ALL_PUBLICATIONS_QUERY,
  HOME_SETTINGS_QUERY,
  PUBLICATION_BY_SLUG_QUERY,
  PUBLICATION_SLUGS_QUERY,
  RELATED_PUBLICATIONS_QUERY,
  FALLBACK_RELATED_QUERY,
  CATEGORIES_IN_USE_QUERY,
} from "./sanity/queries";
import { LOCALE_BCP47, type Locale } from "./i18n/config";

export type PublicationCategory =
  | "research"
  | "essay"
  | "archive"
  | "interview"
  | "memory";

export const CATEGORY_LABEL: Record<PublicationCategory, string> = {
  research: "Исследование",
  essay: "Эссе",
  archive: "Архивная находка",
  interview: "Интервью",
  memory: "Память",
};

export const CATEGORY_BADGE: Record<PublicationCategory, string> = {
  research: "bg-amber-900 text-white",
  essay: "bg-emerald-800 text-white",
  archive: "bg-stone-700 text-white",
  interview: "bg-rose-800 text-white",
  memory: "bg-indigo-800 text-white",
};

export type PublicationAuthor = {
  name: string;
  role?: string;
  avatarUrl?: string;
};

export type Publication = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl?: string;
  coverImageAlt?: string;
  coverImageLqip?: string;
  coverImageWidth?: number;
  coverImageHeight?: number;
  author: PublicationAuthor;
  /** ISO date */
  publishedAt: string;
  readingTimeMinutes: number;
  category: PublicationCategory;
  tags: string[];
  enable3DView?: boolean;
  model3dUrl?: string;
  body: PortableTextBlock[];
};

type SanityImage = { asset?: { _ref?: string }; alt?: string } | undefined;

type RawSanityPublication = {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage?: SanityImage;
  coverImageLqip?: string;
  coverImageDimensions?: { width?: number; height?: number };
  author: {
    name: string;
    nameEn?: string;
    role?: string;
    roleEn?: string;
    avatar?: SanityImage;
  };
  publishedAt: string;
  readingTimeMinutes?: number;
  category: PublicationCategory;
  tags?: string[];
  enable3DView?: boolean;
  model3dUrl?: string;
  body?: PortableTextBlock[];
  titleEn?: string;
  excerptEn?: string;
  bodyEn?: PortableTextBlock[];
};

function toPublication(
  raw: RawSanityPublication,
  lang: Locale = "ru"
): Publication {
  const en = lang === "en";
  const body = en && raw.bodyEn?.length ? raw.bodyEn : raw.body ?? [];
  return {
    id: raw._id,
    slug: raw.slug,
    title: en && raw.titleEn ? raw.titleEn : raw.title,
    excerpt: en && raw.excerptEn ? raw.excerptEn : raw.excerpt,
    coverImageUrl: raw.coverImage?.asset
      ? urlFor(raw.coverImage).width(1600).quality(85).url()
      : undefined,
    coverImageAlt: raw.coverImage?.alt,
    coverImageLqip: raw.coverImageLqip,
    coverImageWidth: raw.coverImageDimensions?.width,
    coverImageHeight: raw.coverImageDimensions?.height,
    author: {
      name: (en ? raw.author?.nameEn : undefined) ?? raw.author?.name ?? "",
      role: (en ? raw.author?.roleEn : undefined) ?? raw.author?.role,
      avatarUrl: raw.author?.avatar?.asset
        ? urlFor(raw.author.avatar).width(120).height(120).url()
        : undefined,
    },
    publishedAt: raw.publishedAt,
    readingTimeMinutes:
      en && raw.bodyEn?.length
        ? estimateReadingTime(body)
        : raw.readingTimeMinutes ?? estimateReadingTime(body),
    category: raw.category,
    tags: raw.tags ?? [],
    enable3DView: raw.enable3DView ?? false,
    model3dUrl: raw.model3dUrl,
    body,
  };
}

function estimateReadingTime(body: PortableTextBlock[]): number {
  const text = body.map(blockToText).join(" ").trim();
  if (!text) return 1;
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function blockToText(block: PortableTextBlock): string {
  const b = block as unknown as {
    _type?: string;
    children?: { text?: string }[];
    text?: string;
  };
  if (b._type === "block") {
    return (b.children ?? []).map((c) => c.text ?? "").join(" ");
  }
  if (b._type === "pullQuote") {
    return b.text ?? "";
  }
  return "";
}

export async function getAllPublications(
  lang: Locale = "ru"
): Promise<Publication[]> {
  const raw = await sanityClient.fetch<RawSanityPublication[]>(
    ALL_PUBLICATIONS_QUERY
  );
  return raw.map((r) => toPublication(r, lang));
}

// Home curation from the homeSettings singleton: the banner `featured`
// publication and the ordered `pinned` ids for the front-page slots.
// Both are optional — callers fall back to "latest" / "newest-first".
export async function getHomeCuration(lang: Locale = "ru"): Promise<{
  featured?: Publication;
  pinnedIds: string[];
}> {
  const raw = await sanityClient.fetch<{
    featured: RawSanityPublication | null;
    pinnedIds: (string | null)[] | null;
  } | null>(HOME_SETTINGS_QUERY);
  return {
    featured: raw?.featured ? toPublication(raw.featured, lang) : undefined,
    pinnedIds: (raw?.pinnedIds ?? []).filter((id): id is string => Boolean(id)),
  };
}

export async function getPublicationBySlug(
  slug: string,
  lang: Locale = "ru"
): Promise<Publication | undefined> {
  const raw = await sanityClient.fetch<RawSanityPublication | null>(
    PUBLICATION_BY_SLUG_QUERY,
    { slug }
  );
  return raw ? toPublication(raw, lang) : undefined;
}

export async function getAllPublicationSlugs(): Promise<string[]> {
  const slugs = await sanityClient.fetch<string[]>(PUBLICATION_SLUGS_QUERY);
  return slugs ?? [];
}

export async function getRelatedPublications(
  slug: string,
  lang: Locale = "ru",
  limit = 3
): Promise<Publication[]> {
  const current = await getPublicationBySlug(slug, lang);
  if (!current) return [];

  const sameCategory = await sanityClient.fetch<RawSanityPublication[]>(
    RELATED_PUBLICATIONS_QUERY,
    { slug, category: current.category, limit }
  );
  if (sameCategory.length >= limit) {
    return sameCategory.slice(0, limit).map((r) => toPublication(r, lang));
  }

  const fillCount = limit - sameCategory.length;
  const fillers = await sanityClient.fetch<RawSanityPublication[]>(
    FALLBACK_RELATED_QUERY,
    { slug, category: current.category, limit: fillCount }
  );
  return [...sameCategory, ...fillers]
    .slice(0, limit)
    .map((r) => toPublication(r, lang));
}

export async function getAllCategories(): Promise<PublicationCategory[]> {
  const cats = await sanityClient.fetch<PublicationCategory[] | null>(
    CATEGORIES_IN_USE_QUERY
  );
  return cats ?? [];
}

export function formatPublicationDate(
  iso: string,
  locale: Locale = "ru"
): string {
  const date = new Date(iso);
  return date.toLocaleDateString(LOCALE_BCP47[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ──────────────────────────────────────────────────────────────────
// «Из журнала» shelf on the museum home page.
//
// Order: the curated `featured` article, then the editor's `pinned`
// list (homeSettings), then everything else newest-first. Dangling or
// duplicate ids are skipped.
// ──────────────────────────────────────────────────────────────────

export function pickForHomeJournal(
  all: Publication[],
  featured?: Publication,
  pinnedIds: string[] = [],
  limit = 3
): Publication[] {
  const byId = new Map(all.map((p) => [p.id, p]));
  const seen = new Set<string>();
  const picked: Publication[] = [];
  const take = (p: Publication | undefined) => {
    if (!p || seen.has(p.id) || picked.length >= limit) return;
    seen.add(p.id);
    picked.push(p);
  };
  take(featured);
  pinnedIds.forEach((id) => take(byId.get(id)));
  all.forEach(take);
  return picked;
}
