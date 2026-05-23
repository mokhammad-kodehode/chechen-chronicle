import { defineType, defineArrayMember } from "sanity";

export const blockContent = defineType({
  name: "blockContent",
  title: "Тело статьи",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Абзац", value: "normal" },
        { title: "Заголовок H2", value: "h2" },
        { title: "Заголовок H3", value: "h3" },
      ],
      lists: [
        { title: "Маркированный", value: "bullet" },
        { title: "Нумерованный", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Жирный", value: "strong" },
          { title: "Курсив", value: "em" },
        ],
        annotations: [
          {
            name: "link",
            type: "object",
            title: "Ссылка",
            fields: [
              {
                name: "href",
                type: "url",
                title: "URL",
                validation: (Rule) =>
                  Rule.uri({ scheme: ["http", "https", "mailto", "tel"] }),
              },
            ],
          },
        ],
      },
    }),

    defineArrayMember({
      name: "pullQuote",
      type: "object",
      title: "Цитата с атрибуцией",
      fields: [
        {
          name: "text",
          type: "text",
          title: "Текст цитаты",
          rows: 3,
          validation: (Rule) => Rule.required(),
        },
        {
          name: "cite",
          type: "string",
          title: "Источник / атрибуция",
          description: 'Необязательно. Например: "из записей экспедиции"',
        },
      ],
      preview: {
        select: { title: "text", subtitle: "cite" },
        prepare: ({ title, subtitle }) => ({
          title: title ? `«${title}»` : "(пустая цитата)",
          subtitle: subtitle ? `— ${subtitle}` : undefined,
        }),
      },
    }),

    defineArrayMember({
      name: "figure",
      type: "image",
      title: "Изображение",
      options: { hotspot: true },
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alt-текст",
          description: "Описание для скринридеров и SEO",
          validation: (Rule) => Rule.required(),
        },
        {
          name: "caption",
          type: "string",
          title: "Подпись",
          description: "Отображается под картинкой",
        },
      ],
    }),
  ],
});
