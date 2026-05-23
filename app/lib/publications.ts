import type { PortableTextBlock } from "@portabletext/types";
import { sanityClient } from "./sanity/client";
import { urlFor } from "./sanity/image";
import {
  ALL_PUBLICATIONS_QUERY,
  FEATURED_PUBLICATION_QUERY,
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
  featured?: boolean;
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
  author: { name: string; role?: string; avatar?: SanityImage };
  publishedAt: string;
  readingTimeMinutes?: number;
  category: PublicationCategory;
  tags?: string[];
  featured?: boolean;
  enable3DView?: boolean;
  model3dUrl?: string;
  body?: PortableTextBlock[];
};

function toPublication(raw: RawSanityPublication): Publication {
  const body = raw.body ?? [];
  return {
    id: raw._id,
    slug: raw.slug,
    title: raw.title,
    excerpt: raw.excerpt,
    coverImageUrl: raw.coverImage?.asset
      ? urlFor(raw.coverImage).width(1600).quality(85).url()
      : undefined,
    coverImageAlt: raw.coverImage?.alt,
    coverImageLqip: raw.coverImageLqip,
    coverImageWidth: raw.coverImageDimensions?.width,
    coverImageHeight: raw.coverImageDimensions?.height,
    author: {
      name: raw.author?.name ?? "",
      role: raw.author?.role,
      avatarUrl: raw.author?.avatar?.asset
        ? urlFor(raw.author.avatar).width(120).height(120).url()
        : undefined,
    },
    publishedAt: raw.publishedAt,
    readingTimeMinutes: raw.readingTimeMinutes ?? estimateReadingTime(body),
    category: raw.category,
    tags: raw.tags ?? [],
    featured: raw.featured ?? false,
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

export async function getAllPublications(): Promise<Publication[]> {
  const raw = await sanityClient.fetch<RawSanityPublication[]>(
    ALL_PUBLICATIONS_QUERY
  );
  return raw.map(toPublication);
}

export async function getFeaturedPublication(): Promise<Publication | undefined> {
  const raw = await sanityClient.fetch<RawSanityPublication | null>(
    FEATURED_PUBLICATION_QUERY
  );
  if (raw) return toPublication(raw);
  const all = await getAllPublications();
  return all[0];
}

export async function getPublicationBySlug(
  slug: string
): Promise<Publication | undefined> {
  const raw = await sanityClient.fetch<RawSanityPublication | null>(
    PUBLICATION_BY_SLUG_QUERY,
    { slug }
  );
  return raw ? toPublication(raw) : undefined;
}

export async function getAllPublicationSlugs(): Promise<string[]> {
  const slugs = await sanityClient.fetch<string[]>(PUBLICATION_SLUGS_QUERY);
  return slugs ?? [];
}

export async function getRelatedPublications(
  slug: string,
  limit = 3
): Promise<Publication[]> {
  const current = await getPublicationBySlug(slug);
  if (!current) return [];

  const sameCategory = await sanityClient.fetch<RawSanityPublication[]>(
    RELATED_PUBLICATIONS_QUERY,
    { slug, category: current.category, limit }
  );
  if (sameCategory.length >= limit) {
    return sameCategory.slice(0, limit).map(toPublication);
  }

  const fillCount = limit - sameCategory.length;
  const fillers = await sanityClient.fetch<RawSanityPublication[]>(
    FALLBACK_RELATED_QUERY,
    { slug, category: current.category, limit: fillCount }
  );
  return [...sameCategory, ...fillers].slice(0, limit).map(toPublication);
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
