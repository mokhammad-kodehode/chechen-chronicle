import "server-only";
import type { Locale } from "./config";
import type { Dictionary } from "./shared";
import ru from "./dictionaries/ru.json";

const loaders: Record<Locale, () => Promise<Dictionary>> = {
  ru: () => Promise.resolve(ru),
  en: () =>
    import("./dictionaries/en.json").then((m) => m.default as Dictionary),
  ce: () =>
    import("./dictionaries/ce.json").then((m) => m.default as Dictionary),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const load = loaders[locale] ?? loaders.ru;
  return load();
}

// Re-export для удобства server-кода. Client-код должен импортировать
// эти же символы из ./shared, чтобы не тащить `server-only` в бандл.
export type { Dictionary } from "./shared";
export { format } from "./shared";
