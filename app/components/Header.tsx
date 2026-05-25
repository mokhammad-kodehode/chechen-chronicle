import { LocalizedLink } from "./common/LocalizedLink";
import { HeaderMobileMenu } from "./HeaderMobileMenu";
import { HeaderNav } from "./HeaderNav";
import type { Dictionary } from "@/app/lib/i18n/shared";

type Props = {
  dict: Dictionary;
};

// Dark frosted editorial navbar — adapts to both bright and dark
// hero sections via backdrop-blur. Server component shell; the
// interactive bits (active-link highlighting, locale switcher,
// mobile sheet) live in client subcomponents.

export function Header({ dict }: Props) {
  const nav = [
    { href: "/", label: dict.nav.home },
    { href: "/istorii", label: dict.nav.stories },
    { href: "/publications", label: dict.nav.publications },
    { href: "/archive", label: dict.nav.archive },
  ];

  return (
    <header className="relative z-40 bg-amber-50/85 font-nav text-amber-950 backdrop-blur-xl backdrop-saturate-150">
      {/* Hairline bottom border — soft amber, gradient so it doesn't
          look like a hard rule. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-900/25 to-transparent"
      />

      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 md:px-6">
        {/* Brand mark + stacked wordmark */}
        <LocalizedLink
          href="/"
          className="group/brand flex items-center gap-3 transition-opacity duration-300 hover:opacity-90"
        >
          {/* Serif monogram — wax-seal / library bookplate vibe */}
          <span
            aria-hidden
            className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-md border border-amber-900/25 bg-gradient-to-br from-amber-100/70 to-amber-200/40"
          >
            <span className="font-display text-[18px] font-semibold leading-none text-amber-900">
              Х
            </span>
            {/* Faint inner amber glow that warms on hover */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(180,83,9,0.18),transparent_70%)] opacity-60 transition-opacity duration-500 group-hover/brand:opacity-100"
            />
          </span>

          <span className="hidden flex-col leading-tight sm:flex">
            <span className="font-display text-sm font-semibold tracking-tight text-amber-950">
              {dict.site.title}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-900/65">
              {dict.site.subtitle}
            </span>
          </span>
        </LocalizedLink>

        {/* Desktop nav + locale switcher */}
        <HeaderNav items={nav} dict={dict} />

        {/* Mobile burger + slide-in sheet */}
        <HeaderMobileMenu items={nav} />
      </div>
    </header>
  );
}
