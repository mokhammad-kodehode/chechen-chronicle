import { defineType, defineField } from "sanity";

// Народный архив — семейная история, присланная читателем.
//
// Документ создаётся формой на сайте (/family-archive/submit) как
// ЧЕРНОВИК (`drafts.<id>`): на сайте он не виден, пока редактор не
// проверит текст и не нажмёт «Publish». Контакты отправителя здесь НЕ
// хранятся — они лежат в отдельном документе `familySubmissionContact`,
// который никогда не публикуется. Поэтому всё, что есть в этой схеме,
// можно безопасно показывать на сайте.

export const FAMILY_STORY_KINDS = [
  { title: "Воспоминание", value: "memory" },
  { title: "Предание", value: "legend" },
  { title: "Фотография", value: "photo" },
  { title: "Письмо / документ", value: "document" },
  { title: "Другое", value: "other" },
];

export const familyStory = defineType({
  name: "familyStory",
  title: "Семейная история",
  type: "document",
  groups: [
    { name: "main", title: "История", default: true },
    { name: "meta", title: "Место и время" },
    { name: "media", title: "Фото" },
    { name: "editorial", title: "Редакция" },
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
      name: "kind",
      title: "Тип материала",
      type: "string",
      group: "main",
      options: { list: FAMILY_STORY_KINDS, layout: "radio" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "story",
      title: "Текст истории",
      description:
        "Абзацы разделяются пустой строкой. Перед публикацией проверьте текст: уберите личные данные третьих лиц, если они не должны быть публичными.",
      type: "text",
      rows: 16,
      group: "main",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "storytellerName",
      title: "Подпись на сайте",
      description:
        "Как подписать историю, например: «Рассказала Зарема, внучка». Если пусто или включена анонимность — подпись не показывается.",
      type: "string",
      group: "main",
    }),
    defineField({
      name: "anonymous",
      title: "Опубликовать анонимно",
      type: "boolean",
      initialValue: false,
      group: "main",
    }),

    defineField({
      name: "era",
      title: "Время (как рассказано)",
      description: 'Например: "1944", "1940-е", "конец XIX века"',
      type: "string",
      group: "meta",
    }),
    defineField({
      name: "yearSortable",
      title: "Год для сортировки",
      description: "Необязательно. Числовой год, к которому относится история.",
      type: "number",
      group: "meta",
      validation: (Rule) => Rule.min(0).max(2100).integer(),
    }),
    defineField({
      name: "place",
      title: "Село / район",
      type: "string",
      group: "meta",
    }),
    defineField({
      name: "teip",
      title: "Тейп",
      type: "string",
      group: "meta",
    }),

    defineField({
      name: "images",
      title: "Фотографии",
      type: "array",
      group: "media",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            {
              name: "caption",
              title: "Подпись",
              type: "string",
            },
          ],
        },
      ],
      validation: (Rule) => Rule.max(12),
    }),

    defineField({
      name: "editorNote",
      title: "Комментарий редакции",
      description:
        "Показывается на сайте под историей: исторический контекст, пояснения, ссылки на архив.",
      type: "text",
      rows: 4,
      group: "editorial",
    }),
    defineField({
      name: "submittedAt",
      title: "Дата получения",
      type: "datetime",
      group: "editorial",
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      title: "title",
      kind: "kind",
      place: "place",
      era: "era",
      media: "images.0",
    },
    prepare({ title, kind, place, era, media }) {
      const kindLabel =
        FAMILY_STORY_KINDS.find((k) => k.value === kind)?.title ?? kind;
      return {
        title: title || "(без названия)",
        subtitle: [kindLabel, place, era].filter(Boolean).join(" · "),
        media,
      };
    },
  },
  orderings: [
    {
      title: "Недавно присланные",
      name: "submittedDesc",
      by: [{ field: "submittedAt", direction: "desc" }],
    },
  ],
});
