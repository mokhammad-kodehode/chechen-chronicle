import { defineType, defineField } from "sanity";

/**
 * Архивная запись — единица в архиве первоисточников.
 * Документ, фото, рукопись, карта или аудиозапись.
 */
export const archiveItem = defineType({
  name: "archiveItem",
  title: "Архивная запись",
  type: "document",
  groups: [
    { name: "main", title: "Основное", default: true },
    { name: "metadata", title: "Метаданные" },
    { name: "files", title: "Файлы" },
    { name: "links", title: "Связи" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Название",
      type: "localeString",
      group: "main",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "URL",
      type: "slug",
      group: "main",
      options: { source: "title.ru", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "kind",
      title: "Тип материала",
      type: "string",
      group: "main",
      options: {
        list: [
          { title: "Документ", value: "document" },
          { title: "Фотография", value: "photo" },
          { title: "Рукопись", value: "manuscript" },
          { title: "Карта", value: "map" },
          { title: "Аудиозапись", value: "audio" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Описание",
      type: "localeText",
      group: "main",
    }),
    defineField({
      name: "tags",
      title: "Теги",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      group: "main",
    }),
    defineField({
      name: "featured",
      title: "Закреплено в подборке",
      type: "boolean",
      initialValue: false,
      group: "main",
    }),

    // Files
    defineField({
      name: "image",
      title: "Изображение / превью",
      description:
        "Для фото — само фото. Для документа или рукописи — скан первой страницы.",
      type: "image",
      options: { hotspot: true },
      group: "files",
    }),
    defineField({
      name: "file",
      title: "Файл оригинала",
      description: "PDF, DOC, MP3 — для документов и аудио.",
      type: "file",
      group: "files",
    }),

    // Metadata
    defineField({
      name: "date",
      title: "Дата (как написано на документе)",
      description: 'Например: "1911", "около 1850", "вторая половина XIX в."',
      type: "string",
      group: "metadata",
    }),
    defineField({
      name: "dateSortable",
      title: "Год для сортировки",
      description: "Числовой год — нужен для фильтров и сортировки",
      type: "number",
      group: "metadata",
      validation: (Rule) => Rule.required().min(0).max(2100),
    }),
    defineField({
      name: "place",
      title: "Место",
      type: "reference",
      to: [{ type: "place" }],
      group: "metadata",
    }),
    defineField({
      name: "source",
      title: "Источник",
      description: "Архив, фонд, частная коллекция",
      type: "string",
      group: "metadata",
    }),
    defineField({
      name: "sourceCode",
      title: "Шифр в архиве",
      description: "Например: ЦГИА Грузии, Ф. 422, оп. 3, д. 17",
      type: "string",
      group: "metadata",
    }),
    defineField({
      name: "originalLanguage",
      title: "Язык первоисточника",
      type: "string",
      group: "metadata",
      options: {
        list: [
          { title: "Русский", value: "ru" },
          { title: "Арабский", value: "ar" },
          { title: "Грузинский", value: "ka" },
          { title: "Чеченский", value: "ce" },
          { title: "Турецкий", value: "tr" },
          { title: "Другой", value: "other" },
        ],
      },
    }),

    // Links
    defineField({
      name: "relatedPublications",
      title: "Связанные публикации",
      type: "array",
      group: "links",
      of: [{ type: "reference", to: [{ type: "publication" }] }],
    }),
  ],
  preview: {
    select: {
      title: "title.ru",
      kind: "kind",
      date: "date",
      media: "image",
    },
    prepare({ title, kind, date, media }) {
      const kindLabels: Record<string, string> = {
        document: "Документ",
        photo: "Фото",
        manuscript: "Рукопись",
        map: "Карта",
        audio: "Аудио",
      };
      return {
        title: title || "(без названия)",
        subtitle: `${kindLabels[kind] || kind} · ${date || "—"}`,
        media,
      };
    },
  },
  orderings: [
    {
      title: "По дате документа (новые)",
      name: "dateDesc",
      by: [{ field: "dateSortable", direction: "desc" }],
    },
    {
      title: "По дате документа (старые)",
      name: "dateAsc",
      by: [{ field: "dateSortable", direction: "asc" }],
    },
    {
      title: "Недавно добавленные",
      name: "addedDesc",
      by: [{ field: "_createdAt", direction: "desc" }],
    },
  ],
});
