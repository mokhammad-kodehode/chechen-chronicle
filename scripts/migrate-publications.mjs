// Скрипт миграции существующих 6 публикаций из app/lib/publications.ts (старая версия)
// в Sanity. Запускать один раз после установки токена.
//
// Использование:
//   1. Создать в Sanity API token (API → Tokens → Add token, права Editor)
//   2. Добавить в .env.local: SANITY_API_WRITE_TOKEN=...
//   3. node scripts/migrate-publications.mjs

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
  console.error(
    "Не заданы NEXT_PUBLIC_SANITY_PROJECT_ID / NEXT_PUBLIC_SANITY_DATASET / SANITY_API_WRITE_TOKEN"
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion,
  useCdn: false,
});

// ─────────────────────────────────────────────────────────────
// Исходные данные (снимок старого app/lib/publications.ts)
// ─────────────────────────────────────────────────────────────

const HISTORIAN = {
  name: "Хож-Ахмед Берсанов",
  role: "Историк, исследователь Кавказа",
};

const OLD_PUBLICATIONS = [
  {
    slug: "bashennoe-zodchestvo-vaynakhov",
    title: "Башенное зодчество вайнахов: язык камня",
    excerpt:
      "Каменные башни в горах — не просто оборона, а сложная система знаков. Разбираем, что говорят их пропорции, кладка и расположение о людях, которые их возводили.",
    coverImagePath: "public/images/hero-tower.webp",
    publishedAt: "2026-04-22",
    readingTimeMinutes: 12,
    category: "research",
    tags: ["архитектура", "средневековье", "горный пояс"],
    featured: true,
    body: [
      {
        type: "paragraph",
        text: "Вайнахские башни — один из самых узнаваемых элементов горного ландшафта. За веками их строительства стоит не только военная необходимость, но и социальный язык, понятный всем жителям ущелий.",
      },
      { type: "heading", level: 2, text: "Типология и назначение" },
      {
        type: "paragraph",
        text: "Принято выделять три основных типа: жилые (гӀала), боевые (бӀов) и полубоевые. Жилые башни занимали нижний ярус поселения и часто примыкали к скале, боевые — возвышались над ущельем и контролировали проход.",
      },
      {
        type: "list",
        items: [
          "Высота боевой башни редко превышала 25–28 метров.",
          "Кладка велась насухо, без раствора — только подгонка камня.",
          "В верхних ярусах оставляли машикули для обороны.",
        ],
      },
      {
        type: "quote",
        text: "Башня — это не дом и не крепость. Это договор рода с горой.",
        cite: "из записей этнографических экспедиций 1980-х",
      },
      {
        type: "heading",
        level: 2,
        text: "Что мы реально знаем о датировках",
      },
      {
        type: "paragraph",
        text: "Большинство сохранившихся башен относится к XIII–XV векам, но фундаменты под ними часто значительно старше. Радиоуглеродный анализ деревянных перекрытий нескольких объектов в Аргунском ущелье даёт более раннюю датировку.",
      },
    ],
  },
  {
    slug: "teipovaya-sistema-glazami-istochnikov",
    title: "Тейповая система глазами источников",
    excerpt:
      "Что такое тейп — родовая община, политическая единица или культурная память? Сопоставление полевых записей XIX века и современных интерпретаций.",
    publishedAt: "2026-03-14",
    readingTimeMinutes: 9,
    category: "essay",
    tags: ["тейп", "общество", "источники"],
    body: [
      {
        type: "paragraph",
        text: "Слово «тейп» в массовом сознании сегодня сильно упростилось. Между тем источники XIX века описывают его скорее как многослойную систему отношений, чем как простой клан.",
      },
      {
        type: "heading",
        level: 2,
        text: "Полевые записи царской администрации",
      },
      {
        type: "paragraph",
        text: "Военно-административные обзоры 1860–1880 годов фиксируют не только численность тейпов, но и их внутренние группы, что для современного исследователя представляет ключ к пониманию структуры.",
      },
    ],
  },
  {
    slug: "arxivnaya-nakhodka-pismo-1911",
    title: "Архивная находка: письмо учителя из Ведено, 1911 год",
    excerpt:
      "Случайная находка в фондах Тбилисского архива: письмо сельского учителя о школе, языке и плате за обучение. Публикуем впервые с переводом и комментарием.",
    publishedAt: "2026-02-08",
    readingTimeMinutes: 6,
    category: "archive",
    tags: ["архив", "образование", "XX век"],
    body: [
      {
        type: "paragraph",
        text: "Документ был найден при разборе фонда Кавказского учебного округа. Имя автора — частично утрачено, но контекст позволяет уверенно атрибутировать его учителю одной из горных школ Веденского округа.",
      },
      {
        type: "quote",
        text: "Дети ходят за восемь верст. Зимой — реже, но не из-за холода, а потому что обувь одна на двоих.",
      },
    ],
  },
  {
    slug: "intervju-s-khranitelem-muzeya",
    title: "Интервью: хранитель музея о возвращённых артефактах",
    excerpt:
      "Разговор с хранителем районного музея о трёх предметах, вернувшихся в коллекцию за последний год — и о том, какой ценой это удалось.",
    publishedAt: "2026-01-19",
    readingTimeMinutes: 8,
    category: "interview",
    tags: ["музеи", "реституция", "современность"],
    body: [
      {
        type: "paragraph",
        text: "Мы встретились в фондовом зале — между стеллажами, где каждая вещь имеет инвентарный номер и собственную историю перемещений.",
      },
    ],
  },
  {
    slug: "shelkoviy-put-i-gory",
    title:
      "Шёлковый путь и горы: следы транзита, которых не должно было быть",
    excerpt:
      "Монеты, бусы, фрагменты тканей. Почему артефакты дальней торговли встречаются в горных могильниках — и что это меняет в нашей картине раннего средневековья.",
    publishedAt: "2025-12-02",
    readingTimeMinutes: 11,
    category: "research",
    tags: ["торговля", "археология", "раннее средневековье"],
    body: [
      {
        type: "paragraph",
        text: "Долгое время считалось, что горный пояс находился в стороне от основных трансконтинентальных маршрутов. Накопленный за последние двадцать лет материал говорит об обратном.",
      },
    ],
  },
  {
    slug: "pamyat-mest-deportatsiya-1944",
    title: "Память мест: как села помнят 1944 год",
    excerpt:
      "Полевые наблюдения о том, как пространство — кладбища, разрушенные мечети, тропы — становится носителем памяти, когда документы молчат.",
    publishedAt: "2025-10-27",
    readingTimeMinutes: 14,
    category: "memory",
    tags: ["XX век", "память", "ландшафт"],
    body: [
      {
        type: "paragraph",
        text: "Когда документального свидетельства не сохранилось, носителем памяти становится сама территория. Этот текст — попытка прочитать её как источник.",
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// Конвертеры
// ─────────────────────────────────────────────────────────────

function makeKey() {
  return Math.random().toString(36).slice(2, 14);
}

function textToSpans(text) {
  return [{ _type: "span", _key: makeKey(), text, marks: [] }];
}

function blockToPortable(block) {
  if (block.type === "paragraph") {
    return [
      {
        _type: "block",
        _key: makeKey(),
        style: "normal",
        markDefs: [],
        children: textToSpans(block.text),
      },
    ];
  }

  if (block.type === "heading") {
    return [
      {
        _type: "block",
        _key: makeKey(),
        style: `h${block.level}`,
        markDefs: [],
        children: textToSpans(block.text),
      },
    ];
  }

  if (block.type === "quote") {
    return [
      {
        _type: "pullQuote",
        _key: makeKey(),
        text: block.text,
        cite: block.cite,
      },
    ];
  }

  if (block.type === "list") {
    const listItem = block.ordered ? "number" : "bullet";
    return block.items.map((item) => ({
      _type: "block",
      _key: makeKey(),
      style: "normal",
      level: 1,
      listItem,
      markDefs: [],
      children: textToSpans(item),
    }));
  }

  return [];
}

async function uploadImage(relPath) {
  const full = path.resolve(process.cwd(), relPath);
  const buf = await readFile(full);
  const asset = await client.assets.upload("image", buf, {
    filename: path.basename(full),
  });
  return {
    _type: "image",
    asset: { _type: "reference", _ref: asset._id },
    alt: "",
  };
}

// ─────────────────────────────────────────────────────────────
// Запуск
// ─────────────────────────────────────────────────────────────

async function main() {
  console.log(`→ Подключаюсь к проекту ${projectId}, dataset=${dataset}`);

  // 1) Создаём (или находим) Person
  const personSlug = "khozh-akhmed-bersanov";
  let person = await client.fetch(
    `*[_type == "person" && slug.current == $slug][0]`,
    { slug: personSlug }
  );
  if (!person) {
    person = await client.create({
      _type: "person",
      name: HISTORIAN.name,
      slug: { _type: "slug", current: personSlug },
      role: HISTORIAN.role,
    });
    console.log(`✓ Создан Person: ${person.name} (_id=${person._id})`);
  } else {
    console.log(`• Person уже существует: ${person.name}`);
  }

  // 2) Публикации
  for (const old of OLD_PUBLICATIONS) {
    const existing = await client.fetch(
      `*[_type == "publication" && slug.current == $slug][0]{_id}`,
      { slug: old.slug }
    );
    if (existing) {
      console.log(`• Пропускаю (уже есть): ${old.slug}`);
      continue;
    }

    let coverImage;
    if (old.coverImagePath) {
      console.log(`  ↑ Загружаю обложку ${old.coverImagePath}…`);
      try {
        coverImage = await uploadImage(old.coverImagePath);
        coverImage.alt = old.title;
      } catch (e) {
        console.warn(`  ! Не удалось загрузить обложку: ${e.message}`);
      }
    }

    const body = old.body.flatMap(blockToPortable);

    const doc = {
      _type: "publication",
      title: old.title,
      slug: { _type: "slug", current: old.slug },
      excerpt: old.excerpt,
      coverImage,
      author: { _type: "reference", _ref: person._id },
      publishedAt: new Date(old.publishedAt).toISOString(),
      readingTimeMinutes: old.readingTimeMinutes,
      category: old.category,
      tags: old.tags,
      featured: old.featured ?? false,
      body,
    };

    const created = await client.create(doc);
    console.log(`✓ Создана публикация: ${old.title} (_id=${created._id})`);
  }

  console.log("\n✅ Готово");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
