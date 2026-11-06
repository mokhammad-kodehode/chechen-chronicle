import { NextResponse, type NextRequest } from "next/server";
import {
  FAMILY_LIMITS,
  type FamilySubmitResponse,
} from "@/app/lib/familyArchiveShared";
import {
  SubmitError,
  filledTooFast,
  looksLikeBot,
  rateLimited,
  saveSubmission,
  validateSubmission,
} from "@/app/lib/familyArchiveSubmit";

// POST /api/family-archive — receives a «Народный архив» submission
// (multipart/form-data from FamilySubmitForm) and stores it in Sanity
// as drafts for editorial review. Nothing is published automatically.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Text fields + photos; anything bigger is not a legitimate form post.
const MAX_BODY_BYTES = FAMILY_LIMITS.maxTotalBytes + 256 * 1024;

const STATUS: Record<string, number> = {
  rate_limited: 429,
  too_large: 413,
  not_configured: 503,
  server_error: 500,
};

function reply(body: FamilySubmitResponse) {
  const status = body.ok ? 200 : STATUS[body.error] ?? 400;
  return NextResponse.json(body, { status });
}

function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return (
    forwarded?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  const length = Number(req.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) return reply({ ok: false, error: "too_large" });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return reply({ ok: false, error: "invalid_field" });
  }

  // Honeypot filled → a bot. Pretend success so it doesn't retry.
  if (looksLikeBot(form)) return reply({ ok: true });
  if (filledTooFast(form)) return reply({ ok: false, error: "too_fast" });

  try {
    const submission = await validateSubmission(form);
    // Counted only for valid submissions — the ones that write to the
    // CMS — so a reader fixing typos in the form never gets locked out.
    if (rateLimited(clientIp(req))) {
      return reply({ ok: false, error: "rate_limited" });
    }
    await saveSubmission(submission);
    return reply({ ok: true });
  } catch (err) {
    if (err instanceof SubmitError) {
      if (err.code === "not_configured") {
        console.error(
          "[family-archive] SANITY_API_WRITE_TOKEN or NEXT_PUBLIC_SANITY_* is not set — submissions are disabled."
        );
      }
      return reply({ ok: false, error: err.code });
    }
    console.error("[family-archive] Failed to save submission:", err);
    return reply({ ok: false, error: "server_error" });
  }
}
