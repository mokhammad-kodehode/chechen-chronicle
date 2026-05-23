// Загружает .glb файл в Sanity как ассет и привязывает к публикации.
//
// Использование:
//   node scripts/upload-coin-model.mjs <slug> <path-to-glb>
//
// Пример:
//   node scripts/upload-coin-model.mjs monety-ordynskoy-epokhi-iz-poseleniya-ashkhoytsev "C:/Users/stech/Downloads/Meshy_AI_Four_Ancient_Coins_0523152324_texture.glb"

import { createClient } from "@sanity/client";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-08-08";

if (!projectId || !dataset || !token) {
  console.error("✗ Не заданы env-переменные Sanity");
  process.exit(1);
}

const [slug, filePath] = process.argv.slice(2);
if (!slug || !filePath) {
  console.error("Использование: node scripts/upload-coin-model.mjs <slug> <path-to-glb>");
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
  // 1) Найти публикацию
  const pub = await client.fetch(
    `*[_type == "publication" && slug.current == $slug][0]{_id, title}`,
    { slug }
  );
  if (!pub) {
    console.error(`✗ Публикация со slug "${slug}" не найдена`);
    process.exit(1);
  }
  console.log(`→ Публикация: ${pub.title}`);

  // 2) Прочитать .glb
  const full = path.resolve(filePath);
  console.log(`→ Читаю ${full}`);
  const buf = await readFile(full);
  const sizeMB = (buf.length / 1024 / 1024).toFixed(2);
  console.log(`  размер: ${sizeMB} MB`);

  // 3) Загрузить как file-ассет
  console.log(`→ Загружаю в Sanity assets...`);
  const asset = await client.assets.upload("file", buf, {
    filename: path.basename(full),
    contentType: "model/gltf-binary",
  });
  console.log(`✓ Загружен ассет: ${asset._id}`);
  console.log(`  URL: ${asset.url}`);

  // 4) Привязать к публикации (поле model3d + включить enable3DView)
  await client
    .patch(pub._id)
    .set({
      enable3DView: true,
      model3d: {
        _type: "file",
        asset: { _type: "reference", _ref: asset._id },
      },
    })
    .commit();

  console.log(`✓ Привязал к публикации ${pub._id}`);
  console.log(`\nГотово. Откройте:`);
  console.log(`  http://localhost:3000/ru/publications/${slug}/3d`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
