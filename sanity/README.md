# Sanity schemas (draft)

Эта папка содержит **черновики** схем Sanity. Sanity ещё **не установлен** —
схемы лежат здесь и активируются при подключении CMS.

## Структура

```
sanity/
├── schemas/
│   ├── objects/
│   │   ├── localeString.ts    — мультиязычная короткая строка
│   │   └── localeText.ts      — мультиязычный многострочный текст
│   ├── documents/
│   │   ├── place.ts           — географическая точка
│   │   └── archiveItem.ts     — запись в архиве
│   └── index.ts               — реэкспорт всех схем
└── README.md
```

## Что появится при установке Sanity

Дополнительно нужны:

```
sanity/
├── sanity.config.ts            — конфиг Studio
├── sanity.cli.ts               — CLI-конфиг (deploy, dataset)
└── schemas/
    └── documents/
        ├── publication.ts      — портируется из app/lib/publications.ts
        ├── event.ts            — для таймлайна
        ├── period.ts           — историческая эпоха
        ├── person.ts           — автор / историческая личность
        └── category.ts         — рубрика публикаций
```

И в корне `app/`:

```
app/
└── studio/
    └── [[...tool]]/
        └── page.tsx            — встраиваем Studio в /studio
```

## Активация

Когда придёт время:

```bash
npm install sanity @sanity/vision @portabletext/react @sanity/image-url
npm install --save-dev @sanity/cli

# Создать проект на sanity.io, получить projectId / dataset
# Создать .env.local с переменными:
#   NEXT_PUBLIC_SANITY_PROJECT_ID=...
#   NEXT_PUBLIC_SANITY_DATASET=production

# Снять @ts-nocheck с файлов в этой папке.
# Создать sanity.config.ts, который импортирует schemaTypes из ./schemas/index.
# Поднять Studio локально:
npx sanity dev
```

После этого `tsconfig.json` в корне можно вернуть к `"exclude": ["node_modules"]` —
эта папка получит свою конфигурацию через Sanity.
