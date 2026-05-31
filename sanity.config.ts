import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemas";
import { structure, SINGLETONS } from "./sanity/structure";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION!;

const SINGLETON_TYPES = new Set(SINGLETONS.map((s) => s.id));

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
    // Singletons can't be deleted, duplicated, or unpublished — they
    // must always exist exactly once.
    actions: (input, { schemaType }) =>
      SINGLETON_TYPES.has(schemaType)
        ? input.filter(
            ({ action }) =>
              !action || !["delete", "duplicate", "unpublish"].includes(action)
          )
        : input,
  },
});
