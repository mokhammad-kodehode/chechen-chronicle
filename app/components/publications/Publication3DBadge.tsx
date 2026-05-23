import { LocalizedLink } from "@/app/components/common/LocalizedLink";

type Props = {
  slug: string;
  /** Visual size — small for card overlays, medium for featured cards. */
  size?: "sm" | "md";
};

/**
 * Pill-badge "3D" that sits over a publication card image.
 * Click navigates straight to the /3d viewer, bypassing the article page.
 * Designed to be positioned absolutely by the parent.
 */
export function Publication3DBadge({ slug, size = "sm" }: Props) {
  const sizing =
    size === "md"
      ? "h-9 gap-1.5 px-3 text-xs"
      : "h-7 gap-1 px-2.5 text-[11px]";

  return (
    <LocalizedLink
      href={`/publications/${slug}/3d`}
      aria-label="Открыть в 3D"
      className={[
        "z-10 inline-flex items-center rounded-full border border-amber-100/30 bg-amber-950/85 font-semibold uppercase tracking-widest text-amber-50 shadow-md backdrop-blur transition hover:border-amber-100/60 hover:bg-amber-950",
        sizing,
      ].join(" ")}
    >
      <svg
        width={size === "md" ? 14 : 12}
        height={size === "md" ? 14 : 12}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <path d="M3.27 6.96 12 12.01l8.73-5.05" />
        <path d="M12 22.08V12" />
      </svg>
      3D
    </LocalizedLink>
  );
}
