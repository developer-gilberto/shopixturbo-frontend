const FIVE = [1, 2, 3, 4, 5];
const FOUR = [1, 2, 3, 4];
const TWO = [1, 2];

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <section className="rounded-card bg-card-bg p-6 shadow-card md:p-8">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="h-4 w-48 animate-pulse rounded bg-card-border" />
            <div className="h-8 w-60 animate-pulse rounded bg-btn-muted" />
          </div>
          <div className="h-8 w-32 animate-pulse rounded-btn-input bg-btn-muted" />
        </div>

        <div className="mb-6 h-10 w-full animate-pulse rounded-full bg-btn-muted sm:h-12" />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {FIVE.map((key) => (
            <div key={key} className="flex flex-col gap-2">
              <div className="h-5 w-5 animate-pulse rounded-full bg-btn-muted" />
              <div className="h-4 w-24 animate-pulse rounded bg-card-border" />
              <div className="h-5 w-20 animate-pulse rounded bg-btn-muted" />
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FOUR.map((key) => (
          <div
            key={key}
            className="flex min-h-35 flex-col justify-between rounded-card bg-card-bg p-6 shadow-card"
          >
            <div className="flex items-start justify-between">
              <div className="h-5 w-28 animate-pulse rounded bg-card-border" />
              <div className="h-6 w-6 animate-pulse rounded bg-btn-muted" />
            </div>
            <div className="h-8 w-36 animate-pulse rounded bg-btn-muted" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {TWO.map((columnKey) => (
          <section
            key={columnKey}
            className="overflow-hidden rounded-card bg-card-bg shadow-card"
          >
            <div className="flex items-center justify-between border-b border-card-border p-6">
              <div className="h-5 w-48 animate-pulse rounded bg-card-border" />
              <div className="h-4 w-20 animate-pulse rounded bg-btn-muted" />
            </div>
            <div className="divide-y divide-card-border">
              {FIVE.map((rowKey) => (
                <div
                  key={rowKey}
                  className="flex items-center justify-between p-4"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="h-4 w-4 animate-pulse rounded bg-card-border" />
                    <div className="h-12 w-12 animate-pulse rounded-btn-input bg-btn-muted" />
                    <div className="flex flex-col gap-1.5">
                      <div className="h-4 w-40 animate-pulse rounded bg-card-border" />
                      <div className="h-3 w-24 animate-pulse rounded bg-btn-muted" />
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="h-4 w-16 animate-pulse rounded bg-btn-muted" />
                    <div className="h-3 w-12 animate-pulse rounded bg-card-border" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
