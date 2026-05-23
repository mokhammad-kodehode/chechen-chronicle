"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LocalizedLink } from "./common/LocalizedLink";

type NavItem = { href: string; label: string };

type Props = {
  items: NavItem[];
};

export function HeaderMobileMenu({ items }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent body scroll when open
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

  return (
    <>
      {/* Burger button — visible only on mobile */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Закрыть меню" : "Открыть меню"}
        aria-expanded={open}
        className="relative grid h-10 w-10 place-items-center rounded-md border border-amber-900/20 bg-white/70 text-amber-950 transition hover:border-amber-900/40 hover:bg-white md:hidden"
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
          "fixed inset-0 z-40 bg-amber-950/40 backdrop-blur-sm transition-opacity duration-300 md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
      />

      {/* Slide-in panel */}
      <div
        className={[
          "fixed right-0 top-0 z-50 h-[100svh] w-[80vw] max-w-sm bg-[#FBF7F0] shadow-2xl transition-transform duration-300 md:hidden",
          open ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
        aria-hidden={!open}
      >
        <div className="flex h-16 items-center justify-end px-4">
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Закрыть меню"
            className="grid h-10 w-10 place-items-center rounded-md border border-amber-900/20 text-amber-950 hover:border-amber-900/40 hover:bg-white"
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

        <nav className="mt-6 flex flex-col gap-1 px-6">
          {items.map((item, idx) => (
            <LocalizedLink
              key={item.href}
              href={item.href}
              className="group flex items-center justify-between border-b border-amber-900/10 py-4 text-lg font-semibold text-amber-950 transition hover:text-amber-900"
              style={{
                animation: open
                  ? `ccd-rise 0.4s cubic-bezier(0.22, 1, 0.36, 1) both`
                  : undefined,
                animationDelay: open ? `${100 + idx * 50}ms` : undefined,
              }}
            >
              <span>{item.label}</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-amber-900/40 transition group-hover:translate-x-0.5 group-hover:text-amber-900"
              >
                <path d="M5 12h14" />
                <path d="M13 5l7 7-7 7" />
              </svg>
            </LocalizedLink>
          ))}
        </nav>
      </div>
    </>
  );
}
