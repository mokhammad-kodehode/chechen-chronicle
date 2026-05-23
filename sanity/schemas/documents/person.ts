import { defineType, defineField } from "sanity";

export const person = defineType({
  name: "person",
  title: "Автор",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Имя",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "URL",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "role",
      title: "Роль / должность",
      description: 'Например: "Историк, исследователь Кавказа"',
      type: "string",
    }),
    defineField({
      name: "avatar",
      title: "Аватар",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "bio",
      title: "Биография",
      description: "Краткая справка для будущей страницы автора",
      type: "text",
      rows: 4,
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "role", media: "avatar" },
  },
});
