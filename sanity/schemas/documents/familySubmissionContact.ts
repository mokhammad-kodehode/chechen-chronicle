import { defineType, defineField } from "sanity";

// Контакты человека, приславшего семейную историю.
//
// ПРИВАТНЫЙ документ. Создаётся формой как черновик (`drafts.<id>`), а
// публикация для этого типа отключена в sanity.config.ts — так он
// никогда не попадает в публичный датасет и не виден через API сайта.
// Нужен редакции, чтобы связаться с автором и уточнить детали.

export const familySubmissionContact = defineType({
  name: "familySubmissionContact",
  title: "Контакты отправителя",
  type: "document",
  readOnly: true,
  fields: [
    defineField({
      name: "storyTitle",
      title: "История",
      type: "string",
    }),
    defineField({
      name: "storyId",
      title: "ID истории",
      description: "ID документа «Семейная история» (без префикса drafts.)",
      type: "string",
    }),
    defineField({
      name: "fullName",
      title: "Имя",
      type: "string",
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
    }),
    defineField({
      name: "phone",
      title: "Телефон / WhatsApp / Telegram",
      type: "string",
    }),
    defineField({
      name: "messageToEditors",
      title: "Сообщение редакции",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "consentPublish",
      title: "Согласие на публикацию",
      type: "boolean",
    }),
    defineField({
      name: "consentRights",
      title: "Подтвердил право делиться материалами",
      type: "boolean",
    }),
    defineField({
      name: "locale",
      title: "Язык сайта при отправке",
      type: "string",
    }),
    defineField({
      name: "submittedAt",
      title: "Дата получения",
      type: "datetime",
    }),
  ],
  preview: {
    select: { title: "fullName", subtitle: "storyTitle" },
    prepare: ({ title, subtitle }: { title?: string; subtitle?: string }) => ({
      title: title || "(без имени)",
      subtitle: subtitle ? `История: ${subtitle}` : undefined,
    }),
  },
  orderings: [
    {
      title: "Недавно присланные",
      name: "submittedDesc",
      by: [{ field: "submittedAt", direction: "desc" }],
    },
  ],
});
