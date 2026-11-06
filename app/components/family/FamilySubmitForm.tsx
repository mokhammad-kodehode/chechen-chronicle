"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { LocalizedLink } from "@/app/components/common/LocalizedLink";
import {
  FAMILY_LIMITS as L,
  FAMILY_STORY_KINDS,
  type FamilyStoryKind,
  type FamilySubmitErrorCode,
  type FamilySubmitResponse,
} from "@/app/lib/familyArchiveShared";
import { format, type Dictionary } from "@/app/lib/i18n/shared";
import { prepareImage } from "./prepareImage";

// «Поделиться историей» — the Family Archive submission form.
//
// Posts multipart/form-data to /api/family-archive. Photos are
// downscaled in the browser first (prepareImage), which also strips
// EXIF/GPS. The server re-validates everything; client checks here are
// only for fast, friendly feedback.

type Dict = Dictionary["family"]["submit"];
type KindsDict = Dictionary["family"]["kinds"];

type Photo = {
  id: string;
  file: File;
  previewUrl: string;
  caption: string;
};

type Status =
  | { kind: "idle" }
  | { kind: "preparing" }
  | { kind: "sending" }
  | { kind: "success" }
  | { kind: "error"; message: string };

type Props = {
  dict: Dict;
  kinds: KindsDict;
};

