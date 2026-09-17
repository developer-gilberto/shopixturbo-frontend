import { redirect } from 'next/navigation';
import { OrderIdSearchForm } from '@/components/orders/order-id-search-form';
import { OrderSearchForm } from '@/components/orders/order-search-form';
import { OrdersContent } from '@/components/orders/orders-content';
import { ConnectShopeeButton } from '@/components/ui/connect-shopee-button';
import {
  DEFAULT_INTERVAL_DAYS,
  DEFAULT_ORDER_STATUS,
  INTERVAL_DAYS_OPTIONS,
  ORDER_STATUSES,
} from '@/components/ui/order-status-options';
import { verifySession } from '@/lib/dal';
import { getShopIdFromCookie } from '@/lib/session';

export default async function Orders({
  searchParams,
}: {
  searchParams: Promise<{
    order_status?: string | string[];
    interval_days?: string | string[];
    order_id?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const rawStatus = Array.isArray(params.order_status)
    ? params.order_status[0]
    : params.order_status;
  const requestedStatus =
    typeof rawStatus === 'string' &&
    ORDER_STATUSES.some(({ value }) => value === rawStatus)
      ? rawStatus
      : undefined;
  const orderStatus = requestedStatus ?? DEFAULT_ORDER_STATUS;

  const rawInterval = Array.isArray(params.interval_days)
    ? params.interval_days[0]
    : params.interval_days;
  const intervalDays =
    typeof rawInterval === 'string' &&
    INTERVAL_DAYS_OPTIONS.some(({ value }) => value === rawInterval)
      ? rawInterval
      : DEFAULT_INTERVAL_DAYS;

  const rawOrderId = Array.isArray(params.order_id)
    ? params.order_id[0]
    : params.order_id;
  const orderId = rawOrderId?.trim() || undefined;

  if (
    orderId === undefined &&
    orderStatus === DEFAULT_ORDER_STATUS &&
    intervalDays === DEFAULT_INTERVAL_DAYS &&
    Object.keys(params).length > 0
  ) {
    redirect('/orders');
  }

  const { user } = await verifySession();
  const shopId = user.shop?.id ?? (await getShopIdFromCookie());

  const searchCards = (
    <>
      <section className="rounded-card bg-card-bg p-6 shadow-card">
        <div className="mb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-label">
            Buscar pedido
          </h2>
          <p className="mt-1 text-sm text-subtitle">
            Encontre um pedido específico pelo ID.
          </p>
        </div>
        <OrderIdSearchForm defaultValue={orderId} />
      </section>

      <section className="rounded-card bg-card-bg p-6 shadow-card">
        <div className="mb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-label">
            Buscar pedidos
          </h2>
          <p className="mt-1 text-sm text-subtitle">
            Encontre seus pedidos pelo status e veja custos, impostos e lucro de
            cada um.
          </p>
        </div>
        <OrderSearchForm
          defaultValue={orderStatus}
          defaultIntervalDays={intervalDays}
        />
      </section>
    </>
  );

  if (!shopId) {
    return (
      <div className="space-y-6">
        {searchCards}
        <section className="rounded-card bg-card-bg p-6 text-center shadow-card">
          <p className="text-lg font-bold text-heading">
            Nenhuma loja vinculada à sua conta
          </p>
          <p className="mt-2 text-sm text-body">
            Vincule sua loja para acompanhar os pedidos.
          </p>
          <div className="mt-6 flex justify-center">
            <ConnectShopeeButton highlight />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {searchCards}
      <OrdersContent
        orderStatus={orderStatus}
        intervalDays={Number(intervalDays)}
        orderId={orderId}
        shopName={user.shop?.name ?? 'Sem loja'}
        marketplace={user.shop?.marketplace ?? 'shopee'}
        userName={user.name}
      />
    </div>
  );
}
