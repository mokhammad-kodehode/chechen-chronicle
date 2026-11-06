import { LocalizedLink } from "@/app/components/common/LocalizedLink";
import { FamilyStoryCard } from "@/app/components/family/FamilyStoryCard";
import type { FamilyStory } from "@/app/lib/familyArchive";
import type { Dictionary } from "@/app/lib/i18n/shared";

// Home → «Народный архив». The invitation is the point of this block:
// it stays even when the archive is still empty, so the very first
// readers see that the museum wants their families' stories.

type Props = {
  stories: FamilyStory[];
  dict: Dictionary["home"]["museum"]["family"];
  familyDict: Dictionary["family"];
};

export function HomeFamilyArchive({ stories, dict, familyDict }: Props) {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="flex flex-col">
          <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-amber-800/70">
            {dict.kicker}
          </p>
          <h2 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-amber-950 md:text-5xl">
            {dict.title}
          </h2>
          <p className="mt-6 text-[15px] leading-[1.75] text-amber-900/75 md:text-base">
            {dict.description}
          </p>
          <div className="mt-8 flex flex-col items-start gap-5">
            <LocalizedLink
              href="/family-archive/submit"
              className="inline-flex h-12 items-center justify-center gap-3 rounded-sm bg-amber-900 px-7 text-[11px] font-semibold uppercase tracking-[0.28em] text-white transition hover:bg-amber-800"
            >
              {dict.cta}
              <span aria-hidden>→</span>
            </LocalizedLink>
            <LocalizedLink
              href="/family-archive"
              className="group/all inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-900 hover:text-amber-950"
            >
              <span>{dict.linkAll}</span>
              <span
                aria-hidden
                className="transition-transform duration-300 group-hover/all:translate-x-1"
              >
                →
              </span>
            </LocalizedLink>
          </div>
        </div>

        {stories.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {stories.slice(0, 2).map((s) => (
              <FamilyStoryCard key={s.id} story={s} dict={familyDict} />
            ))}
          </div>
        ) : (
          <EmptyShowcase note={dict.emptyNote} steps={familyDict.how} />
        )}
      </div>
    </section>
  );
}

// Before the first story is published: a quiet "album page" that shows
// how the archive works instead of an empty grid.
function EmptyShowcase({
  note,
  steps,
}: {
  note: string;
  steps: Dictionary["family"]["how"];
}) {
  return (
    <div className="relative flex flex-col justify-center overflow-hidden border border-amber-900/15 bg-[#F4EFE3] p-8 md:p-12">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-4 -top-10 font-display text-[200px] leading-none text-amber-900/[0.07]"
      >
        “
      </span>
      <ol className="relative space-y-6">
        {steps.steps.map((step, idx) => (
          <li key={step.title} className="flex gap-5">
            <span
              aria-hidden
              className="font-display text-3xl font-semibold leading-none text-amber-800/40"
            >
              {idx + 1}
            </span>
            <div>
              <h3 className="font-display text-xl font-semibold tracking-tight text-amber-950">
                {step.title}
              </h3>
              <p className="mt-1.5 text-sm leading-[1.6] text-amber-900/70">
                {step.text}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <p className="relative mt-8 border-t border-amber-900/15 pt-5 font-display text-[15px] italic text-amber-900/70">
        {note}
      </p>
    </div>
  );
}
