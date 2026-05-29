export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col px-5 py-12 md:py-20 animate-pulse">
      {/* Hero Section Skeleton */}
      <div className="text-center flex flex-col items-center">
        <div className="h-6 w-32 rounded-full bg-mist" />
        <div className="mt-4 h-10 w-3/4 max-w-sm rounded bg-mist" />
        <div className="mt-3 h-5 w-2/3 max-w-xs rounded bg-mist" />
      </div>

      {/* Spotlight Search Bar Skeleton */}
      <div className="mt-8 md:mt-10 relative w-full">
        <div className="h-14 w-full rounded-search bg-mist" />
      </div>

      {/* Quick Suggestions Skeleton */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <div className="h-4 w-24 rounded bg-mist" />
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="h-4 w-16 rounded bg-mist" />
        ))}
      </div>

      {/* Popular Papers preview list Skeleton */}
      <div className="mt-14 md:mt-18">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="h-4 w-40 rounded bg-mist" />
          <div className="h-4 w-20 rounded bg-mist" />
        </div>
        <div className="mt-3 divide-y divide-border border-b border-border">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-row px-3.5 py-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-mist" />
                  <div className="h-5 w-48 rounded bg-mist" />
                  <div className="h-4 w-16 rounded bg-mist" />
                </div>
                <div className="h-4 w-32 rounded bg-mist" />
              </div>
              <div className="h-6 w-10 rounded bg-mist" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
