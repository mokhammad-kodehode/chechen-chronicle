// Создаёт публикацию «Катастрофа летом 1776 года»
// node scripts/create-publication-1776.mjs

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

function pullQuote(text, cite) {
  return {
    _type: "pullQuote",
    _key: makeKey(),
    text,
    ...(cite ? { cite } : {}),
  };
}

const BODY = [
  paragraph(
    "Якоб Рейнеггс писал, что 1 июля 1776 года (18 июня — по старому стилю) на Кавказе случилась необычайная жара, которая «спустилась с долины и на горы вокруг Снежной горы» (видимо, Башлам). Эта жара «продержалась до следующего утра, затем около 9 часов начались гром, молния и ужасный шторм, длившиеся до 12 часов». И далее:"
  ),
  pullQuote(
    "Горы обнажились до пород. Стремительный поток со Снежной горы принёс вниз множество огромных валунов, массы снега и льда в узкие долины у истоков Терека, так что течение реки прервалось на три дня, и все долины оказались затопленными. Много деревень с их жителями было унесено прочь, другие, расположенные на высоте 258 футов (78 м — по нынешним расчётам. — З. Т.), были разрушены, когда неожиданно возникшая дамба прорвалась со страшным грохотом. Терек опять побежал свободно, и страхи жителей улеглись.",
    "Якоб Рейнеггс"
  ),
  paragraph(
    "Помнится, были рассказы про воду с горы «Берза-Корта», волна которой будет высотой до старого минарета мечети в одном из присунженских селений; это у тептарилов. Кто понял, тот поймёт."
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

  const slug = "katastrofa-letom-1776-goda";
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
    title: "Катастрофа летом 1776 года",
    slug: { _type: "slug", current: slug },
    excerpt:
      "1 июля 1776 года Якоб Рейнеггс зафиксировал на Кавказе необычайную жару, шторм и обрушение Снежной горы, перекрывшее Терек на три дня. Подробности из источника XVIII века — и эхо в устной памяти.",
    author: { _type: "reference", _ref: author._id },
    publishedAt: new Date().toISOString(),
    category: "archive",
    tags: ["XVIII век", "Рейнеггс", "Терек", "Башлам", "природные катастрофы"],
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
