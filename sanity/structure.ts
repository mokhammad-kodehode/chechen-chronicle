import type { StructureResolver } from "sanity/structure";

// Documents that must exist exactly once. Each is rendered as a fixed
// editor (not a create-able list) and filtered out of the
// auto-generated document list below so it appears only once.
export const SINGLETONS = [
  { id: "homeSettings", title: "Главная страница" },
];

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Контент")
    .items([
      ...SINGLETONS.map(({ id, title }) =>
        S.listItem()
          .id(id)
          .title(title)
          .child(S.document().schemaType(id).documentId(id))
      ),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => !SINGLETONS.some((s) => s.id === item.getId())
      ),
    ]);
