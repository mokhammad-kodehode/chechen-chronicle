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
  /** Hero cover image for the category — used by the home-page category
   *  doors as a full-bleed background. Path relative to /public. */
  coverImage?: string;
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
    coverImage: "/images/dwellings/tower.jpg",
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
    coverImage: "/images/weapons/kinzhal.jpg",
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
    coverImage: "/images/warriors/voin.jpg",
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

// ──────────────────────────────────────────────
// ENGLISH MIRROR — every text field translated. Structure (glyphs,
// hrefs, slugs, numerals, images) is shared by reference; only the
// strings differ. Translations are crafted to convey the original
// meaning rather than render it word-for-word — "договор рода с
// горой" → "a clan's covenant with the mountain", and so on.
// ──────────────────────────────────────────────

export const CATEGORIES_EN: Category[] = [
  {
    id: "dwellings",
    slug: "dwellings",
    numeral: "I",
    kicker: "DWELLINGS",
    intro:
      "Towers, crypts, and houses — where people lived and where they remembered the dead. The architecture of the Caucasus, from ancient mountain shelters to villages of the modern era.",
    glyph: <TowerGlyph />,
    coverImage: "/images/dwellings/tower.jpg",
    stories: [
      {
        href: "/istorii/bashnya",
        era: "12th – 17th c.",
        title: "Battle Tower",
        subtitle: "A clan's covenant with the mountain",
        body: "A stone tower laid without mortar. House, fortress, sanctuary — all in a single structure. Scrolling opens its cross-section and descends to the hearth.",
      },
      {
        href: "/istorii/dozornaya",
        era: "15th – 18th c.",
        title: "Watchtower",
        subtitle: "Flat-roofed, with double machicolations",
        body: "A tower with a flat roof and a fighting platform on top. A double row of machicolations covers the base; a lookout shelters in the cabin at the summit.",
      },
      {
        href: null,
        era: "14th – 18th c.",
        title: "Residential Tower",
        subtitle: "Four storeys under one roof",
        body: "A rectangular tower with a hearth on the ground floor and arched windows above. The masonry inclines inward; the floors are timber.",
      },
      {
        href: null,
        era: "1st mil. BC – 9th c.",
        title: "Crypt Complex",
        subtitle: "City of the dead",
        body: "Stone necropolises in the mountains. Family tombs: each with its own pyramid roof and a narrow window for the soul.",
      },
    ],
  },
  {
    id: "weapons",
    slug: "weapons",
    numeral: "II",
    kicker: "WEAPONRY",
    intro:
      "The steel of the Caucasus — from the ritual blades of the Bronze Age to long-barrelled firearms. The things worn at the belt and passed down with a name.",
    glyph: <DaggerGlyph />,
    coverImage: "/images/weapons/kinzhal.jpg",
    stories: [
      {
        href: "/istorii/kinzhal",
        era: "17th – 20th c.",
        title: "Kama Dagger",
        subtitle: "The heart of a man",
        body: "A straight, double-edged blade 30 to 50 cm long. Silver with niello, gold inlay. As you scroll, the steel and grip appear in macro.",
      },
      {
        href: null,
        era: "18th – 19th c.",
        title: "Shashka Sabre",
        subtitle: "No backswing, no guard",
        body: "A long single-edged blade with an open hilt. Not made for duelling — for the direct, instantaneous strike from the sheath.",
      },
      {
        href: null,
        era: "18th – 20th c.",
        title: "Long-barrelled Musket",
        subtitle: "A guest from the West",
        body: "Flintlock and percussion firearms. Reached the Caucasus along trade routes and took its place beside cold steel without replacing it.",
      },
    ],
  },
  {
    id: "warriors",
    slug: "warriors",
    numeral: "III",
    kicker: "WARRIORS",
    intro:
      "Not professional soldiers, but defenders of land and clan. Adat, nokhchalla, one's name in the lineage — bonds stronger than armour.",
    glyph: <SwordGlyph />,
    coverImage: "/images/warriors/voin.jpg",
    stories: [
      {
        href: "/istorii/voin",
        era: "15th – 18th c.",
        title: "Guardian of the Threshold",
        subtitle: "Adat and steel",
        body: "The Caucasian warrior of the Middle Ages — ploughman and fighter at once. A code of honour, a weapon at the belt from childhood.",
        image: "/images/warriors/khranitel-poroga.jpg",
      },
      {
        href: null,
        era: "1st mil. BC",
        title: "Ancient Mountain Warrior",
        subtitle: "A Scythian trace",
        body: "Bronze weapons, leather armour. Contact with the Scythians and Sarmatians left its imprint on burial artefacts.",
      },
      {
        href: null,
        era: "19th c.",
        title: "Fighter of the Caucasian War",
        subtitle: "Between two empires",
        body: "The era of Shamil and the Imamate. Cold weapons paired with captured firearms, mounted tactics, the mountains as a stronghold.",
      },
    ],
  },
];

// Pick the right CATEGORIES array based on locale. Falls back to the
// Russian source for any unknown language.
export function getCategories(lang: string | null | undefined): Category[] {
  return lang === "en" ? CATEGORIES_EN : CATEGORIES;
}

export function getCategoryBySlug(
  slug: string,
  lang?: string | null
): Category | undefined {
  return getCategories(lang).find((c) => c.slug === slug);
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
