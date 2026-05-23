import Image from "next/image";
import { formatPublicationDate, PublicationAuthor } from "@/app/lib/publications";
import { format, type Dictionary } from "@/app/lib/i18n/shared";
import type { Locale } from "@/app/lib/i18n/config";

type Props = {
  author: PublicationAuthor;
  publishedAt: string;
  readingTimeMinutes: number;
  variant?: "light" | "dark";
  lang: Locale;
  dict: Dictionary["publications"];
};

export function PublicationMeta({
  author,
  publishedAt,
  readingTimeMinutes,
  variant = "dark",
  lang,
  dict,
}: Props) {
  const text = variant === "light" ? "text-white/85" : "text-neutral-600";
  const dot = variant === "light" ? "bg-white/40" : "bg-neutral-400";
  const ringColor =
    variant === "light" ? "ring-white/40" : "ring-amber-900/20";

  return (
    <div
      className={[
        "flex flex-wrap items-center gap-x-3 gap-y-1 text-xs",
        text,
      ].join(" ")}
    >
      <span className="flex items-center gap-2">
        {author.avatarUrl ? (
          <Image
            src={author.avatarUrl}
            alt={author.name}
            width={24}
            height={24}
            className={[
              "h-6 w-6 shrink-0 rounded-full object-cover ring-1",
              ringColor,
            ].join(" ")}
          />
        ) : null}
        <span className="font-medium">{author.name}</span>
      </span>
      <span className={["h-1 w-1 rounded-full", dot].join(" ")} />
      <time dateTime={publishedAt}>
        {formatPublicationDate(publishedAt, lang)}
      </time>
      <span className={["h-1 w-1 rounded-full", dot].join(" ")} />
      <span>{format(dict.minutesShort, { n: readingTimeMinutes })}</span>
    </div>
  );
}
