const EIGHT = [1, 2, 3, 4, 5, 6, 7, 8];
const FOUR = [1, 2, 3, 4];
const COLUMNS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function OrdersLoading() {
  return (
    <div className="space-y-6">
      <section className="rounded-card bg-card-bg p-6 shadow-card">
        <div className="mb-4">
          <div className="h-4 w-32 animate-pulse rounded bg-card-border" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-btn-muted" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="h-9 w-48 animate-pulse rounded-btn-input bg-btn-muted" />
          <div className="h-9 w-32 animate-pulse rounded-btn-input bg-btn-muted" />
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

      <section className="rounded-card bg-card-bg shadow-card">
        <div className="flex items-center justify-between border-b border-card-border p-6">
          <div className="h-5 w-52 animate-pulse rounded bg-card-border" />
          <div className="h-4 w-16 animate-pulse rounded bg-btn-muted" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1400px] border-collapse text-left">
            <thead className="bg-card-bg shadow-[0_1px_0_0_var(--color-card-border)]">
              <tr>
                {COLUMNS.map((key) => (
                  <th key={key} className="px-4 py-3">
                    <div className="h-3 w-16 animate-pulse rounded bg-btn-muted" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {EIGHT.map((key) => (
                <tr key={key} className="align-top">
                  <td className="min-w-72 px-4 py-4">
                    <div className="rounded-btn-input border border-card-border bg-page-bg p-2">
                      <div className="flex items-start gap-2">
                        <div className="h-10 w-10 shrink-0 animate-pulse rounded-[0.35rem] bg-btn-muted" />
                        <div className="min-w-0 flex-1">
                          <div className="h-4 w-36 animate-pulse rounded bg-card-border" />
                          <div className="mt-1.5 h-3 w-24 animate-pulse rounded bg-btn-muted" />
                          <div className="mt-1.5 h-3 w-28 animate-pulse rounded bg-btn-muted" />
                        </div>
                      </div>
                    </div>
                  </td>
                  {[1, 2, 3, 4, 5, 6, 7].map((column) => (
                    <td key={column} className="px-4 py-4 text-center">
                      <div className="mx-auto h-4 w-12 animate-pulse rounded bg-btn-muted" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
