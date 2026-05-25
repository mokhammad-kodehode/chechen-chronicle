"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LocalizedLink } from "./common/LocalizedLink";
import {
  DEFAULT_LOCALE,
  LOCALES,
  isLocale,
  type Locale,
} from "@/app/lib/i18n/config";

type NavItem = { href: string; label: string };

type Props = {
  items: NavItem[];
};

export function HeaderMobileMenu({ items }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() || "/";

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent body scroll while sheet is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const currentLocale: Locale = (() => {
    const seg = pathname.split("/").filter(Boolean)[0];
    return seg && isLocale(seg) ? seg : DEFAULT_LOCALE;
  })();

  const pathNoLocale = (() => {
    const stripped = pathname.replace(/^\/(ru|en|ce)(?=\/|$)/, "");
    return stripped === "" ? "/" : stripped;
  })();

  const isActive = (href: string) => {
    if (href === "/") return pathNoLocale === "/";
    return pathNoLocale === href || pathNoLocale.startsWith(`${href}/`);
  };

  function pathForLocale(target: Locale): string {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length > 0 && isLocale(parts[0]!)) {
      parts[0] = target;
    } else {
      parts.unshift(target);
    }
    return "/" + parts.join("/");
  }

  return (
    <>
      {/* Burger button — visible only on mobile */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Закрыть меню" : "Открыть меню"}
        aria-expanded={open}
        className="relative grid h-10 w-10 place-items-center rounded-md border border-amber-900/25 bg-amber-100/40 text-amber-950 transition hover:border-amber-900/45 hover:bg-amber-100/70 md:hidden"
      >
        <span className="sr-only">{open ? "Закрыть меню" : "Открыть меню"}</span>
        <span
          className={[
            "absolute left-1/2 top-1/2 block h-[2px] w-5 -translate-x-1/2 rounded-full bg-amber-950 transition duration-300",
            open ? "rotate-45" : "-translate-y-[5px]",
          ].join(" ")}
        />
        <span
          className={[
            "absolute left-1/2 top-1/2 block h-[2px] w-5 -translate-x-1/2 rounded-full bg-amber-950 transition duration-300",
            open ? "opacity-0" : "opacity-100",
          ].join(" ")}
        />
        <span
          className={[
            "absolute left-1/2 top-1/2 block h-[2px] w-5 -translate-x-1/2 rounded-full bg-amber-950 transition duration-300",
            open ? "-rotate-45" : "translate-y-[5px]",
          ].join(" ")}
        />
      </button>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden
        className={[
          "fixed inset-0 z-40 bg-[#0c0805]/70 backdrop-blur-md transition-opacity duration-300 md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
      />

      {/* Slide-in panel — dark editorial theme */}
      <div
        className={[
          "fixed right-0 top-0 z-50 flex h-[100svh] w-[85vw] max-w-sm flex-col bg-[#0c0805] text-amber-50 shadow-2xl transition-transform duration-300 md:hidden",
          open ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
        aria-hidden={!open}
      >
        {/* Soft ornamental backdrop, same vocabulary as the page hero */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 10%, #f3ead4 0%, transparent 45%), radial-gradient(circle at 20% 90%, #b08866 0%, transparent 40%)",
          }}
        />

        <div className="relative flex h-16 items-center justify-between px-5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-amber-300/80">
            Меню
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Закрыть меню"
            className="grid h-10 w-10 place-items-center rounded-md border border-amber-200/25 text-amber-100 transition hover:border-amber-200/45 hover:bg-amber-950/50"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6l-12 12" />
            </svg>
          </button>
        </div>

        <nav className="relative mt-4 flex flex-col px-5">
          {items.map((item, idx) => {
            const active = isActive(item.href);
            return (
              <LocalizedLink
                key={item.href}
                href={item.href}
                className={[
                  "group flex items-center justify-between border-b border-amber-100/10 py-5 font-display text-2xl font-semibold transition",
                  active
                    ? "text-amber-100"
                    : "text-amber-50/85 hover:text-amber-100",
                ].join(" ")}
                style={{
                  animation: open
                    ? `ccd-rise 0.4s cubic-bezier(0.22, 1, 0.36, 1) both`
                    : undefined,
                  animationDelay: open ? `${120 + idx * 60}ms` : undefined,
                }}
              >
                <span className="flex items-center gap-3">
                  {active && (
                    <span
                      aria-hidden
                      className="h-1.5 w-1.5 rounded-full bg-amber-300"
                    />
                  )}
                  {item.label}
                </span>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-amber-100/40 transition group-hover:translate-x-0.5 group-hover:text-amber-100"
                >
                  <path d="M5 12h14" />
                  <path d="M13 5l7 7-7 7" />
                </svg>
              </LocalizedLink>
            );
          })}
        </nav>

        {/* Locale switcher pinned to the bottom of the sheet */}
        <div className="relative mt-auto border-t border-amber-100/10 px-5 py-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-amber-100/45">
            Язык
          </p>
          <div className="mt-3 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.25em]">
            {LOCALES.map((loc, i) => (
              <Fragment key={loc}>
                {i > 0 && (
                  <span aria-hidden className="text-amber-100/20">
                    ·
                  </span>
                )}
                <Link
                  href={pathForLocale(loc)}
                  className={[
                    "transition-colors",
                    loc === currentLocale
                      ? "text-amber-200"
                      : "text-amber-100/55 hover:text-amber-100",
                  ].join(" ")}
                  aria-current={loc === currentLocale ? "true" : undefined}
                >
                  {loc}
                </Link>
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
