import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemas";
import { structure, SINGLETONS } from "./sanity/structure";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION!;

const SINGLETON_TYPES = new Set(SINGLETONS.map((s) => s.id));
const PRIVATE_CONTACT_TYPE = "familySubmissionContact";

export default defineConfig({
  name: "default",
  title: "Chechen Chronicle",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
  schema: { types: schemaTypes },
  document: {
    actions: (input, { schemaType }) => {
      // Singletons can't be deleted, duplicated, or unpublished — they
      // must always exist exactly once.
      if (SINGLETON_TYPES.has(schemaType)) {
        return input.filter(
          ({ action }) =>
            !action || !["delete", "duplicate", "unpublish"].includes(action)
        );
      }
      // Submitter contacts are private: they live only as drafts and can
      // never be published (published docs are readable via the public
      // API). The editor can only read and delete them.
      if (schemaType === PRIVATE_CONTACT_TYPE) {
        return input.filter(({ action }) => action === "delete");
      }
      return input;
    },
    // Contacts are created by the site form only, never by hand.
    newDocumentOptions: (prev) =>
      prev.filter((item) => item.templateId !== PRIVATE_CONTACT_TYPE),
  },
});
