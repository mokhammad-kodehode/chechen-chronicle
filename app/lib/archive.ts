// Тип материала. В Sanity станет enum в схеме `archiveItem`.
export type ArchiveKind = "document" | "photo" | "manuscript" | "map" | "audio";

// Язык первоисточника (отличается от UI-языка сайта).
export type ArchiveOriginalLanguage =
  | "ru"
  | "ar"
  | "ka"
  | "ce"
  | "tr"
  | "other";

export const ARCHIVE_KIND_BADGE: Record<ArchiveKind, string> = {
  document: "bg-amber-900 text-white",
  photo: "bg-stone-700 text-white",
  manuscript: "bg-rose-800 text-white",
  map: "bg-emerald-800 text-white",
  audio: "bg-indigo-800 text-white",
};

export type ArchiveItem = {
  id: string;
  slug: string;
  title: string;
  kind: ArchiveKind;
  /** Главное изображение или превью (для документа — скан первой страницы) */
  imageUrl?: string;
  /** Ссылка на оригинальный файл (PDF, DOC, MP3) */
  fileUrl?: string;
  fileType?: "pdf" | "doc" | "mp3" | "wav" | "image";
  /** Размер файла в байтах */
  fileSize?: number;
  /** Дата документа как написано: «1911», «около 1850», «XIX в.» */
  date: string;
  /** Числовой год для фильтров и сортировки */
  dateSortable: number;
  /** Имя места. В Sanity станет ref на place. */
  place?: string;
  /** Архив, фонд, коллекция */
  source?: string;
  /** Шифр документа в архиве */
  sourceCode?: string;
  /** Язык первоисточника */
  originalLanguage?: ArchiveOriginalLanguage;
  description: string;
  tags: string[];
  /** Slug-и связанных публикаций. В Sanity — refs. */
  relatedPublicationSlugs?: string[];
  /** Дата добавления в архив (ISO) — для сортировки «новые» */
  addedAt: string;
  featured?: boolean;
};

