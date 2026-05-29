export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 md:py-12 animate-pulse">
      {/* Back link skeleton */}
      <div className="h-4 w-28 bg-mist rounded" />

      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        {/* Main content skeleton */}
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex flex-col gap-2 w-full max-w-md">
              <div className="h-5 w-48 bg-mist rounded" />
              <div className="h-8 w-80 max-w-full bg-mist rounded" />
              <div className="h-4 w-40 bg-mist rounded" />
            </div>
            <div className="flex gap-2">
              <div className="h-9 w-28 bg-mist rounded-btn" />
              <div className="h-9 w-32 bg-mist rounded-btn" />
            </div>
          </div>
          <div className="mt-6 h-[720px] w-full bg-mist rounded-card" />
        </div>

        {/* Sidebar skeleton */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="h-48 w-full bg-mist rounded-card" />
          <div className="mt-6 h-64 w-full bg-mist rounded-card" />
        </div>
      </div>
    </div>
  );
}
