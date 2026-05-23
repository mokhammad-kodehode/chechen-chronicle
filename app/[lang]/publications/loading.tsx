export default function Loading() {
  return (
    <>
      {/* HERO skeleton — same layout/size as PublicationsHero */}
      <section className="relative overflow-hidden border-b border-amber-900/10 bg-paper">
        <div className="relative mx-auto flex min-h-[65svh] max-w-6xl items-center px-4 py-16 md:min-h-[70svh] md:py-24">
          <div className="mx-auto w-full min-w-0 max-w-3xl text-center">
            {/* Book ornament placeholder (~44x44) */}
            <div className="skeleton-shimmer mx-auto mb-6 h-11 w-11 rounded" />

            {/* Title — matches h1 4xl/5xl/6xl */}
            <div className="skeleton-shimmer mx-auto h-12 w-72 rounded sm:h-14 sm:w-96 md:h-16 md:w-[28rem]" />

            {/* Description — two-line block */}
            <div className="mx-auto mt-5 max-w-2xl space-y-2">
              <div className="skeleton-shimmer h-4 w-full rounded" />
              <div className="skeleton-shimmer mx-auto h-4 w-4/5 rounded" />
            </div>

            {/* Bottom diamond ornament */}
            <div className="mt-10 flex items-center justify-center gap-4">
              <span className="skeleton-shimmer h-px w-20 rounded" />
              <span className="skeleton-shimmer h-1.5 w-1.5 rotate-45" />
              <span className="skeleton-shimmer h-px w-20 rounded" />
            </div>
          </div>
        </div>
      </section>

      {/* BODY skeleton — same paddings/gutters as real page */}
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          {/* Featured card skeleton — 5-col grid: 3 image, 2 text */}
          <div className="mb-16 overflow-hidden rounded-xl border border-amber-900/15 bg-white shadow-sm">
            <div className="grid md:grid-cols-5">
              <div className="skeleton-shimmer-dim relative aspect-[16/10] md:col-span-3 md:aspect-auto md:min-h-[360px]" />
              <div className="flex flex-col justify-between gap-8 p-6 md:col-span-2 md:p-10">
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="skeleton-shimmer h-6 w-24 rounded-full" />
                    <div className="skeleton-shimmer h-4 w-20 rounded" />
                  </div>
                  <div className="space-y-3">
                    <div className="skeleton-shimmer h-7 w-full rounded" />
                    <div className="skeleton-shimmer h-7 w-4/5 rounded" />
                  </div>
                  <div className="space-y-2">
                    <div className="skeleton-shimmer h-4 w-full rounded" />
                    <div className="skeleton-shimmer h-4 w-11/12 rounded" />
                    <div className="skeleton-shimmer h-4 w-3/5 rounded" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="skeleton-shimmer h-6 w-6 rounded-full" />
                    <div className="skeleton-shimmer h-3 w-40 rounded" />
                  </div>
                  <div className="skeleton-shimmer h-11 w-36 rounded" />
                </div>
              </div>
            </div>
          </div>

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
