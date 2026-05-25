import type { Publication } from "./publications";

// Demo seed publications — fill the homepage grid until the Sanity
// backend is populated. Real publications are loaded first; if there
// are fewer than `HOME_GRID_TARGET` of them, stubs top up the row so
// the layout reads as a full editorial feed.
//
// To remove from a tile, just publish a real publication in Sanity —
// real entries always take precedence by slug.

const day = 24 * 60 * 60 * 1000;
const now = Date.now();
const daysAgo = (n: number) => new Date(now - n * day).toISOString();

export const STUB_PUBLICATIONS: Publication[] = [
  {
    id: "stub-towers",
    slug: "bashennaya-arkhitektura-stub",
    title: "Башенная архитектура: между домом и крепостью",
    excerpt:
      "Каменные башни Кавказа выросли не как военные сооружения. Их форма — компромисс между домом и крепостью, между жизнью и обороной.",
    coverImageUrl: "/images/dwellings/tower.jpg",
    coverImageAlt: "Боевая башня в горах",
    author: { name: "Амин Тесаев" },
    publishedAt: daysAgo(2),
    readingTimeMinutes: 8,
    category: "research",
    tags: ["архитектура", "башни"],
    body: [],
  },
  {
    id: "stub-kinzhal",
    slug: "kinzhal-kama-istoriya-formy-stub",
    title: "Кинжал кама: история одной формы",
    excerpt:
      "Прямой обоюдоострый клинок появился на Кавказе в XVII веке и почти не менялся до начала XX. Что застыло в этой геометрии?",
    coverImageUrl: "/images/weapons/kinzhal.jpg",
    coverImageAlt: "Кавказский кинжал кама",
    author: { name: "Амин Тесаев" },
    publishedAt: daysAgo(5),
    readingTimeMinutes: 6,
    category: "essay",
    tags: ["оружие", "кинжал"],
    body: [],
  },
  {
    id: "stub-archive-1924",
    slug: "zapiski-lesnika-1924-stub",
    title: "Записки лесника. Лето 1924 года",
    excerpt:
      "Архив Грозненского краеведческого музея сохранил тетрадь Заура Хамзатова: 84 страницы наблюдений о горных тропах, родниках и волках.",
    coverImageUrl: "/images/archive.webp",
    coverImageAlt: "Архивная тетрадь",
    author: { name: "Амин Тесаев" },
    publishedAt: daysAgo(9),
    readingTimeMinutes: 11,
    category: "archive",
    tags: ["архив", "1920е"],
    body: [],
  },
  {
    id: "stub-interview",
    slug: "razgovor-s-istorikom-stub",
    title: "Разговор с историком: как читать молчание архива",
    excerpt:
      "Что делать с дырами в источниках, когда документы исчезли вместе с теми, кто их хранил. Беседа о методе и этике.",
    coverImageUrl: "/images/warriors/voin.jpg",
    coverImageAlt: "Кавказский воин — гравюра XIX века",
    author: { name: "Амин Тесаев" },
    publishedAt: daysAgo(13),
    readingTimeMinutes: 14,
    category: "interview",
    tags: ["метод", "история"],
    body: [],
  },
  {
    id: "stub-memory",
    slug: "imena-kotorykh-ne-vernuli-stub",
    title: "Имена, которые не вернули",
    excerpt:
      "Эссе о том, как родовое имя выживает там, где не выжили документы. Память как форма архива — без бумаг, но с правилами.",
    coverImageUrl: "/images/warriors/khranitel-poroga.jpg",
    coverImageAlt: "Хранитель порога — портрет воина",
    author: { name: "Амин Тесаев" },
    publishedAt: daysAgo(18),
    readingTimeMinutes: 7,
    category: "memory",
    tags: ["память", "род"],
    body: [],
  },
  {
    id: "stub-long-essay",
    slug: "argunskoe-uschelie-stub",
    title:
      "Аргунское ущелье: как один день в горах объясняет тысячу лет архитектуры",
    excerpt:
      "Поездка с этнографом по Шатоевскому району Чечни. Развалины склепов, жилые башни, остатки боевых вышек — всё расположено не случайно, а по логике, которой больше нет. Попытка прочитать ландшафт глазами тех, кто здесь жил, и понять, почему вайнахи селились именно так, а не иначе.",
    coverImageUrl: "/images/hero-tower.webp",
    coverImageAlt: "Вид на Аргунское ущелье",
    author: { name: "Амин Тесаев" },
    publishedAt: daysAgo(22),
    readingTimeMinutes: 18,
    category: "research",
    tags: ["ущелье", "башни", "этнография"],
    body: [],
  },
  {
    id: "stub-news",
    slug: "yandeks-otsifroval-arkhiv-stub",
    title: "Сканы 19 века",
    excerpt: "Готовы первые 200 документов.",
    coverImageUrl: undefined,
    coverImageAlt: undefined,
    author: { name: "Амин Тесаев" },
    publishedAt: daysAgo(1),
    readingTimeMinutes: 1,
    category: "archive",
    tags: ["digital", "новость"],
    body: [],
  },
  {
    id: "stub-letter",
    slug: "pismo-iz-tiflisa-stub",
    title: "Письмо из Тифлиса, 1887 год",
    excerpt:
      "Короткая записка инженера Семёна Гулиева к брату: о дороге через перевал, о ночёвке в горном ауле и о разговоре, который он не понял, но запомнил дословно.",
    coverImageUrl: "/images/archive.webp",
    coverImageAlt: "Архивное письмо",
    author: { name: "Амин Тесаев" },
    publishedAt: daysAgo(25),
    readingTimeMinutes: 4,
    category: "archive",
    tags: ["письма", "1887"],
    body: [],
  },
];

// Merge real publications with stubs, preferring real ones by slug.
// Real entries keep their order; missing slugs are filled in from
// STUB_PUBLICATIONS at the end of the list.
export function withStubs(real: Publication[]): Publication[] {
  const realSlugs = new Set(real.map((p) => p.slug));
  const fillers = STUB_PUBLICATIONS.filter((p) => !realSlugs.has(p.slug));
  return [...real, ...fillers];
}
