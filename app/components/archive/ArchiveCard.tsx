import Image from "next/image";
import { LocalizedLink } from "@/app/components/common/LocalizedLink";
import type { ArchiveItem } from "@/app/lib/archive";
import type { Dictionary } from "@/app/lib/i18n/shared";
import { ArchiveKindBadge } from "./ArchiveKindBadge";

type Props = {
  item: ArchiveItem;
  dict: Dictionary["archive"];
};

export function ArchiveCard({ item, dict }: Props) {
  const href = `/archive/${item.slug}`;
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-amber-900/15 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-amber-900/40 hover:shadow-md">
      <LocalizedLink href={href} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-amber-50">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition duration-700 group-hover:scale-[1.04]"
            />
          ) : (
            <KindPlaceholder kind={item.kind} />
          )}

          <div className="absolute left-3 top-3">
            <ArchiveKindBadge kind={item.kind} dict={dict.kinds} />
          </div>

          <div className="absolute right-3 top-3 rounded bg-black/55 px-2 py-1 text-[10px] font-semibold tracking-widest text-white backdrop-blur">
            {item.date}
          </div>
        </div>
      </LocalizedLink>

      <div className="flex flex-1 flex-col px-4 py-4">
        <LocalizedLink href={href}>
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug tracking-tight text-amber-950 transition group-hover:text-amber-900 md:text-base">
            {item.title}
          </h3>
        </LocalizedLink>

        {item.place ? (
          <p className="mt-2 truncate text-xs text-neutral-500">{item.place}</p>
        ) : null}
      </div>
    </article>
  );
}

function KindPlaceholder({ kind }: { kind: ArchiveItem["kind"] }) {
  const styles: Record<ArchiveItem["kind"], string> = {
    document: "from-amber-100 via-amber-50 to-stone-50",
    photo: "from-stone-200 via-stone-100 to-stone-50",
    manuscript: "from-rose-100 via-rose-50 to-amber-50",
    map: "from-emerald-100 via-emerald-50 to-stone-50",
    audio: "from-indigo-100 via-indigo-50 to-stone-50",
  };
  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${styles[kind]}`}
    >
      <KindIcon kind={kind} />
    </div>
  );
}

function KindIcon({ kind }: { kind: ArchiveItem["kind"] }) {
  const common = "h-12 w-12 text-amber-900/30";
  switch (kind) {
    case "document":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common} stroke="currentColor" strokeWidth="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
        </svg>
      );
    case "photo":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common} stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      );
    case "manuscript":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common} stroke="currentColor" strokeWidth="1.5">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5z" />
          <path d="M4 4.5v15A2.5 2.5 0 0 0 6.5 22H20" />
        </svg>
      );
    case "map":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common} stroke="currentColor" strokeWidth="1.5">
          <path d="M9 3 3 6v15l6-3 6 3 6-3V3l-6 3z" />
          <path d="M9 3v15M15 6v15" />
        </svg>
      );
    case "audio":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common} stroke="currentColor" strokeWidth="1.5">
          <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
          <path d="M21 19a2 2 0 0 1-2 2h-1v-6h3zM3 19a2 2 0 0 0 2 2h1v-6H3z" />
        </svg>
      );
  }
}
