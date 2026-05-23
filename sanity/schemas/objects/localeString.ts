import { defineType, defineField } from "sanity";

/**
 * Объект для строки на нескольких языках.
 * Используется в полях типа title, label и других коротких строках.
 */
export const localeString = defineType({
  name: "localeString",
  title: "Строка (мультиязычная)",
  type: "object",
  fields: [
    defineField({ name: "ru", title: "Русский", type: "string" }),
    defineField({ name: "en", title: "English", type: "string" }),
    defineField({ name: "ce", title: "Нохчий", type: "string" }),
  ],
});
