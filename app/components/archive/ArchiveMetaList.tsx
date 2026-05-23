import type { ArchiveItem } from "@/app/lib/archive";
import { formatFileSize } from "@/app/lib/archive";
import type { Dictionary } from "@/app/lib/i18n/shared";

type Props = {
  item: ArchiveItem;
  dict: Dictionary["archive"];
};

export function ArchiveMetaList({ item, dict }: Props) {
  const rows: Array<{ label: string; value: string }> = [];

  rows.push({ label: dict.detail.fields.kind, value: dict.kinds[item.kind] });
  rows.push({ label: dict.detail.fields.date, value: item.date });

  if (item.place) {
    rows.push({ label: dict.detail.fields.place, value: item.place });
  }
  if (item.source) {
    rows.push({ label: dict.detail.fields.source, value: item.source });
  }
  if (item.sourceCode) {
    rows.push({ label: dict.detail.fields.sourceCode, value: item.sourceCode });
  }
  if (item.originalLanguage) {
    rows.push({
      label: dict.detail.fields.language,
      value: dict.languages[item.originalLanguage],
    });
  }
  if (item.fileSize) {
    rows.push({
      label: dict.detail.fields.fileSize,
      value: formatFileSize(item.fileSize),
    });
  }

  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
      {rows.map((row) => (
        <div key={row.label} className="contents">
          <dt className="text-xs uppercase tracking-widest text-neutral-500">
            {row.label}
          </dt>
          <dd className="text-amber-950">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
