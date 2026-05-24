// Shared data + glyphs for the stories archive.
//
// `CATEGORIES` is the single source of truth — both the index page and
// the per-category pages read from it. To add a new story, drop an
// entry into the appropriate category's `stories` array.

import * as React from "react";

export type Story = {
  href: string | null; // null = "coming soon" placeholder
  era: string;
  title: string;
  subtitle: string;
  body: string;
  /** Optional portrait/illustration. Used on the story card and in the
   *  category-header collage. Path relative to /public. */
  image?: string;
};

export type Category = {
  id: string;
  slug: string; // URL segment under /istorii
  numeral: string;
  kicker: string;
  intro: string;
  glyph: React.ReactNode;
  stories: Story[];
};

export const CATEGORIES: Category[] = [
  {
    id: "dwellings",
    slug: "dwellings",
    numeral: "I",
    kicker: "ЖИЛИЩА",
    intro:
      "Башни, склепы, дома — где жили и где помнили о мёртвых. Архитектура Кавказа от древних укрытий до сёл нового времени.",
    glyph: <TowerGlyph />,
    stories: [
      {
        href: "/istorii/bashnya",
        era: "XII – XVII в.",
        title: "Боевая башня",
        subtitle: "Договор рода с горой",
        body: "Каменная башня, сложенная без раствора. Дом, крепость, святилище — всё в одной постройке. Скролл раскрывает разрез и спускается к очагу.",
      },
      {
        href: "/istorii/dozornaya",
        era: "XV – XVIII в.",
        title: "Башня с площадкой",
        subtitle: "Без шатра, с двойными машикулями",
        body: "Башня с плоской кровлей и боевой площадкой наверху. Двойной ряд машикулей закрывает подножие, в будке на вершине укрывается дозорный.",
      },
      {
        href: null,
        era: "XIV – XVIII в.",
        title: "Жилая башня",
        subtitle: "Четыре яруса под одной крышей",
        body: "Прямоугольная башня с очагом на первом этаже и арочными окнами на верхних. Кладка с уклоном внутрь, перекрытия деревянные.",
      },
      {
        href: null,
        era: "I тыс. до н.э. — IX в.",
        title: "Склеповый комплекс",
        subtitle: "Город мёртвых",
        body: "Каменные склепы-некрополи в горах. Усыпальницы рода: каждый — со своей крышей-пирамидой и узким окном для души.",
      },
    ],
  },
  {
    id: "weapons",
    slug: "weapons",
    numeral: "II",
    kicker: "ОРУДИЯ",
    intro:
      "Сталь Кавказа — от ритуальных клинков бронзового века до длинноствольного огнестрела. То, что носили на поясе и передавали с именем.",
    glyph: <DaggerGlyph />,
    stories: [
      {
        href: "/istorii/kinzhal",
        era: "XVII – XX в.",
        title: "Кинжал кама",
        subtitle: "Сердце мужчины",
        body: "Прямой обоюдоострый клинок 30-50 см. Серебро с чернью, золотая всечка. По мере скролла — макропланы стали и рукояти.",
      },
      {
        href: null,
        era: "XVIII – XIX в.",
        title: "Шашка",
        subtitle: "Без замаха, без гарды",
        body: "Длинный однолезвийный клинок с открытой рукоятью. Не для дуэли — для прямого, мгновенного удара из ножен.",
      },
      {
        href: null,
        era: "XVIII – XX в.",
        title: "Длинноствольный мушкет",
        subtitle: "Гость с Запада",
        body: "Кремнёвое и капсюльное огнестрельное. Пришло на Кавказ через торговые пути, встало рядом с холодной сталью, не заменив её.",
      },
    ],
  },
  {
    id: "warriors",
    slug: "warriors",
    numeral: "III",
    kicker: "ВОИНЫ",
    intro:
      "Не профессиональные солдаты, а защитники земли и рода. Адат, нохчалла, имя в роду — то, что связывало крепче доспеха.",
    glyph: <SwordGlyph />,
    stories: [
      {
        href: "/istorii/voin",
        era: "XV – XVIII в.",
        title: "Хранитель порога",
        subtitle: "Адат и сталь",
        body: "Кавказский воин Средневековья — пахарь и боец одновременно. Кодекс чести, оружие на поясе с детства.",
        image: "/images/warriors/khranitel-poroga.jpg",
      },
      {
        href: null,
        era: "I тыс. до н.э.",
        title: "Древний воин-горец",
        subtitle: "Скифский след",
        body: "Бронзовое оружие, кожаный доспех. Контакты со скифами и сарматами оставили отпечаток в погребальных артефактах.",
      },
      {
        href: null,
        era: "XIX в.",
        title: "Боец Кавказской войны",
        subtitle: "Между двумя империями",
        body: "Времена Шамиля и Имамата. Холодное оружие плюс трофейный огнестрел, конная тактика, опора на горы.",
      },
    ],
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

// ──────────────────────────────────────────────
// GLYPHS — small inline SVGs that hint at each category's subject.
// They inherit `currentColor` so they pick up the surrounding text colour.
// ──────────────────────────────────────────────

function TowerGlyph() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 56 56"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path d="M28 4 L18 16 L38 16 Z" strokeLinejoin="round" />
      <path d="M20 16 L18 50 L38 50 L36 16" strokeLinejoin="round" />
      <line x1="28" y1="22" x2="28" y2="28" />
      <line x1="28" y1="34" x2="28" y2="40" />
      <line x1="19" y1="18" x2="37" y2="18" />
    </svg>
  );
}

function DaggerGlyph() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 56 56"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path d="M28 4 L24 36 L32 36 Z" strokeLinejoin="round" />
      <line x1="20" y1="36" x2="36" y2="36" />
      <rect x="26" y="36" width="4" height="10" rx="1" />
      <circle cx="28" cy="49" r="2.5" />
    </svg>
  );
}

// Sword glyph — vertical, hilt up, blade down. No cross.
function SwordGlyph() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 56 56"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      {/* Pommel — circle at top */}
      <circle cx="28" cy="8" r="2.5" />
      {/* Hilt grip */}
      <line x1="28" y1="11" x2="28" y2="18" strokeWidth="2.4" />
      {/* Cross-guard — horizontal bar (one line, not a full cross) */}
      <line x1="20" y1="18" x2="36" y2="18" strokeLinecap="round" />
      {/* Blade — tapered double line down */}
      <path d="M28 19 L24.5 50 M28 19 L31.5 50" strokeLinejoin="round" />
      {/* Blade tip closure */}
      <path d="M24.5 50 L28 53 L31.5 50" strokeLinejoin="round" />
    </svg>
  );
}
