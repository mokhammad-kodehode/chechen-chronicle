export default function Loading() {
  return (
    <>
      <section className="border-b border-amber-900/10 bg-[#FBF7F0] py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <div className="mx-auto h-7 w-48 animate-pulse rounded bg-amber-100" />
          <div className="mx-auto mt-6 h-12 w-72 animate-pulse rounded bg-amber-100" />
          <div className="mx-auto mt-5 h-4 w-full max-w-xl animate-pulse rounded bg-amber-100" />
        </div>
      </section>

      <section className="bg-white py-12 md:py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 lg:grid-cols-[280px_1fr]">
          <div className="h-[480px] animate-pulse rounded-lg bg-amber-50" />
          <div>
            <div className="mb-6 h-6 w-40 animate-pulse rounded bg-amber-50" />
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] animate-pulse rounded-lg bg-amber-50"
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
