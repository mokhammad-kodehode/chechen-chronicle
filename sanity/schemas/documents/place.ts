import { defineType, defineField } from "sanity";

/**
 * Место — географическая точка / населённый пункт / регион.
 * Используется как reference в archiveItem, publication, event.
 */
export const place = defineType({
  name: "place",
  title: "Место",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Название",
      type: "localeString",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "URL",
      type: "slug",
      options: { source: "name.ru", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "kind",
      title: "Тип места",
      type: "string",
      options: {
        list: [
          { title: "Село / город", value: "settlement" },
          { title: "Регион", value: "region" },
          { title: "Природный объект (ущелье, хребет)", value: "landmark" },
          { title: "Здание / памятник", value: "building" },
          { title: "Археологический объект", value: "archaeological" },
        ],
      },
    }),
    defineField({
      name: "coordinates",
      title: "Координаты",
      type: "geopoint",
    }),
    defineField({
      name: "description",
      title: "Описание",
      type: "localeText",
    }),
  ],
  preview: {
    select: { title: "name.ru", subtitle: "kind" },
  },
});
