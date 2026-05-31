import { defineType, defineField } from "sanity";

// Singleton: editorial curation for the home page.
//
// "What sits on the banner" lives HERE as a reference — not as a
// boolean on the publication. That keeps exactly one hero (a reference
// holds a single value, so the old "two featured collide" bug is
// impossible), makes swapping it a one-action change, and keeps the
// decision where it belongs: presentation/curation, not the content
// document itself.
//
// The per-slot curation of the front page (main / sidebar / bento
// order) will grow here as a reference array in a later step.
export const homeSettings = defineType({
  name: "homeSettings",
  title: "Главная страница",
  type: "document",
  fields: [
    defineField({
      name: "featured",
      title: "Публикация на баннере",
      description:
        "Показывается крупным баннером вверху главной и большой карточкой над списком на странице публикаций. Если не выбрана — берётся самая свежая публикация.",
      type: "reference",
      to: [{ type: "publication" }],
    }),
    defineField({
      name: "pinned",
      title: "Закреплённые на главной",
      description:
        "Публикации в нужном порядке занимают крупные слоты A1-разворота: 2 главных поста, затем верх сайдбара и компактные, затем бенто. Перетаскиванием меняй порядок. Свободные слоты добираются самыми свежими публикациями. Баннер задаётся полем выше отдельно.",
      type: "array",
      of: [{ type: "reference", to: [{ type: "publication" }] }],
    }),
  ],
  preview: {
    select: { featuredTitle: "featured.title" },
    prepare: ({ featuredTitle }: { featuredTitle?: string }) => ({
      title: "Главная страница",
      subtitle: featuredTitle
        ? `Баннер: ${featuredTitle}`
        : "Баннер: самая свежая публикация",
    }),
  },
});
