export default function Loading() {
  return (
    <>
      <section className="border-b border-amber-900/10 bg-[#FBF7F0] py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="h-3 w-32 animate-pulse rounded bg-amber-100" />
          <div className="mt-6 h-6 w-32 animate-pulse rounded bg-amber-100" />
          <div className="mt-4 h-12 w-full max-w-2xl animate-pulse rounded bg-amber-100" />
        </div>
      </section>

      <section className="bg-white py-12 md:py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[1fr_360px]">
          <div className="aspect-[3/4] animate-pulse rounded-lg bg-amber-50" />
          <div className="space-y-4">
            <div className="h-44 animate-pulse rounded-lg bg-amber-50" />
            <div className="h-32 animate-pulse rounded-lg bg-amber-50" />
          </div>
        </div>
      </section>
    </>
  );
}
