// Создаёт публикацию «Монеты ордынской эпохи из поселения ашхойцев»
// node scripts/create-publication-coins.mjs

import { createClient } from "@sanity/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-08-08",
  useCdn: false,
});

function makeKey() {
  return Math.random().toString(36).slice(2, 14);
}

function paragraph(text) {
  return {
    _type: "block",
    _key: makeKey(),
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: makeKey(), text, marks: [] }],
  };
}

const BODY = [
  paragraph(
    "Коллеги познакомили с находками из Ачхой-Мартана. При беглом осмотре можно сказать, что это данги и пулы Золотой Орды, но нужно поработать и провести исследование по ряду параметров. Кое-где, похоже, местная подделка."
  ),
];

async function main() {
  const author = await client.fetch(
    `*[_type == "person" && name match "Амин*"][0]{_id, name}`
  );
  if (!author) {
    console.error("✗ Автор «Амин ...» не найден.");
    process.exit(1);
  }
  console.log(`→ Автор: ${author.name}`);

  const slug = "monety-ordynskoy-epokhi-iz-poseleniya-ashkhoytsev";
  const existing = await client.fetch(
    `*[_type == "publication" && slug.current == $slug][0]{_id}`,
    { slug }
  );
  if (existing) {
    console.log(`• Уже есть: ${existing._id}`);
    return;
  }

  const doc = {
    _type: "publication",
    title: "Монеты ордынской эпохи из поселения ашхойцев",
    slug: { _type: "slug", current: slug },
    excerpt:
      "Находки из Ачхой-Мартана — предположительно данги и пулы Золотой Орды. Требуют исследования по ряду параметров; часть, возможно, местные подделки.",
    author: { _type: "reference", _ref: author._id },
    publishedAt: new Date().toISOString(),
    category: "research",
    tags: ["Золотая Орда", "Ачхой-Мартан", "монеты", "нумизматика", "находки"],
    featured: false,
    body: BODY,
  };

  const created = await client.create(doc);
  console.log(`✓ Создана: ${created.title}`);
  console.log(`  _id:  ${created._id}`);
  console.log(`  url:  http://localhost:3000/ru/publications/${slug}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