export const archiveItems: ArchiveItem[] = [
  {
    id: "a-001",
    slug: "pismo-uchitelya-vedeno-1911",
    title: "Письмо учителя из Ведено",
    kind: "document",
    date: "1911",
    dateSortable: 1911,
    place: "с. Ведено",
    source: "ЦГИА Грузии",
    sourceCode: "Ф. 422, оп. 3, д. 17",
    originalLanguage: "ru",
    description:
      "Письмо сельского учителя в Кавказский учебный округ о состоянии школьного дела. Описывает посещаемость, проблемы с обувью у детей, плату за обучение. Имя автора частично утрачено.",
    tags: ["образование", "школа", "XX век"],
    relatedPublicationSlugs: ["arxivnaya-nakhodka-pismo-1911"],
    addedAt: "2026-02-08",
    featured: true,
  },
  {
    id: "a-002",
    slug: "foto-bashnya-argun-1928",
    title: "Боевая башня в Аргунском ущелье",
    kind: "photo",
    imageUrl: "/images/hero-tower.webp",
    date: "1928",
    dateSortable: 1928,
    place: "Аргунское ущелье",
    source: "Этнографическая экспедиция АН СССР",
    sourceCode: "ЭЭ-1928/132",
    description:
      "Чёрно-белая фотография боевой башни XIV–XV веков в верховьях Аргуна. Снимок сделан во время экспедиции по изучению горной архитектуры.",
    tags: ["архитектура", "башня", "XX век", "экспедиция"],
    relatedPublicationSlugs: ["bashennoe-zodchestvo-vaynakhov"],
    addedAt: "2026-04-10",
  },
  {
    id: "a-003",
    slug: "rukopis-arabskaya-xviii",
    title: "Фрагмент арабской рукописи",
    kind: "manuscript",
    date: "вторая половина XVIII в.",
    dateSortable: 1770,
    place: "неизвестно",
    source: "Частная коллекция",
    originalLanguage: "ar",
    description:
      "Фрагмент богословского текста на арабском языке. Бумага восточного производства, чернила орешковые. Переплёт утрачен.",
    tags: ["рукопись", "арабский", "XVIII век", "богословие"],
    addedAt: "2025-11-14",
  },
  {
    id: "a-004",
    slug: "ukaz-o-zemle-1864",
    title: "Указ о земельной реформе",
    kind: "document",
    date: "1864",
    dateSortable: 1864,
    place: "Тифлис",
    source: "ЦГИА Грузии",
    sourceCode: "Ф. 12, оп. 1, д. 89",
    originalLanguage: "ru",
    description:
      "Указ Кавказской администрации о порядке распределения земель в горных обществах после окончания Кавказской войны. Машинописный экземпляр с правками.",
    tags: ["право", "земля", "XIX век", "Кавказская война"],
    addedAt: "2025-09-22",
  },
  {
    id: "a-005",
    slug: "karta-perevala-1882",
    title: "Карта горного перевала",
    kind: "map",
    date: "1882",
    dateSortable: 1882,
    place: "Главный Кавказский хребет",
    source: "Военно-топографическое управление",
    sourceCode: "ВТУ-1882/47",
    originalLanguage: "ru",
    description:
      "Топографическая карта одного из перевалов Главного хребта. Масштаб 1:42000. Подписи на русском, отметки высот в саженях.",
    tags: ["карта", "география", "XIX век"],
    addedAt: "2026-01-05",
  },
  {
    id: "a-006",
    slug: "foto-grozny-1937",
    title: "Групповой портрет, Грозный",
    kind: "photo",
    date: "1937",
    dateSortable: 1937,
    place: "г. Грозный",
    source: "Семейный архив",
    description:
      "Групповой портрет, предположительно служащих одного из учреждений Грозного. На обороте фотографии — частично сохранившаяся надпись с датой.",
    tags: ["портрет", "город", "XX век"],
    addedAt: "2026-03-30",
  },
  {
    id: "a-007",
    slug: "audio-rasskaz-starshego-1985",
    title: "Запись беседы со старейшиной",
    kind: "audio",
    date: "1985",
    dateSortable: 1985,
    place: "горное село",
    source: "Полевая запись",
    originalLanguage: "ce",
    description:
      "Запись беседы с пожилым жителем одного из горных сёл о традиционных обрядах и тейповой структуре. Длительность около 47 минут. Магнитофонная плёнка, оцифрована в 2019 году.",
    tags: ["устная история", "обряды", "XX век", "тейп"],
    addedAt: "2026-04-01",
  },
  {
    id: "a-008",
    slug: "proshenie-o-shkole-1898",
    title: "Прошение о строительстве школы",
    kind: "document",
    date: "1898",
    dateSortable: 1898,
    place: "Веденский округ",
    source: "ЦГИА Грузии",
    sourceCode: "Ф. 422, оп. 2, д. 53",
    originalLanguage: "ru",
    description:
      "Коллективное прошение жителей нескольких горных сёл к окружной администрации о выделении средств на строительство школы. С подписями старшин и печатями обществ.",
    tags: ["образование", "XIX век", "село"],
    addedAt: "2025-12-18",
  },
];

export function getAllArchiveItems(): ArchiveItem[] {
  return [...archiveItems].sort(
    (a, b) => +new Date(b.addedAt) - +new Date(a.addedAt)
  );
}

export function getFeaturedArchiveItem(): ArchiveItem | undefined {
  return archiveItems.find((i) => i.featured) ?? getAllArchiveItems()[0];
}

export function getArchiveItemBySlug(slug: string): ArchiveItem | undefined {
  return archiveItems.find((i) => i.slug === slug);
}

export function getAllArchiveKinds(): ArchiveKind[] {
  const set = new Set<ArchiveKind>();
  for (const i of archiveItems) set.add(i.kind);
  return Array.from(set);
}

export function getAllArchiveLanguages(): ArchiveOriginalLanguage[] {
  const set = new Set<ArchiveOriginalLanguage>();
  for (const i of archiveItems) {
    if (i.originalLanguage) set.add(i.originalLanguage);
  }
  return Array.from(set);
}

export function getArchiveYearRange(): { min: number; max: number } {
  const years = archiveItems.map((i) => i.dateSortable);
  return { min: Math.min(...years), max: Math.max(...years) };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
