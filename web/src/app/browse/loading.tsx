export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 md:py-12 animate-pulse">
      {/* Title */}
      <div className="h-7 w-40 rounded bg-mist" />
      <div className="mt-2 h-4 w-60 rounded bg-mist/60" />

      {/* Search bar skeleton */}
      <div className="mt-6 h-13 w-full rounded-search bg-mist" />

      {/* Filters skeleton */}
      <div className="mt-4 flex gap-2">
        <div className="h-[38px] w-24 rounded-btn bg-mist" />
        <div className="h-[38px] w-28 rounded-btn bg-mist" />
        <div className="h-[38px] w-24 rounded-btn bg-mist" />
        <div className="h-[38px] w-20 rounded-btn bg-mist" />
      </div>

      {/* Count skeleton */}
      <div className="mt-8 border-b border-border pb-2.5">
        <div className="h-4 w-44 rounded bg-mist" />
      </div>

      {/* Grid skeleton */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div
            key={n}
            className="rounded-card border border-border bg-white p-4 h-[160px] flex flex-col justify-between"
          >
            <div>
              <div className="h-3 w-28 rounded bg-mist" />
              <div className="mt-3 h-5 w-44 rounded bg-mist" />
            </div>
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
              <div className="h-3 w-16 rounded bg-mist" />
              <div className="h-4 w-20 rounded bg-mist" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
