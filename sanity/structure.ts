import type { StructureResolver } from "sanity/structure";

// Documents that must exist exactly once. Each is rendered as a fixed
// editor (not a create-able list) and filtered out of the
// auto-generated document list below so it appears only once.
export const SINGLETONS = [
  { id: "homeSettings", title: "Главная страница" },
];

// Types grouped under «Народный архив» — hidden from the flat list
// so each appears only once.
const FAMILY_ARCHIVE_TYPES = ["familyStory", "familySubmissionContact"];

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

      // Народный архив: submissions arrive as drafts. The editor reads
      // the inbox, fixes the text, and presses Publish — only then the
      // story appears on the site. Contacts are never published.
      S.listItem()
        .id("familyArchive")
        .title("Народный архив")
        .child(
          S.list()
            .title("Народный архив")
            .items([
              S.listItem()
                .id("familyInbox")
                .title("Новые и неопубликованные")
                .child(
                  S.documentList()
                    .id("familyInboxList")
                    .title("На проверке")
                    .schemaType("familyStory")
                    .filter('_type == "familyStory" && _id in path("drafts.**")')
                    .defaultOrdering([{ field: "submittedAt", direction: "desc" }])
                ),
              S.listItem()
                .id("familyPublished")
                .title("Опубликованные истории")
                .child(
                  S.documentList()
                    .id("familyPublishedList")
                    .title("Опубликованные")
                    .schemaType("familyStory")
                    .filter('_type == "familyStory" && !(_id in path("drafts.**"))')
                    .defaultOrdering([{ field: "submittedAt", direction: "desc" }])
                ),
              S.divider(),
              S.documentTypeListItem("familySubmissionContact").title(
                "Контакты отправителей"
              ),
            ])
        ),
      S.divider(),

      ...S.documentTypeListItems().filter((item) => {
        const id = item.getId();
        return (
          !SINGLETONS.some((s) => s.id === id) &&
          !FAMILY_ARCHIVE_TYPES.includes(id ?? "")
        );
      }),
    ]);
