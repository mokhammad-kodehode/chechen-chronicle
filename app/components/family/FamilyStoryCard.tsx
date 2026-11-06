import Image from "next/image";
import { LocalizedLink } from "@/app/components/common/LocalizedLink";
import type { FamilyStory } from "@/app/lib/familyArchive";
import { format, type Dictionary } from "@/app/lib/i18n/shared";
import { FamilyKindBadge } from "./FamilyKindBadge";

type Props = {
  story: FamilyStory;
  dict: Dictionary["family"];
};

// Card for one reader story. Image-led when the story has a photo;
// otherwise a quiet parchment card where the opening lines of the story
// stand in for the image — most family memories arrive as text only,
// and they shouldn't look like "missing image" placeholders.
export function FamilyStoryCard({ story, dict }: Props) {
  const href = `/family-archive/${story.slug}`;
  const meta = [story.place, story.era].filter(Boolean).join(" · ");

  return (
    <article className="group flex h-full flex-col overflow-hidden border border-amber-900/15 bg-white transition hover:border-amber-900/40">
      <LocalizedLink href={href} className="block" tabIndex={-1} aria-hidden>
        {story.cover ? (
          <div className="relative aspect-[4/3] overflow-hidden bg-amber-50">
            <Image
              src={story.cover.url}
              alt=""
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover sepia-[0.15] transition duration-700 group-hover:scale-[1.04] group-hover:sepia-0"
              {...(story.cover.lqip
                ? { placeholder: "blur" as const, blurDataURL: story.cover.lqip }
                : {})}
            />
            {story.imageCount > 1 ? (
              <span className="absolute bottom-3 right-3 rounded bg-black/55 px-2 py-1 text-[10px] font-semibold tracking-widest text-white backdrop-blur">
                {format(dict.card.photos, { n: story.imageCount })}
              </span>
            ) : null}
          </div>
        ) : (
          <div className="relative aspect-[4/3] overflow-hidden bg-[#F4EFE3] px-6 py-7">
            <span
              aria-hidden
              className="absolute left-4 top-1 font-display text-[88px] leading-none text-amber-900/15"
            >
              “
            </span>
            <p className="relative line-clamp-6 pt-6 font-display text-[15px] italic leading-[1.6] text-amber-900/80">
              {story.excerpt}
            </p>
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#F4EFE3] to-transparent"
            />
          </div>
        )}
      </LocalizedLink>

      <div className="flex flex-1 flex-col gap-3 px-5 py-5">
        <div className="flex flex-wrap items-center gap-2">
          <FamilyKindBadge kind={story.kind} dict={dict.kinds} />
          {meta ? (
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-900/60">
              {meta}
            </span>
          ) : null}
        </div>

        <LocalizedLink href={href}>
          <h3 className="font-display text-lg font-semibold leading-snug tracking-tight text-amber-950 transition-colors group-hover:text-amber-900 md:text-xl">
            {story.title}
          </h3>
        </LocalizedLink>

        {story.cover ? (
          <p className="line-clamp-3 text-sm leading-[1.6] text-amber-900/70">
            {story.excerpt}
          </p>
        ) : null}

        {story.storyteller ? (
          <p className="font-display text-sm italic text-amber-800/80">
            — {story.storyteller}
          </p>
        ) : null}

        <div className="mt-auto flex justify-end pt-2 text-[10px] uppercase tracking-[0.2em]">
          <LocalizedLink
            href={href}
            className="inline-flex shrink-0 items-center gap-2 font-semibold text-amber-900"
          >
            <span>{dict.card.read}</span>
            <span
              aria-hidden
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </LocalizedLink>
        </div>
      </div>
    </article>
  );
}
