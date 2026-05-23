"use client";

import Link, { type LinkProps } from "next/link";
import { useParams } from "next/navigation";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { DEFAULT_LOCALE, isLocale } from "@/app/lib/i18n/config";

type Props = Omit<ComponentPropsWithoutRef<"a">, "href"> &
  Omit<LinkProps, "href"> & {
    href: string;
    children?: ReactNode;
  };

/**
 * <Link>-обёртка, которая автоматически добавляет текущий язык в URL.
 * Например: <LocalizedLink href="/publications" /> на /en/about → href="/en/publications".
 *
 * Внешние URL (http://...) и якоря (#...) не трогаются.
 */
export function LocalizedLink({ href, ...props }: Props) {
  const params = useParams();
  const langParam = typeof params.lang === "string" ? params.lang : null;
  const lang = langParam && isLocale(langParam) ? langParam : DEFAULT_LOCALE;

  const isInternal =
    typeof href === "string" && href.startsWith("/") && !href.startsWith("//");

  const localized = isInternal
    ? href === "/"
      ? `/${lang}`
      : `/${lang}${href}`
    : href;

  return <Link href={localized} {...props} />;
}
