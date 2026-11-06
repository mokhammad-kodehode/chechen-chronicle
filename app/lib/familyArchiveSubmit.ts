import "server-only";
import { randomUUID } from "node:crypto";
import { createClient, type SanityClient } from "next-sanity";
import {
  FAMILY_LIMITS as L,
  isFamilyStoryKind,
  type FamilyStoryKind,
  type FamilySubmitErrorCode,
} from "./familyArchiveShared";
import { isLocale, DEFAULT_LOCALE, type Locale } from "./i18n/config";

// ──────────────────────────────────────────────────────────────────
// Народный архив — write side (server only).
//
// A submission becomes TWO Sanity documents, both created as drafts:
//
//   drafts.<id>          familyStory              — the public content.
//                                                   Invisible on the site
//                                                   until an editor
//                                                   publishes it.
//   drafts.contact-<id>  familySubmissionContact  — name / email / phone.
//                                                   Publishing is disabled
//                                                   for this type in
//                                                   sanity.config.ts, so it
//                                                   never reaches the public
//                                                   dataset.
//
// Needs SANITY_API_WRITE_TOKEN (Editor role) in the server environment.
// ──────────────────────────────────────────────────────────────────

export class SubmitError extends Error {
  constructor(public code: FamilySubmitErrorCode) {
    super(code);
  }
}

export type ValidatedSubmission = {
  locale: Locale;
  title: string;
  kind: FamilyStoryKind;
  story: string;
  era?: string;
  place?: string;
  teip?: string;
  storytellerName?: string;
  anonymous: boolean;
  fullName: string;
  email?: string;
  phone?: string;
  messageToEditors?: string;
  images: { data: Buffer; filename: string; contentType: string; caption?: string }[];
};

// ── Validation ────────────────────────────────────────────────────

function text(
  form: FormData,
  key: string,
  max: number,
  { multiline = false }: { multiline?: boolean } = {}
): string | undefined {
  const raw = form.get(key);
  if (raw === null) return undefined;
  if (typeof raw !== "string") throw new SubmitError("invalid_field");
  // Normalise whitespace; strip control characters except line breaks
  // in multi-line fields.
  let v = raw.replace(/\r\n/g, "\n");
  v = v.replace(multiline ? /[\u0000-\u0009\u000B-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g, " ");
  v = multiline
    ? v
        .split("\n")
        .map((line) => line.replace(/[ \t]+/g, " ").trim())
        .join("\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
    : v.replace(/\s+/g, " ").trim();
  if (v.length > max) throw new SubmitError("invalid_field");
  return v || undefined;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function sniffImageType(buf: Buffer): string | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff)
    return "image/jpeg";
  if (
    buf.length >= 8 &&
    buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  )
    return "image/png";
  if (
    buf.length >= 12 &&
    buf.subarray(0, 4).toString("ascii") === "RIFF" &&
    buf.subarray(8, 12).toString("ascii") === "WEBP"
  )
    return "image/webp";
  return null;
}

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function validateSubmission(
  form: FormData
): Promise<ValidatedSubmission> {
  const localeRaw = form.get("locale");
  const locale =
    typeof localeRaw === "string" && isLocale(localeRaw)
      ? localeRaw
      : DEFAULT_LOCALE;

  const title = text(form, "title", L.titleMax);
  if (!title || title.length < L.titleMin) throw new SubmitError("invalid_title");

  const kind = form.get("kind");
  if (!isFamilyStoryKind(kind)) throw new SubmitError("invalid_kind");

  let story: string | undefined;
  try {
    story = text(form, "story", L.storyMax, { multiline: true });
  } catch {
    throw new SubmitError("invalid_story");
  }
  if (!story || story.length < L.storyMin) throw new SubmitError("invalid_story");

  const fullName = text(form, "fullName", L.nameMax);
  if (!fullName) throw new SubmitError("missing_name");

  const email = text(form, "email", L.emailMax);
  const phone = text(form, "phone", L.phoneMax);
  if (!email && !phone) throw new SubmitError("missing_contact");
  if (email && !EMAIL_RE.test(email)) throw new SubmitError("invalid_email");

  if (form.get("consentPublish") !== "on" || form.get("consentRights") !== "on")
    throw new SubmitError("consent_required");

  const files = form.getAll("images");
  if (files.length > L.maxImages) throw new SubmitError("too_many_images");

  const images: ValidatedSubmission["images"] = [];
  let total = 0;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (typeof file === "string") throw new SubmitError("invalid_image");
    if (file.size === 0) continue;
    if (file.size > L.maxImageBytes) throw new SubmitError("too_large");
    total += file.size;
    if (total > L.maxTotalBytes) throw new SubmitError("too_large");
    const data = Buffer.from(await file.arrayBuffer());
    const contentType = sniffImageType(data);
    if (!contentType) throw new SubmitError("invalid_image");
    images.push({
      data,
      contentType,
      filename: `family-archive-${i + 1}.${EXT[contentType]}`,
      caption: text(form, `caption_${i}`, L.captionMax),
    });
  }

  return {
    locale,
    title,
    kind,
    story,
    era: text(form, "era", L.eraMax),
    place: text(form, "place", L.placeMax),
    teip: text(form, "teip", L.teipMax),
    storytellerName: text(form, "storytellerName", L.storytellerMax),
    anonymous: form.get("anonymous") === "on",
    fullName,
    email,
    phone,
    messageToEditors: text(form, "messageToEditors", L.messageMax, {
      multiline: true,
    }),
    images,
  };
}

