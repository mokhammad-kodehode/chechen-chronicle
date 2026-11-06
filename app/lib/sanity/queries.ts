import { groq } from "next-sanity";

const PUBLICATION_FIELDS = groq`
  _id,
  "slug": slug.current,
  title,
  titleEn,
  excerpt,
  excerptEn,
  coverImage,
  "coverImageLqip": coverImage.asset->metadata.lqip,
  "coverImageDimensions": coverImage.asset->metadata.dimensions{width, height},
  "author": author->{
    name,
    nameEn,
    role,
    roleEn,
    avatar,
  },
  publishedAt,
  readingTimeMinutes,
  category,
  tags,
  enable3DView,
  "model3dUrl": model3d.asset->url,
`;

export const ALL_PUBLICATIONS_QUERY = groq`
  *[_type == "publication" && defined(slug.current)] | order(publishedAt desc) {
    ${PUBLICATION_FIELDS}
  }
`;

// Home curation lives in the homeSettings singleton: a single `featured`
// reference (the banner) and an ordered `pinned` array (the front-page
// slots). Both are references, not booleans on the content, so curation
// stays a one-place, drag-to-reorder decision. The lib layer falls back
// to latest / newest-first when nothing is curated.
export const HOME_SETTINGS_QUERY = groq`
  *[_type == "homeSettings"][0]{
    "featured": featured->{ ${PUBLICATION_FIELDS} },
    "pinnedIds": pinned[]->_id
  }
`;

export const PUBLICATION_BY_SLUG_QUERY = groq`
  *[_type == "publication" && slug.current == $slug][0] {
    ${PUBLICATION_FIELDS}
    body,
    bodyEn,
  }
`;

export const PUBLICATION_SLUGS_QUERY = groq`
  *[_type == "publication" && defined(slug.current)].slug.current
`;

export const RELATED_PUBLICATIONS_QUERY = groq`
  *[_type == "publication" && slug.current != $slug && category == $category]
    | order(publishedAt desc)[0...$limit] {
      ${PUBLICATION_FIELDS}
    }
`;

export const FALLBACK_RELATED_QUERY = groq`
  *[_type == "publication" && slug.current != $slug && category != $category]
    | order(publishedAt desc)[0...$limit] {
      ${PUBLICATION_FIELDS}
    }
`;

export const CATEGORIES_IN_USE_QUERY = groq`
  array::unique(*[_type == "publication" && defined(category)].category)
`;

// ──────────────────────────────────────────────────────────────────
// Народный архив. The public client reads the "published" perspective,
// so submissions that are still drafts (on review) never show up here.
// Submitter contacts live in a separate, never-published document type
// and are not referenced by these projections.
// ──────────────────────────────────────────────────────────────────

const FAMILY_STORY_CARD_FIELDS = groq`
  _id,
  "slug": slug.current,
  title,
  kind,
  era,
  place,
  teip,
  storytellerName,
  anonymous,
  submittedAt,
  // First ~320 characters only — cards don't need the whole text.
  "excerpt": array::join(string::split(coalesce(story, ""), "")[0...320], ""),
  "cover": images[0]{
    ...,
    "lqip": asset->metadata.lqip
  },
  "imageCount": count(images),
`;

export const ALL_FAMILY_STORIES_QUERY = groq`
  *[_type == "familyStory" && defined(slug.current)]
    | order(coalesce(submittedAt, _createdAt) desc) {
    ${FAMILY_STORY_CARD_FIELDS}
  }
`;

export const LATEST_FAMILY_STORIES_QUERY = groq`
  *[_type == "familyStory" && defined(slug.current)]
    | order(coalesce(submittedAt, _createdAt) desc)[0...$limit] {
    ${FAMILY_STORY_CARD_FIELDS}
  }
`;

export const FAMILY_STORY_BY_SLUG_QUERY = groq`
  *[_type == "familyStory" && slug.current == $slug][0] {
    ${FAMILY_STORY_CARD_FIELDS}
    story,
    editorNote,
    "images": images[]{
      ...,
      "lqip": asset->metadata.lqip,
      "dimensions": asset->metadata.dimensions{width, height}
    },
  }
`;

export const FAMILY_STORY_SLUGS_QUERY = groq`
  *[_type == "familyStory" && defined(slug.current)].slug.current
`;
