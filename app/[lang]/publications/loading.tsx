export default function Loading() {
  return (
    <>
      {/* FEATURED BANNER skeleton — mirrors FeaturedBanner (cream parchment,
          cover image left + editorial block right). */}
      <section className="relative overflow-hidden bg-[#F4EFE3]">
        <div className="relative mx-auto max-w-7xl px-6 pt-6 md:pt-8">
          <div className="grid grid-cols-1 gap-8 pt-6 pb-12 md:grid-cols-[1.15fr_1fr] md:gap-12 md:pt-8 md:pb-16">
            <div className="skeleton-shimmer-dim aspect-[4/3] w-full rounded md:aspect-[5/4]" />
            <div className="flex flex-col justify-center gap-5">
              <div className="flex gap-3">
                <div className="skeleton-shimmer h-6 w-28 rounded-full" />
                <div className="skeleton-shimmer h-6 w-24 rounded" />
              </div>
              <div className="space-y-3">
                <div className="skeleton-shimmer h-10 w-full rounded" />
                <div className="skeleton-shimmer h-10 w-3/4 rounded" />
              </div>
              <div className="space-y-2">
                <div className="skeleton-shimmer h-4 w-full rounded" />
                <div className="skeleton-shimmer h-4 w-4/5 rounded" />
              </div>
              <div className="skeleton-shimmer h-3 w-56 rounded" />
              <div className="skeleton-shimmer h-3 w-40 rounded" />
            </div>
          </div>
        </div>
      </section>

      {/* BODY skeleton — list, same paddings/gutters as the real page. */}
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          {/* Section heading row */}
          <div className="mb-8 flex items-end justify-between gap-4">
            <div className="skeleton-shimmer h-8 w-52 rounded" />
            <div className="skeleton-shimmer hidden h-4 w-40 rounded md:block" />
          </div>

          {/* Filter pills + search */}
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {[6, 8, 7, 6, 7].map((w, i) => (
                <div
                  key={i}
                  className="skeleton-shimmer h-9 rounded-full"
                  style={{ width: `${w * 12}px` }}
                />
              ))}
            </div>
            <div className="skeleton-shimmer h-10 w-64 rounded" />
          </div>

          {/* Cards grid — same as real (3 col on lg, 2 on sm, 1 on mobile) */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <article
                key={i}
                className="overflow-hidden rounded-lg border border-amber-900/15 bg-white shadow-sm"
              >
                <div className="skeleton-shimmer-dim relative aspect-[16/10]" />
                <div className="space-y-4 px-5 py-5">
                  <div className="space-y-2">
                    <div className="skeleton-shimmer h-5 w-full rounded" />
                    <div className="skeleton-shimmer h-5 w-3/4 rounded" />
                  </div>
                  <div className="space-y-2">
                    <div className="skeleton-shimmer h-3 w-full rounded" />
                    <div className="skeleton-shimmer h-3 w-11/12 rounded" />
                    <div className="skeleton-shimmer h-3 w-2/3 rounded" />
                  </div>
                  <div className="flex items-center justify-between border-t border-amber-900/10 pt-4">
                    <div className="flex items-center gap-2">
                      <div className="skeleton-shimmer h-5 w-5 rounded-full" />
                      <div className="skeleton-shimmer h-3 w-32 rounded" />
                    </div>
                    <div className="skeleton-shimmer h-3 w-16 rounded" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
