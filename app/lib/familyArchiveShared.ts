// Народный архив — definitions shared by the submission form (client),
// the API route (server) and the read side. Keep this file free of
// Sanity / server imports: client components import it.

export const FAMILY_STORY_KINDS = [
  "memory",
  "legend",
  "photo",
  "document",
  "other",
] as const;
export type FamilyStoryKind = (typeof FAMILY_STORY_KINDS)[number];

export function isFamilyStoryKind(v: unknown): v is FamilyStoryKind {
  return (
    typeof v === "string" &&
    (FAMILY_STORY_KINDS as readonly string[]).includes(v)
  );
}

export const FAMILY_KIND_BADGE: Record<FamilyStoryKind, string> = {
  memory: "bg-amber-900 text-white",
  legend: "bg-rose-800 text-white",
  photo: "bg-stone-700 text-white",
  document: "bg-emerald-800 text-white",
  other: "bg-indigo-800 text-white",
};

// Limits: the form and the API route agree on what is accepted.
//
// Image budget: hosting platforms cap request bodies (Vercel: 4.5 MB
// for serverless functions), so the form downscales photos in the
// browser before upload and the server rejects anything above the
// total budget.

export const FAMILY_LIMITS = {
  titleMin: 3,
  titleMax: 160,
  storyMin: 40,
  storyMax: 20000,
  eraMax: 80,
  placeMax: 120,
  teipMax: 80,
  storytellerMax: 120,
  nameMax: 120,
  emailMax: 160,
  phoneMax: 60,
  messageMax: 2000,
  captionMax: 200,
  maxImages: 6,
  /** Longest side of a photo after in-browser downscaling, px. */
  imageMaxSide: 2000,
  maxImageBytes: 2.5 * 1024 * 1024,
  maxTotalBytes: 4 * 1024 * 1024,
  /** A human needs at least this long to fill the form (anti-bot). */
  minFillMs: 4000,
} as const;

export type FamilySubmitErrorCode =
  | "invalid_title"
  | "invalid_story"
  | "invalid_kind"
  | "invalid_field"
  | "missing_name"
  | "missing_contact"
  | "invalid_email"
  | "consent_required"
  | "too_many_images"
  | "invalid_image"
  | "too_large"
  | "too_fast"
  | "rate_limited"
  | "not_configured"
  | "server_error";

export type FamilySubmitResponse =
  | { ok: true }
  | { ok: false; error: FamilySubmitErrorCode };
