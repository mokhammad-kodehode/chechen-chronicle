import { groq } from "next-sanity";

const PUBLICATION_FIELDS = groq`
  _id,
  "slug": slug.current,
  title,
  excerpt,
  coverImage,
  "coverImageLqip": coverImage.asset->metadata.lqip,
  "coverImageDimensions": coverImage.asset->metadata.dimensions{width, height},
  "author": author->{
    name,
    role,
    avatar,
  },
  publishedAt,
  readingTimeMinutes,
  category,
  tags,
  featured,
`;

export const ALL_PUBLICATIONS_QUERY = groq`
  *[_type == "publication" && defined(slug.current)] | order(publishedAt desc) {
    ${PUBLICATION_FIELDS}
  }
`;

export const FEATURED_PUBLICATION_QUERY = groq`
  *[_type == "publication" && featured == true && defined(slug.current)]
    | order(publishedAt desc)[0] {
      ${PUBLICATION_FIELDS}
    }
`;

export const PUBLICATION_BY_SLUG_QUERY = groq`
  *[_type == "publication" && slug.current == $slug][0] {
    ${PUBLICATION_FIELDS}
    body,
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
