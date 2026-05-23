export const LOCALES = ["ru", "en", "ce"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ru";

export const LOCALE_LABELS: Record<Locale, string> = {
  ru: "Русский",
  en: "English",
  ce: "Нохчий",
};

/** Соответствие локалям для toLocaleDateString и др. */
export const LOCALE_BCP47: Record<Locale, string> = {
  ru: "ru-RU",
  en: "en-US",
  ce: "ru-RU", // нет отдельного BCP-47 для нохчий, используем русский для дат
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
