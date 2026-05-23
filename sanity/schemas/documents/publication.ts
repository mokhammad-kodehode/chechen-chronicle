import { defineType, defineField } from "sanity";

const CATEGORIES = [
  { title: "Исследование", value: "research" },
  { title: "Эссе", value: "essay" },
  { title: "Архивная находка", value: "archive" },
  { title: "Интервью", value: "interview" },
  { title: "Память", value: "memory" },
];

export const publication = defineType({
  name: "publication",
  title: "Публикация",
  type: "document",
  groups: [
    { name: "main", title: "Основное", default: true },
    { name: "meta", title: "Автор и даты" },
    { name: "body", title: "Тело" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Заголовок",
      type: "string",
      group: "main",
      validation: (Rule) => Rule.required().max(200),
    }),
    defineField({
      name: "slug",
      title: "URL",
      type: "slug",
      group: "main",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Краткое описание",
      description: "Лид-абзац, показывается в карточках и в начале страницы",
      type: "text",
      rows: 3,
      group: "main",
      validation: (Rule) => Rule.required().max(400),
    }),
    defineField({
      name: "coverImage",
      title: "Обложка",
      type: "image",
      options: { hotspot: true },
      group: "main",
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alt-текст",
          validation: (Rule) => Rule.required(),
        },
      ],
    }),
    defineField({
      name: "category",
      title: "Рубрика",
      type: "string",
      group: "main",
      options: { list: CATEGORIES, layout: "radio" },
      validation: (Rule) => Rule.required(),
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
      title: "Закреплено сверху",
      description: "Показывается крупной карточкой над списком",
      type: "boolean",
      initialValue: false,
      group: "main",
    }),

    defineField({
      name: "author",
      title: "Автор",
      type: "reference",
      to: [{ type: "person" }],
      group: "meta",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Дата публикации",
      type: "datetime",
      group: "meta",
      validation: (Rule) => Rule.required(),
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "readingTimeMinutes",
      title: "Время чтения (мин.)",
      description: "Оценка в минутах. Можно оставить пустым.",
      type: "number",
      group: "meta",
      validation: (Rule) => Rule.min(1).max(120).integer(),
    }),

    defineField({
      name: "body",
      title: "Тело статьи",
      type: "blockContent",
      group: "body",
    }),
  ],
  preview: {
    select: {
      title: "title",
      category: "category",
      publishedAt: "publishedAt",
      media: "coverImage",
    },
    prepare: ({ title, category, publishedAt, media }) => {
      const categoryLabel =
        CATEGORIES.find((c) => c.value === category)?.title ?? category;
      const date = publishedAt
        ? new Date(publishedAt).toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "—";
      return {
        title: title || "(без названия)",
        subtitle: `${categoryLabel} · ${date}`,
        media,
      };
    },
  },
  orderings: [
    {
      title: "По дате публикации (новые)",
      name: "publishedDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
    {
      title: "По дате публикации (старые)",
      name: "publishedAsc",
      by: [{ field: "publishedAt", direction: "asc" }],
    },
  ],
});
