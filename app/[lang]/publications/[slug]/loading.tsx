export default function Loading() {
  return (
    <>
      {/* HERO skeleton — matches publication detail hero (dark) */}
      <section className="relative overflow-hidden bg-amber-950">
        <div className="absolute inset-0 bg-gradient-to-t from-amber-950 via-amber-950/70 to-amber-950/30" />
        <div className="relative mx-auto max-w-3xl px-4 py-20 md:py-28">
          {/* Back link placeholder */}
          <div className="skeleton-shimmer-dim h-3 w-32 rounded" />

          {/* Category badge placeholder */}
          <div className="skeleton-shimmer-dim mt-6 h-7 w-28 rounded-full" />

          {/* Title — two lines */}
          <div className="mt-6 space-y-3">
            <div className="skeleton-shimmer-dim h-10 w-full max-w-2xl rounded md:h-14" />
            <div className="skeleton-shimmer-dim h-10 w-4/5 max-w-xl rounded md:h-14" />
          </div>

          {/* Excerpt — three lines */}
          <div className="mt-6 max-w-2xl space-y-2">
            <div className="skeleton-shimmer-dim h-4 w-full rounded" />
            <div className="skeleton-shimmer-dim h-4 w-11/12 rounded" />
            <div className="skeleton-shimmer-dim h-4 w-3/4 rounded" />
          </div>

          {/* Meta row — avatar + name + date + reading time */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="skeleton-shimmer-dim h-6 w-6 rounded-full" />
            <div className="skeleton-shimmer-dim h-3 w-32 rounded" />
            <span className="h-1 w-1 rounded-full bg-white/20" />
            <div className="skeleton-shimmer-dim h-3 w-28 rounded" />
            <span className="h-1 w-1 rounded-full bg-white/20" />
            <div className="skeleton-shimmer-dim h-3 w-20 rounded" />
          </div>
        </div>
      </section>

      {/* BODY skeleton */}
      <section className="bg-[#FBF7F0] py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4">
          {/* Ornament */}
          <div className="mb-10 flex items-center justify-center gap-4 md:mb-14">
            <span className="skeleton-shimmer h-px w-20 rounded" />
            <span className="skeleton-shimmer h-4 w-4 rotate-45" />
            <span className="skeleton-shimmer h-px w-20 rounded" />
          </div>

          {/* Paragraphs — mimic article-body rhythm */}
          <div className="space-y-6">
            {[
              [100, 100, 100, 100, 70],
              [100, 90, 60],
              [100, 100, 100, 80],
              [100, 100, 50],
              [100, 100, 100, 100, 100, 65],
            ].map((widths, i) => (
              <div key={i} className="space-y-3">
                {widths.map((w, j) => (
                  <div
                    key={j}
                    className="skeleton-shimmer h-4 rounded"
                    style={{ width: `${w}%` }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