export function FamilySubmitForm({ dict, kinds }: Props) {
  const params = useParams();
  const locale = typeof params?.lang === "string" ? params.lang : "ru";
  const uid = useId();
  const topRef = useRef<HTMLDivElement>(null);
  const startedAt = useRef(0);

  const [kind, setKind] = useState<FamilyStoryKind>("memory");
  const [story, setStory] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  // Fill-time check for the anti-bot guard on the server.
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  // Free preview object URLs when the form unmounts.
  const photosRef = useRef(photos);
  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);
  useEffect(
    () => () => photosRef.current.forEach((p) => URL.revokeObjectURL(p.previewUrl)),
    []
  );

  const busy = status.kind === "preparing" || status.kind === "sending";
  const errorText = (code: FamilySubmitErrorCode | "network") => {
    const template = dict.errors[code] ?? dict.errors.server_error;
    return format(template, { n: L.maxImages });
  };

  function addPhotos(files: FileList | null) {
    if (!files) return;
    const room = L.maxImages - photos.length;
    const picked = Array.from(files)
      .filter((f) => f.type.startsWith("image/") || f.type === "")
      .slice(0, Math.max(0, room));
    if (files.length > room) {
      setStatus({ kind: "error", message: errorText("too_many_images") });
    }
    setPhotos((prev) => [
      ...prev,
      ...picked.map((file) => ({
        id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        caption: "",
      })),
    ]);
  }

  function removePhoto(id: string) {
    setPhotos((prev) => {
      const gone = prev.find((p) => p.id === id);
      if (gone) URL.revokeObjectURL(gone.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  }

  function setCaption(id: string, caption: string) {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, caption } : p)));
  }

  function fail(message: string) {
    setStatus({ kind: "error", message });
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Client-side mirror of the server rules, so most mistakes are
  // caught before anything is uploaded.
  function clientCheck(fd: FormData): FamilySubmitErrorCode | null {
    const get = (k: string) => String(fd.get(k) ?? "").trim();
    if (get("title").length < L.titleMin) return "invalid_title";
    if (get("story").length < L.storyMin) return "invalid_story";
    if (!get("fullName")) return "missing_name";
    if (!get("email") && !get("phone")) return "missing_contact";
    if (get("email") && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(get("email")))
      return "invalid_email";
    if (fd.get("consentPublish") !== "on" || fd.get("consentRights") !== "on")
      return "consent_required";
    return null;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const form = e.currentTarget;
    const fd = new FormData(form);

    const problem = clientCheck(fd);
    if (problem) return fail(errorText(problem));

    // Photos: downscale + strip EXIF, then append in order with captions.
    fd.delete("images");
    if (photos.length > 0) {
      setStatus({ kind: "preparing" });
      let total = 0;
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i]!;
        let blob: Blob;
        try {
          blob = await prepareImage(photo.file);
        } catch {
          return fail(format(dict.errors.image_read, { name: photo.file.name }));
        }
        total += blob.size;
        if (total > L.maxTotalBytes) return fail(errorText("too_large"));
        fd.append("images", blob, `photo-${i + 1}.jpg`);
        if (photo.caption.trim()) fd.set(`caption_${i}`, photo.caption.trim());
      }
    }

    fd.set("kind", kind);
    fd.set("locale", locale);
    fd.set("startedAt", String(startedAt.current));

    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/family-archive", { method: "POST", body: fd });
      const data = (await res.json().catch(() => null)) as FamilySubmitResponse | null;
      if (data?.ok) {
        photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
        setPhotos([]);
        setStory("");
        setAnonymous(false);
        setKind("memory");
        form.reset();
        setStatus({ kind: "success" });
        topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      fail(errorText(data && !data.ok ? data.error : "server_error"));
    } catch {
      fail(errorText("network"));
    }
  }

  if (status.kind === "success") {
    return (
      <div ref={topRef} className="scroll-mt-24">
        <SuccessPanel
          dict={dict}
          onAgain={() => {
            startedAt.current = Date.now();
            setStatus({ kind: "idle" });
          }}
        />
      </div>
    );
  }

  const f = dict.fields;
  const storyLen = story.trim().length;

  return (
    <div ref={topRef} className="scroll-mt-24">
      <form
        onSubmit={onSubmit}
        noValidate
        className="space-y-12"
        aria-busy={busy}
      >
        {status.kind === "error" ? (
          <div
            role="alert"
            className="border-l-4 border-rose-700 bg-rose-50 px-5 py-4 text-sm leading-[1.6] text-rose-900"
          >
            {status.message}
          </div>
        ) : null}

        {/* Honeypot — hidden from people, irresistible to bots. */}
        <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label>
            Website
            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        {/* ── 1. The story ─────────────────────────────────────── */}
        <Section number={1} title={dict.sections.story}>
          <fieldset>
            <legend className={labelCls}>
              {f.kind} <Req dict={f} />
            </legend>
            <div className="mt-3 flex flex-wrap gap-2" role="radiogroup">
              {FAMILY_STORY_KINDS.map((k) => (
                <label
                  key={k}
                  className={[
                    "cursor-pointer select-none rounded-full border px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] transition",
                    "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-amber-700 has-[:focus-visible]:ring-offset-2",
                    kind === k
                      ? "border-amber-900 bg-amber-900 text-white"
                      : "border-amber-900/25 bg-white text-amber-900 hover:border-amber-900/50",
                  ].join(" ")}
                >
                  <input
                    type="radio"
                    name="kindChoice"
                    value={k}
                    checked={kind === k}
                    onChange={() => setKind(k)}
                    className="sr-only"
                  />
                  {kinds[k]}
                </label>
              ))}
            </div>
          </fieldset>

          <Field id={`${uid}-title`} label={f.title} required dict={f}>
            <input
              id={`${uid}-title`}
              name="title"
              type="text"
              required
              minLength={L.titleMin}
              maxLength={L.titleMax}
              placeholder={f.titlePlaceholder}
              className={inputCls}
            />
          </Field>

          <Field id={`${uid}-story`} label={f.story} required dict={f}>
            <textarea
              id={`${uid}-story`}
              name="story"
              required
              rows={12}
              maxLength={L.storyMax}
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder={f.storyPlaceholder}
              className={`${inputCls} min-h-[260px] resize-y leading-[1.7]`}
              aria-describedby={`${uid}-story-count`}
            />
            <p
              id={`${uid}-story-count`}
              className={[
                "mt-2 text-xs",
                storyLen >= L.storyMin ? "text-emerald-800" : "text-amber-900/60",
              ].join(" ")}
            >
              {format(f.storyCounter, { n: storyLen, min: L.storyMin })}
            </p>
          </Field>

          <div className="grid gap-6 md:grid-cols-3">
            <Field id={`${uid}-era`} label={f.era} dict={f}>
              <input
                id={`${uid}-era`}
                name="era"
                type="text"
                maxLength={L.eraMax}
                placeholder={f.eraPlaceholder}
                className={inputCls}
              />
            </Field>
            <Field id={`${uid}-place`} label={f.place} dict={f}>
              <input
                id={`${uid}-place`}
                name="place"
                type="text"
                maxLength={L.placeMax}
                placeholder={f.placePlaceholder}
                className={inputCls}
              />
            </Field>
            <Field id={`${uid}-teip`} label={f.teip} dict={f}>
              <input
                id={`${uid}-teip`}
                name="teip"
                type="text"
                maxLength={L.teipMax}
                placeholder={f.teipPlaceholder}
                className={inputCls}
              />
            </Field>
          </div>
        </Section>

        {/* ── 2. Photos ────────────────────────────────────────── */}
        <Section number={2} title={dict.sections.photos}>
          <p className="text-sm leading-[1.6] text-amber-900/70">
            {format(f.photosHint, { n: L.maxImages })}
          </p>

          {photos.length > 0 ? (
            <ul className="grid gap-4 sm:grid-cols-2">
              {photos.map((p) => (
                <li
                  key={p.id}
                  className="flex gap-4 border border-amber-900/15 bg-white p-3"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
                  <img
                    src={p.previewUrl}
                    alt=""
                    className="h-24 w-24 shrink-0 object-cover"
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <input
                      type="text"
                      aria-label={f.caption}
                      placeholder={f.caption}
                      maxLength={L.captionMax}
                      value={p.caption}
                      onChange={(e) => setCaption(p.id, e.target.value)}
                      className={`${inputCls} h-10 text-sm`}
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(p.id)}
                      className="self-start text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-800 hover:text-rose-950"
                    >
                      {f.remove}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}

          {photos.length < L.maxImages ? (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-amber-900/35 bg-amber-50/50 px-6 py-8 text-center transition hover:border-amber-900/60 hover:bg-amber-50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-amber-700">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-8 w-8 text-amber-900/50"
                aria-hidden
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-900">
                {f.photosAdd}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                multiple
                className="sr-only"
                onChange={(e) => {
                  addPhotos(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
          ) : null}
        </Section>

        {/* ── 3. Signature ─────────────────────────────────────── */}
        <Section number={3} title={dict.sections.signature}>
          <Field id={`${uid}-signature`} label={f.storytellerName} dict={f}>
            <input
              id={`${uid}-signature`}
              name="storytellerName"
              type="text"
              maxLength={L.storytellerMax}
              placeholder={f.storytellerPlaceholder}
              disabled={anonymous}
              className={`${inputCls} disabled:bg-amber-50/60 disabled:text-amber-900/40`}
            />
          </Field>
          <Checkbox
            name="anonymous"
            checked={anonymous}
            onChange={setAnonymous}
            label={f.anonymous}
          />
        </Section>

        {/* ── 4. Contacts (private) ────────────────────────────── */}
        <Section number={4} title={dict.sections.contacts} note={dict.privacy}>
          <Field id={`${uid}-name`} label={f.fullName} required dict={f}>
            <input
              id={`${uid}-name`}
              name="fullName"
              type="text"
              required
              autoComplete="name"
              maxLength={L.nameMax}
              className={inputCls}
            />
          </Field>
          <div className="grid gap-6 md:grid-cols-2">
            <Field id={`${uid}-email`} label={f.email} dict={f}>
              <input
                id={`${uid}-email`}
                name="email"
                type="email"
                autoComplete="email"
                maxLength={L.emailMax}
                className={inputCls}
              />
            </Field>
            <Field id={`${uid}-phone`} label={f.phone} dict={f}>
              <input
                id={`${uid}-phone`}
                name="phone"
                type="tel"
                autoComplete="tel"
                maxLength={L.phoneMax}
                className={inputCls}
              />
            </Field>
          </div>
          <p className="-mt-2 text-xs text-amber-900/60">{f.contactHint}</p>
          <Field id={`${uid}-message`} label={f.message} dict={f}>
            <textarea
              id={`${uid}-message`}
              name="messageToEditors"
              rows={3}
              maxLength={L.messageMax}
              placeholder={f.messagePlaceholder}
              className={`${inputCls} resize-y`}
            />
          </Field>
        </Section>

        {/* ── Consents + submit ────────────────────────────────── */}
        <div className="space-y-4 border-t border-amber-900/15 pt-8">
          <Checkbox name="consentPublish" label={f.consentPublish} required />
          <Checkbox name="consentRights" label={f.consentRights} required />

          <button
            type="submit"
            disabled={busy}
            className="mt-4 inline-flex h-14 w-full items-center justify-center gap-3 rounded-sm bg-amber-900 px-8 text-[12px] font-semibold uppercase tracking-[0.28em] text-white transition hover:bg-amber-800 disabled:cursor-wait disabled:opacity-70 sm:w-auto"
          >
            {busy ? <Spinner /> : null}
            {status.kind === "preparing"
              ? dict.preparing
              : status.kind === "sending"
              ? dict.sending
              : dict.submit}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Building blocks ───────────────────────────────────────────────

const labelCls =
  "text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-900";

const inputCls =
  "block w-full rounded-sm border border-amber-900/25 bg-white px-4 py-3 text-[15px] text-amber-950 placeholder:text-amber-900/35 transition focus:border-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-700/25";

function Req({ dict }: { dict: Dict["fields"] }) {
  return (
    <span className="ml-1 font-normal normal-case tracking-normal text-amber-900/50">
      ({dict.required})
    </span>
  );
}

function Section({
  number,
  title,
  note,
  children,
}: {
  number: number;
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-6">
      <div className="flex items-baseline gap-4 border-b border-amber-900/15 pb-3">
        <span
          aria-hidden
          className="font-display text-3xl font-semibold leading-none text-amber-800/40"
        >
          {number}
        </span>
        <h2 className="font-display text-2xl font-semibold tracking-tight text-amber-950">
          {title}
        </h2>
      </div>
      {note ? (
        <p className="bg-amber-50 px-4 py-3 text-sm leading-[1.6] text-amber-900/80">
          {note}
        </p>
      ) : null}
      {children}
    </section>
  );
}

function Field({
  id,
  label,
  required,
  dict,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  dict: Dict["fields"];
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className={`${labelCls} mb-2 block`}>
        {label}
        {required ? <Req dict={dict} /> : null}
      </label>
      {children}
    </div>
  );
}

function Checkbox({
  name,
  label,
  required,
  checked,
  onChange,
}: {
  name: string;
  label: string;
  required?: boolean;
  checked?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm leading-[1.6] text-amber-950">
      <input
        type="checkbox"
        name={name}
        required={required}
        {...(onChange
          ? { checked, onChange: (e) => onChange(e.target.checked) }
          : {})}
        className="mt-1 h-4 w-4 shrink-0 accent-amber-900"
      />
      <span>{label}</span>
    </label>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
    />
  );
}

function SuccessPanel({ dict, onAgain }: { dict: Dict; onAgain: () => void }) {
  return (
    <div
      role="status"
      className="flex flex-col items-center border border-amber-900/15 bg-[#F4EFE3] px-6 py-14 text-center md:px-12"
    >
      <span
        aria-hidden
        className="grid h-14 w-14 place-items-center rounded-full bg-amber-900 text-2xl text-white"
      >
        ✓
      </span>
      <h2 className="mt-6 font-display text-3xl font-semibold tracking-tight text-amber-950">
        {dict.success.title}
      </h2>
      <p className="mt-4 max-w-lg text-[15px] leading-[1.7] text-amber-900/80">
        {dict.success.text}
      </p>
      <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
        <button
          type="button"
          onClick={onAgain}
          className="inline-flex h-12 items-center justify-center rounded-sm bg-amber-900 px-7 text-[11px] font-semibold uppercase tracking-[0.28em] text-white transition hover:bg-amber-800"
        >
          {dict.success.again}
        </button>
        <LocalizedLink
          href="/family-archive"
          className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-900 hover:text-amber-950"
        >
          {dict.success.back} →
        </LocalizedLink>
      </div>
    </div>
  );
}
