// Удаляет демо-публикации, демо-автора и загруженные демо-ассеты из Sanity.
// Используется один раз после миграции, чтобы начать с чистого листа.
//
// node scripts/cleanup-demo-data.mjs

import { createClient } from "@sanity/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-08-08";

if (!projectId || !dataset || !token) {
  console.error("Не заданы env-переменные Sanity");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion,
  useCdn: false,
});

async function main() {
  console.log(`→ Чищу проект ${projectId}, dataset=${dataset}`);

  // 1) Удаляем все публикации
  const pubs = await client.fetch(`*[_type == "publication"]{_id, title}`);
  for (const p of pubs) {
    await client.delete(p._id);
    console.log(`✗ Удалена публикация: ${p.title}`);
  }

  // 2) Удаляем всех Person (раз публикаций больше нет — никаких висящих ссылок)
  const people = await client.fetch(`*[_type == "person"]{_id, name}`);
  for (const p of people) {
    await client.delete(p._id);
    console.log(`✗ Удалён автор: ${p.name}`);
  }

  // 3) Удаляем все ассеты (изображения, файлы)
  const assets = await client.fetch(
    `*[_type in ["sanity.imageAsset", "sanity.fileAsset"]]{_id, originalFilename}`
  );
  for (const a of assets) {
    try {
      await client.delete(a._id);
      console.log(`✗ Удалён ассет: ${a.originalFilename ?? a._id}`);
    } catch (e) {
      console.warn(`  ! ${a.originalFilename}: ${e.message}`);
    }
  }

  console.log("\n✅ Чисто");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
