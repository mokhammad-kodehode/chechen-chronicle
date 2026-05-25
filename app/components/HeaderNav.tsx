"use client";

import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { LocalizedLink } from "./common/LocalizedLink";
import { HeaderStoriesDropdown } from "./HeaderStoriesDropdown";
import {
  DEFAULT_LOCALE,
  LOCALES,
  isLocale,
  type Locale,
} from "@/app/lib/i18n/config";
import type { Dictionary } from "@/app/lib/i18n/shared";

// Desktop nav + locale switcher. Client component because we need
// `usePathname` for active-link highlighting and for rewriting the
// locale segment when the user switches language.

type NavItem = { href: string; label: string };

type Props = {
  items: NavItem[];
  dict: Dictionary;
};

export function HeaderNav({ items, dict }: Props) {
  const pathname = usePathname() || "/";

  const currentLocale: Locale = (() => {
    const seg = pathname.split("/").filter(Boolean)[0];
    return seg && isLocale(seg) ? seg : DEFAULT_LOCALE;
  })();

  // Strip the locale prefix so we can compare against the nav `href`
  // values (which are written WITHOUT a locale — e.g. "/istorii").
  const pathNoLocale = (() => {
    const stripped = pathname.replace(/^\/(ru|en|ce)(?=\/|$)/, "");
    return stripped === "" ? "/" : stripped;
  })();

  const isActive = (href: string) => {
    if (href === "/") return pathNoLocale === "/";
    return pathNoLocale === href || pathNoLocale.startsWith(`${href}/`);
  };

  // Build a sibling URL for switching locale without leaving the page.
  function pathFor(target: Locale): string {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length > 0 && isLocale(parts[0]!)) {
      parts[0] = target;
    } else {
      parts.unshift(target);
    }
    return "/" + parts.join("/");
  }

  return (
    <div className="hidden items-center gap-8 md:flex">
      {/* Primary nav */}
      <nav className="flex items-center gap-7 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-900/75">
        {items.map((item) => {
          const active = isActive(item.href);
          // "Истории" gets a mega-menu dropdown with categories & stories.
          if (item.href === "/istorii") {
            return (
              <DropdownNavItem
                key={item.href}
                item={item}
                active={active}
                render={() => <HeaderStoriesDropdown dict={dict} />}
              />
            );
          }
          return (
            <LocalizedLink
              key={item.href}
              href={item.href}
              className={[
                "group/link relative py-2 transition-colors duration-300",
                active
                  ? "text-amber-950"
                  : "hover:text-amber-950",
              ].join(" ")}
            >
              <span>{item.label}</span>
              {/* Magic underline — full when active, scales-in on hover */}
              <span
                aria-hidden
                className={[
                  "pointer-events-none absolute -bottom-0.5 left-0 right-0 h-px origin-center bg-amber-700 transition-transform duration-300",
                  active
                    ? "scale-x-100"
                    : "scale-x-0 group-hover/link:scale-x-100",
                ].join(" ")}
              />
            </LocalizedLink>
          );
        })}
      </nav>

      {/* Vertical hairline */}
      <span aria-hidden className="h-5 w-px bg-amber-900/20" />

      {/* Locale switcher */}
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em]">
        {LOCALES.map((loc, i) => (
          <Fragment key={loc}>
            {i > 0 && (
              <span aria-hidden className="text-amber-900/25">
                ·
              </span>
            )}
            <Link
              href={pathFor(loc)}
              className={[
                "transition-colors duration-300",
                loc === currentLocale
                  ? "text-amber-700"
                  : "text-amber-900/50 hover:text-amber-950",
              ].join(" ")}
              aria-current={loc === currentLocale ? "true" : undefined}
            >
              {loc}
            </Link>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

// Nav item that opens a panel on hover/focus. Used by "Истории" today;
// reusable for any future top-level item that needs a mega-menu.
//
//   • Hover or focus → open (cleared close-timer first)
//   • Mouse leaves item AND panel → close after 180ms (gives the user
//     time to cross the gap between trigger and panel without it
//     snapping shut)
//   • Route change → close immediately
//   • Escape → close
//
function DropdownNavItem({
  item,
  active,
  render,
}: {
  item: NavItem;
  active: boolean;
  render: () => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 180);
  };

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
      onFocus={() => {
        cancelClose();
        setOpen(true);
      }}
      onBlur={scheduleClose}
    >
      <LocalizedLink
        href={item.href}
        aria-expanded={open}
        aria-haspopup="true"
        className={[
          "group/link relative flex items-center gap-1.5 py-2 transition-colors duration-300",
          active || open ? "text-amber-950" : "hover:text-amber-950",
        ].join(" ")}
      >
        <span>{item.label}</span>
        <svg
          width="9"
          height="9"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className={[
            "transition-transform duration-300",
            open ? "rotate-180" : "",
          ].join(" ")}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
        <span
          aria-hidden
          className={[
            "pointer-events-none absolute -bottom-0.5 left-0 right-0 h-px origin-center bg-amber-700 transition-transform duration-300",
            active || open
              ? "scale-x-100"
              : "scale-x-0 group-hover/link:scale-x-100",
          ].join(" ")}
        />
      </LocalizedLink>

      {/* Dropdown panel — `pt-3` creates a hover bridge between the
          trigger and the panel so the cursor can travel without losing
          focus. */}
      <div
        className={[
          "absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3 transition-all duration-200 ease-out",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-1 opacity-0",
        ].join(" ")}
      >
        {render()}
      </div>
    </div>
  );
}
