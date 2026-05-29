export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-12 md:py-16 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-border pb-5 gap-4">
        <div>
          <div className="h-9 w-40 bg-mist rounded" />
          <div className="mt-2 h-4 w-56 bg-mist rounded" />
        </div>
        <div className="h-9 w-28 bg-mist rounded-btn" />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((n) => (
          <div key={n} className="rounded-card border border-border bg-white p-6 h-40 flex flex-col justify-between">
            <div>
              <div className="h-5 w-32 bg-mist rounded" />
              <div className="mt-2.5 h-3.5 w-full bg-mist rounded" />
              <div className="mt-1 h-3.5 w-4/5 bg-mist rounded" />
            </div>
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
              <div className="h-4 w-24 bg-mist rounded" />
              <div className="h-4 w-4 bg-mist rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
