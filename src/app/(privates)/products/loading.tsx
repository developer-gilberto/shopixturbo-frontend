const EIGHT = [1, 2, 3, 4, 5, 6, 7, 8];

export default function ProductsLoading() {
  return (
    <div className="space-y-6">
      <section className="rounded-card bg-card-bg p-6 shadow-card">
        <div className="mb-4">
          <div className="h-4 w-32 animate-pulse rounded bg-card-border" />
          <div className="mt-2 h-4 w-56 animate-pulse rounded bg-btn-muted" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="h-9 w-48 animate-pulse rounded-btn-input bg-btn-muted" />
          <div className="h-9 w-32 animate-pulse rounded-btn-input bg-btn-muted" />
        </div>
      </section>

      <section className="overflow-hidden rounded-card bg-card-bg shadow-card">
        <div className="flex items-center justify-between border-b border-card-border p-6">
          <div className="h-5 w-28 animate-pulse rounded bg-card-border" />
          <div className="h-4 w-16 animate-pulse rounded bg-btn-muted" />
        </div>

        <div className="hidden items-center gap-4 border-b border-card-border px-4 py-3 min-h-20 md:flex">
          <div className="w-28 shrink-0 pl-3">
            <div className="h-4 w-4 animate-pulse rounded bg-btn-muted" />
          </div>
          <div className="flex-1 pl-16">
            <div className="h-3 w-16 animate-pulse rounded bg-btn-muted" />
          </div>
          {[1, 2, 3, 4, 5, 6].map((key) => (
            <div key={key} className="w-20 shrink-0 text-center">
              <div className="mx-auto h-3 w-12 animate-pulse rounded bg-btn-muted" />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 border-b border-card-border py-2 min-h-20 pl-6 pr-4 md:hidden">
          <div className="h-4 w-4 animate-pulse rounded bg-btn-muted" />
          <div className="h-3 w-24 animate-pulse rounded bg-btn-muted" />
        </div>

        <ul className="divide-y divide-card-border">
          {EIGHT.map((key) => (
            <li key={key} className="px-2">
              <div className="flex items-center gap-3 px-2 py-4">
                <div className="h-4 w-4 shrink-0 animate-pulse rounded bg-btn-muted" />
                <div className="h-12 w-12 shrink-0 animate-pulse rounded-btn-input bg-btn-muted" />
                <div className="min-w-0 flex-1">
                  <div className="h-4 w-48 animate-pulse rounded bg-card-border" />
                  <div className="mt-1.5 h-3 w-32 animate-pulse rounded bg-btn-muted" />
                  <div className="mt-1.5 h-3 w-40 animate-pulse rounded bg-btn-muted" />
                </div>
                <div className="h-4 w-16 animate-pulse rounded bg-btn-muted" />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
