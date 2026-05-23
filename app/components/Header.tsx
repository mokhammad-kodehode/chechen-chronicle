import { LocalizedLink } from "./common/LocalizedLink";
import { HeaderMobileMenu } from "./HeaderMobileMenu";
import type { Dictionary } from "@/app/lib/i18n/shared";

type Props = {
  dict: Dictionary;
};

export function Header({ dict }: Props) {
  const nav = [
    { href: "/", label: dict.nav.home },
    { href: "/publications", label: dict.nav.publications },
    { href: "/archive", label: dict.nav.archive },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-amber-900/10 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <LocalizedLink href="/" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-md border text-sm font-semibold">
            📜
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold">{dict.site.title}</span>
            <span className="block text-xs text-neutral-600">
              {dict.site.subtitle}
            </span>
          </span>
        </LocalizedLink>

        <nav className="hidden items-center gap-6 text-sm text-neutral-700 md:flex">
          {nav.map((i) => (
            <LocalizedLink
              key={i.href}
              href={i.href}
              className="transition-colors hover:text-amber-900"
            >
              {i.label}
            </LocalizedLink>
          ))}
        </nav>

        <HeaderMobileMenu items={nav} />
      </div>
    </header>
  );
}
