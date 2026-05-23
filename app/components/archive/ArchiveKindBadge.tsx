import { ARCHIVE_KIND_BADGE, ArchiveKind } from "@/app/lib/archive";
import type { Dictionary } from "@/app/lib/i18n/shared";

type Props = {
  kind: ArchiveKind;
  size?: "sm" | "md";
  dict: Dictionary["archive"]["kinds"];
};

export function ArchiveKindBadge({ kind, size = "sm", dict }: Props) {
  const sizing =
    size === "sm" ? "px-2.5 py-0.5 text-[10px]" : "px-3 py-1 text-[11px]";
  return (
    <span
      className={[
        "inline-flex items-center rounded font-semibold tracking-widest uppercase",
        ARCHIVE_KIND_BADGE[kind],
        sizing,
      ].join(" ")}
    >
      {dict[kind]}
    </span>
  );
}
