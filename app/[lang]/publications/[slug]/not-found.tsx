import { LocalizedLink } from "@/app/components/common/LocalizedLink";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-amber-900/70">
        404
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-amber-950 md:text-4xl">
        Публикация не найдена
      </h1>
      <p className="mt-4 text-sm text-neutral-600">
        Возможно, материал был перемещён или ссылка устарела.
      </p>
      <LocalizedLink
        href="/publications"
        className="mt-8 inline-flex h-11 items-center justify-center rounded border border-amber-900 bg-amber-900 px-6 text-sm font-semibold text-white hover:bg-amber-800"
      >
        Все публикации
      </LocalizedLink>
    </section>
  );
}
