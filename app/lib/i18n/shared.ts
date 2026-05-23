// Shared между server и client. НЕ добавляй сюда `server-only` —
// этот файл импортируется в том числе из client-компонентов.

import type ru from "./dictionaries/ru.json";

export type Dictionary = typeof ru;

/** Подстановка плейсхолдеров вида {n} в строке. */
export function format(
  template: string,
  vars: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    vars[key] === undefined ? `{${key}}` : String(vars[key])
  );
}
