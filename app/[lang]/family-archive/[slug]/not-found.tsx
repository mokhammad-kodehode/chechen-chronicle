import { LocalizedLink } from "@/app/components/common/LocalizedLink";

// Static fallback copy: not-found boundaries don't receive route params,
// so this mirrors the Russian dictionary (the default locale).
export default function FamilyStoryNotFound() {
  return (
    <section className="bg-[#FBF7F0] py-24">
      <div className="mx-auto max-w-xl px-4 text-center">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-amber-950">
          История не найдена
        </h1>
        <p className="mt-4 text-[15px] leading-[1.7] text-amber-900/75">
          Возможно, её ещё проверяет редакция или ссылка устарела.
        </p>
        <LocalizedLink
          href="/family-archive"
          className="mt-8 inline-flex text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-900 hover:text-amber-950"
        >
          ← Народный архив
        </LocalizedLink>
      </div>
    </section>
  );
}
