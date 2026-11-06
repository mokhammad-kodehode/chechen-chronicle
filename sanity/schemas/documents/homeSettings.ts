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
// `pinned` orders the «Из журнала» shelf on the museum home page.
export const homeSettings = defineType({
  name: "homeSettings",
  title: "Главная страница",
  type: "document",
  fields: [
    defineField({
      name: "featured",
      title: "Материал номера",
      description:
        "Крупный баннер вверху страницы журнала и первая карточка в блоке «Из журнала» на главной. Если не выбран — берётся самый свежий материал.",
      type: "reference",
      to: [{ type: "publication" }],
    }),
    defineField({
      name: "pinned",
      title: "Журнал на главной",
      description:
        "Блок «Из журнала» на главной показывает три материала: сначала материал номера, затем этот список в заданном порядке (перетаскиванием), затем самые свежие.",
      type: "array",
      of: [{ type: "reference", to: [{ type: "publication" }] }],
    }),
  ],
  preview: {
    select: { featuredTitle: "featured.title" },
    prepare: ({ featuredTitle }: { featuredTitle?: string }) => ({
      title: "Главная страница",
      subtitle: featuredTitle
        ? `Материал номера: ${featuredTitle}`
        : "Материал номера: самый свежий",
    }),
  },
});
