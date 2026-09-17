import { OrdersSkeleton } from '@/components/orders/orders-skeleton';

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

      <OrdersSkeleton />
    </div>
  );
}
