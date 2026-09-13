export default function MyAccountLoading() {
  return (
    <div className="space-y-6">
      <section className="rounded-card bg-card-bg p-6 shadow-card">
        <div className="h-6 w-32 animate-pulse rounded bg-card-border" />
        <div className="mt-4 flex items-center gap-3">
          <div className="h-12 w-12 animate-pulse rounded-full bg-btn-muted" />
          <div className="space-y-2">
            <div className="h-4 w-40 animate-pulse rounded bg-btn-muted" />
            <div className="h-3 w-56 animate-pulse rounded bg-card-border" />
          </div>
        </div>
      </section>

      <section className="rounded-card bg-card-bg p-6 shadow-card md:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="h-20 w-20 shrink-0 animate-pulse rounded-full bg-btn-muted" />
          <div className="flex-1 space-y-3">
            <div className="h-7 w-64 animate-pulse rounded bg-card-border" />
            <div className="h-3 w-96 max-w-full animate-pulse rounded bg-btn-muted" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {[1, 2].map((key) => (
          <div key={key} className="rounded-card bg-card-bg p-6 shadow-card">
            <div className="h-4 w-28 animate-pulse rounded bg-btn-muted" />
            <div className="mt-4 space-y-3">
              <div className="flex justify-between">
                <div className="h-3 w-24 animate-pulse rounded bg-card-border" />
                <div className="h-3 w-32 animate-pulse rounded bg-btn-muted" />
              </div>
              <div className="flex justify-between">
                <div className="h-3 w-24 animate-pulse rounded bg-card-border" />
                <div className="h-3 w-32 animate-pulse rounded bg-btn-muted" />
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
