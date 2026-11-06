import { sanityClient } from "./sanity/client";
import { urlFor } from "./sanity/image";
import {
  ALL_FAMILY_STORIES_QUERY,
  FAMILY_STORY_BY_SLUG_QUERY,
  FAMILY_STORY_SLUGS_QUERY,
  LATEST_FAMILY_STORIES_QUERY,
} from "./sanity/queries";
import { isFamilyStoryKind, type FamilyStoryKind } from "./familyArchiveShared";

// ──────────────────────────────────────────────────────────────────
// Народный архив — read side. Only PUBLISHED familyStory documents are
// visible here (the shared client uses the "published" perspective);
// submissions waiting for review are drafts and stay invisible.
//
// Every fetch is wrapped so a CMS hiccup degrades to an empty archive
// instead of taking the page (or the museum home page) down.
// ──────────────────────────────────────────────────────────────────

export {
  FAMILY_STORY_KINDS,
  FAMILY_KIND_BADGE,
  isFamilyStoryKind,
  type FamilyStoryKind,
} from "./familyArchiveShared";

export type FamilyStoryImage = {
  url: string;
  fullUrl: string;
  caption?: string;
  lqip?: string;
  width?: number;
  height?: number;
};

export type FamilyStory = {
  id: string;
  slug: string;
  title: string;
  kind: FamilyStoryKind;
  era?: string;
  place?: string;
  teip?: string;
  /** Public signature; undefined when anonymous or not given. */
  storyteller?: string;
  submittedAt?: string;
  excerpt: string;
  cover?: FamilyStoryImage;
  imageCount: number;
};

export type FamilyStoryDetail = FamilyStory & {
  paragraphs: string[];
  images: FamilyStoryImage[];
  editorNote?: string;
};

type SanityImage = {
  asset?: { _ref?: string };
  caption?: string;
  lqip?: string;
  dimensions?: { width?: number; height?: number };
};

type RawFamilyStory = {
  _id: string;
  slug: string;
  title: string;
  kind?: string;
  era?: string;
  place?: string;
  teip?: string;
  storytellerName?: string;
  anonymous?: boolean;
  submittedAt?: string;
  excerpt?: string;
  cover?: SanityImage | null;
  imageCount?: number | null;
  story?: string;
  editorNote?: string;
  images?: SanityImage[] | null;
};

function toImage(
  img: SanityImage | null | undefined,
  width: number
): FamilyStoryImage | undefined {
  if (!img?.asset?._ref) return undefined;
  return {
    url: urlFor(img).width(width).quality(82).url(),
    fullUrl: urlFor(img).width(2400).quality(90).url(),
    caption: img.caption || undefined,
    lqip: img.lqip,
    width: img.dimensions?.width,
    height: img.dimensions?.height,
  };
}

/** Trim to ~maxLen characters on a word boundary, adding an ellipsis. */
export function trimExcerpt(text: string, maxLen = 220): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLen) return clean;
  const cut = clean.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > maxLen * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[.,;:—–-]+$/, "")}…`;
}

/** Plain-text story → paragraphs: every line break starts a new one. */
export function splitParagraphs(text: string | undefined): string[] {
  if (!text) return [];
  return text
    .split(/\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function toFamilyStory(raw: RawFamilyStory): FamilyStory {
  return {
    id: raw._id,
    slug: raw.slug,
    title: raw.title,
    kind: isFamilyStoryKind(raw.kind) ? raw.kind : "other",
    era: raw.era || undefined,
    place: raw.place || undefined,
    teip: raw.teip || undefined,
    storyteller:
      !raw.anonymous && raw.storytellerName?.trim()
        ? raw.storytellerName.trim()
        : undefined,
    submittedAt: raw.submittedAt,
    excerpt: trimExcerpt(raw.excerpt ?? raw.story ?? ""),
    cover: toImage(raw.cover, 900),
    imageCount: raw.imageCount ?? 0,
  };
}

async function safeFetch<T>(
  query: string,
  params: Record<string, unknown>,
  fallback: T
): Promise<T> {
  try {
    const result = await sanityClient.fetch<T>(query, params);
    return result ?? fallback;
  } catch (err) {
    console.error("[family-archive] Sanity fetch failed:", err);
    return fallback;
  }
}

export async function getAllFamilyStories(): Promise<FamilyStory[]> {
  const raw = await safeFetch<RawFamilyStory[]>(
    ALL_FAMILY_STORIES_QUERY,
    {},
    []
  );
  return raw.map(toFamilyStory);
}

export async function getLatestFamilyStories(
  limit = 3
): Promise<FamilyStory[]> {
  const raw = await safeFetch<RawFamilyStory[]>(
    LATEST_FAMILY_STORIES_QUERY,
    { limit },
    []
  );
  return raw.map(toFamilyStory);
}

export async function getFamilyStoryBySlug(
  slug: string
): Promise<FamilyStoryDetail | undefined> {
  const raw = await safeFetch<RawFamilyStory | null>(
    FAMILY_STORY_BY_SLUG_QUERY,
    { slug },
    null
  );
  if (!raw) return undefined;
  return {
    ...toFamilyStory(raw),
    paragraphs: splitParagraphs(raw.story),
    images: (raw.images ?? [])
      .map((img) => toImage(img, 1400))
      .filter((img): img is FamilyStoryImage => Boolean(img)),
    editorNote: raw.editorNote?.trim() || undefined,
  };
}

export async function getAllFamilyStorySlugs(): Promise<string[]> {
  return safeFetch<string[]>(FAMILY_STORY_SLUGS_QUERY, {}, []);
}
