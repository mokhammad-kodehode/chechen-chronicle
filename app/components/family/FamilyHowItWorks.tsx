import type { Dictionary } from "@/app/lib/i18n/shared";

type Props = {
  dict: Dictionary["family"]["how"];
};

// Three numbered steps: tell → editors review → into the museum.
// Sets expectations up front: nothing is published without review.
export function FamilyHowItWorks({ dict }: Props) {
  return (
    <div>
      <p className="text-center text-[11px] font-semibold uppercase tracking-[0.38em] text-amber-800/70">
        {dict.heading}
      </p>
      <ol className="mt-8 grid gap-px overflow-hidden border border-amber-900/15 bg-amber-900/15 md:grid-cols-3">
        {dict.steps.map((step, idx) => (
          <li key={step.title} className="flex gap-5 bg-white p-6 md:p-8">
            <span
              aria-hidden
              className="font-display text-4xl font-semibold leading-none text-amber-800/40"
            >
              {idx + 1}
            </span>
            <div>
              <h3 className="font-display text-xl font-semibold tracking-tight text-amber-950">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-[1.6] text-amber-900/70">
                {step.text}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
