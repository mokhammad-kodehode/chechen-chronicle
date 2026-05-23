import { CATEGORY_BADGE, PublicationCategory } from "@/app/lib/publications";
import type { Dictionary } from "@/app/lib/i18n/shared";

type Props = {
  category: PublicationCategory;
  size?: "sm" | "md";
  dict: Dictionary["publications"]["categories"];
};

export function PublicationCategoryBadge({ category, size = "sm", dict }: Props) {
  const sizing =
    size === "sm" ? "px-2.5 py-0.5 text-[10px]" : "px-3 py-1 text-[11px]";
  return (
    <span
      className={[
        "inline-flex items-center rounded font-semibold tracking-widest uppercase",
        CATEGORY_BADGE[category],
        sizing,
      ].join(" ")}
    >
      {dict[category]}
    </span>
  );
}
