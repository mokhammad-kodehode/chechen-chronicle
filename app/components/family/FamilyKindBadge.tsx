import {
  FAMILY_KIND_BADGE,
  type FamilyStoryKind,
} from "@/app/lib/familyArchiveShared";
import type { Dictionary } from "@/app/lib/i18n/shared";

type Props = {
  kind: FamilyStoryKind;
  size?: "sm" | "md";
  dict: Dictionary["family"]["kinds"];
};

export function FamilyKindBadge({ kind, size = "sm", dict }: Props) {
  const sizing =
    size === "sm" ? "px-2.5 py-0.5 text-[10px]" : "px-3 py-1 text-[11px]";
  return (
    <span
      className={[
        "inline-flex items-center rounded font-semibold uppercase tracking-widest",
        FAMILY_KIND_BADGE[kind],
        sizing,
      ].join(" ")}
    >
      {dict[kind]}
    </span>
  );
}
