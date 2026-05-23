import { defineType, defineField } from "sanity";

/**
 * Объект для многострочного текста на нескольких языках.
 * Используется для description, excerpt и других абзацных полей.
 */
export const localeText = defineType({
  name: "localeText",
  title: "Текст (мультиязычный)",
  type: "object",
  fields: [
    defineField({ name: "ru", title: "Русский", type: "text", rows: 4 }),
    defineField({ name: "en", title: "English", type: "text", rows: 4 }),
    defineField({ name: "ce", title: "Нохчий", type: "text", rows: 4 }),
  ],
});
