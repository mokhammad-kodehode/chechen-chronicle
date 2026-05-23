// Сжимает картинки в public/images до целевого размера через WebP.
// Запуск: `node scripts/compress-images.mjs`
import sharp from "sharp";
import { readdir, stat, unlink, rename } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Windows: dev-сервер / редактор может держать файл открытым.
// Пробуем несколько раз с паузой.
async function unlinkWithRetry(p, attempts = 6) {
  for (let i = 0; i < attempts; i++) {
    try {
      await unlink(p);
      return;
    } catch (err) {
      if (err.code !== "EBUSY" && err.code !== "EPERM") throw err;
      if (i === attempts - 1) throw err;
      await sleep(400);
    }
  }
}

async function renameWithRetry(from, to, attempts = 6) {
  for (let i = 0; i < attempts; i++) {
    try {
      await rename(from, to);
      return;
    } catch (err) {
      if (err.code !== "EBUSY" && err.code !== "EPERM") throw err;
      if (i === attempts - 1) throw err;
      await sleep(400);
    }
  }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = path.join(__dirname, "..", "public", "images");
const MAX_SIZE_KB = 400;
const MAX_DIMENSION = 2400; // даун-сэмпл крупных снимков

// Опциональный алиас: переименовать выходной файл при сохранении.
// Полезно для исправления опечаток в исходниках.
const RENAME = {
  "atchive.png": "archive.webp",
};

const isImage = (file) => /\.(png|jpe?g|webp|avif)$/i.test(file);

async function compressOne(filePath) {
  const filename = path.basename(filePath);
  const outName = RENAME[filename] ?? filename.replace(/\.(png|jpe?g|webp|avif)$/i, ".webp");
  const outPath = path.join(IMAGES_DIR, outName);
  const tmpPath = outPath + ".tmp";

  const meta = await sharp(filePath).metadata();
  const beforeSize = (await stat(filePath)).size;

  // Уже оптимальный .webp — пропускаем.
  if (
    path.extname(filename).toLowerCase() === ".webp" &&
    beforeSize <= MAX_SIZE_KB * 1024
  ) {
    console.log(
      `${filename.padEnd(20)}   already optimal (${(beforeSize / 1024).toFixed(0)} KB) — skip`
    );
    return;
  }

  // Подбираем quality бинарным поиском от 85 до 35.
  let bestQuality = 35;
  for (let q = 85; q >= 35; q -= 5) {
    const pipeline = sharp(filePath);
    if (meta.width && meta.width > MAX_DIMENSION) {
      pipeline.resize({ width: MAX_DIMENSION });
    }
    await pipeline.webp({ quality: q, effort: 6 }).toFile(tmpPath);
    const sizeKB = (await stat(tmpPath)).size / 1024;
    if (sizeKB <= MAX_SIZE_KB) {
      bestQuality = q;
      break;
    }
  }

  // Итоговый прогон с найденным качеством — всегда в tmp,
  // чтобы избежать ошибки sharp "same file for input and output".
  const finalPipeline = sharp(filePath);
  if (meta.width && meta.width > MAX_DIMENSION) {
    finalPipeline.resize({ width: MAX_DIMENSION });
  }
  await finalPipeline.webp({ quality: bestQuality, effort: 6 }).toFile(tmpPath);

  // Снимаем target, если он уже был (включая случай in-place .webp → .webp).
  if (existsSync(outPath)) await unlinkWithRetry(outPath);
  await renameWithRetry(tmpPath, outPath);

  const afterSize = (await stat(outPath)).size;
  const ratio = (afterSize / beforeSize) * 100;

  // Если входной файл отличается от выходного — это был, например,
  // .png → .webp или переименование с опечатки. Удаляем оригинал.
  if (filePath !== outPath && existsSync(filePath)) {
    await unlinkWithRetry(filePath);
  }

  console.log(
    `${filename.padEnd(20)} → ${outName.padEnd(22)} ` +
      `${(beforeSize / 1024).toFixed(0).padStart(5)} KB → ${(afterSize / 1024).toFixed(0).padStart(4)} KB ` +
      `(${ratio.toFixed(0)}%) @ q=${bestQuality}`
  );
}

const files = (await readdir(IMAGES_DIR)).filter(isImage);
console.log(`Found ${files.length} image(s) in ${IMAGES_DIR}\n`);
try {
  for (const file of files) {
    await compressOne(path.join(IMAGES_DIR, file));
  }
  console.log(`\n✓ Done. Target: ≤${MAX_SIZE_KB} KB.`);
} catch (err) {
  if (err.code === "EBUSY" || err.code === "EPERM") {
    console.error(
      `\n✗ File locked: ${err.path}\n` +
        `  Likely the Next dev server is running and holding the file.\n` +
        `  Stop it (Ctrl+C in the terminal running 'npm run dev') and run this again.`
    );
    process.exit(1);
  }
  throw err;
}
