import type { Dictionary } from "@/app/lib/i18n/shared";

type Props = {
  dict: Dictionary;
};

export function Footer({ dict }: Props) {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-neutral-600">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {dict.site.title}
          </p>
          <p className="text-neutral-500">{dict.site.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