// ── Anti-spam: honeypot + fill time + per-IP rate limit ───────────

/** True when the request looks automated and should be dropped. */
export function looksLikeBot(form: FormData): boolean {
  const honeypot = form.get("website");
  return typeof honeypot === "string" && honeypot.trim() !== "";
}

export function filledTooFast(form: FormData, now = Date.now()): boolean {
  const started = Number(form.get("startedAt"));
  if (!Number.isFinite(started) || started <= 0) return true;
  return now - started < L.minFillMs;
}

// Best-effort, per server instance. Good enough to stop a single
// misbehaving client; put a CAPTCHA / edge rate limit in front if the
// form starts getting real spam.
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

export function rateLimited(ip: string, now = Date.now()): boolean {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    }
  }
  return false;
}

// ── Slug ──────────────────────────────────────────────────────────

const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
  з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
  п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts",
  ч: "ch", ш: "sh", щ: "shch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu",
  я: "ya",
  // Chechen palochka (Ӏ / ӏ) and its common stand-ins carry no sound
  // of their own in a Latin slug.
  "ӏ": "", "Ӏ": "", "№": "n",
};

export function slugify(input: string): string {
  const base = input
    // Palochka is often typed as Latin "I" or the digit "1" next to
    // Cyrillic letters (ХьарачIой, к1ант) — drop it like the real one.
    .replace(/(?<=[\u0400-\u04FF])[I1](?=[\u0400-\u04FF]|\b|$)/g, "")
    .toLowerCase()
    .split("")
    .map((ch) => TRANSLIT[ch] ?? ch)
    .join("")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72)
    .replace(/-+$/g, "");
  return base || "istoriya";
}

// ── Write ─────────────────────────────────────────────────────────

let writeClient: SanityClient | null = null;

function getWriteClient(): SanityClient {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION;
  if (!token || !projectId || !dataset || !apiVersion) {
    throw new SubmitError("not_configured");
  }
  writeClient ??= createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
  });
  return writeClient;
}

export async function saveSubmission(
  s: ValidatedSubmission,
  client: Pick<SanityClient, "assets" | "transaction"> = getWriteClient()
): Promise<void> {
  const id = randomUUID();
  const now = new Date().toISOString();

  const uploaded = [];
  for (const img of s.images) {
    const asset = await client.assets.upload("image", img.data, {
      filename: img.filename,
      contentType: img.contentType,
    });
    uploaded.push({
      _type: "image" as const,
      _key: randomUUID().slice(0, 12),
      asset: { _type: "reference" as const, _ref: asset._id },
      ...(img.caption ? { caption: img.caption } : {}),
    });
  }

  await client
    .transaction()
    .create({
      _id: `drafts.${id}`,
      _type: "familyStory",
      title: s.title,
      slug: {
        _type: "slug",
        current: `${slugify(s.title)}-${id.slice(0, 6)}`,
      },
      kind: s.kind,
      story: s.story,
      era: s.era,
      place: s.place,
      teip: s.teip,
      storytellerName: s.storytellerName,
      anonymous: s.anonymous,
      images: uploaded,
      submittedAt: now,
    })
    .create({
      _id: `drafts.contact-${id}`,
      _type: "familySubmissionContact",
      storyId: id,
      storyTitle: s.title,
      fullName: s.fullName,
      email: s.email,
      phone: s.phone,
      messageToEditors: s.messageToEditors,
      consentPublish: true,
      consentRights: true,
      locale: s.locale,
      submittedAt: now,
    })
    .commit();
}
