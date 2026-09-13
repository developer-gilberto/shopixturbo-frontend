import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Fragment } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import { FaSackDollar } from 'react-icons/fa6';
import { HiOutlineCube } from 'react-icons/hi';
import { LiaFileInvoiceDollarSolid } from 'react-icons/lia';
import { LuClipboardList } from 'react-icons/lu';
import { TbDatabaseDollar } from 'react-icons/tb';
import { OrderIdSearchForm } from '@/components/orders/order-id-search-form';
import { OrderSearchForm } from '@/components/orders/order-search-form';
import { ConnectShopeeButton } from '@/components/ui/connect-shopee-button';
import { CopyText } from '@/components/ui/copy-text';
import { Notice } from '@/components/ui/notice';
import {
  DEFAULT_INTERVAL_DAYS,
  DEFAULT_ORDER_STATUS,
  INTERVAL_DAYS_OPTIONS,
  ORDER_STATUSES,
} from '@/components/ui/order-status-options';
import { verifySession } from '@/lib/dal';
import { getShopIdFromCookie, getTokenFromCookie } from '@/lib/session';

interface OrderItem {
  item_id: number;
  item_name: string;
  sku: string | null;
  quantity: number;
  unit_price: number;
  unit_cost: number | null;
  unit_government_taxes: number | null;
  total_government_taxes: number | null;
  revenue: number;
  total_cost: number | null;
  net_profit: number | null;
  is_matched_to_product: boolean;
}

interface Order {
  order_sn: string;
  order_status: string;
  payment_method: string;
  total_amount: number;
  shipping_paid_by_seller: number;
  shopee_commission: number;
  total_government_taxes: number;
  items_cost: number | null;
  total_cost: number | null;
  margin_percent: number | null;
  net_profit_margin: number | null;
  has_partial_cost_data: boolean;
  items_breakdown: OrderItem[];
}

interface OrdersSummary {
  total_orders: number;
  total_revenue: number;
  total_shipping: number;
  total_shopee_commission: number;
  total_items_cost: number | null;
  total_cost: number | null;
  total_government_taxes: number;
  total_net_profit: number | null;
  overall_margin_percent: number | null;
  orders_with_missing_cost_data: string[];
  products_with_missing_cost_data: number[];
  unmatched_item_skus: string[];
}

interface OrdersResponse {
  orders: Order[];
  summary: OrdersSummary;
}

interface OrderDetailItem {
  item_id: number;
  item_name: string;
  item_sku: string;
  model_quantity_purchased: number;
  model_discounted_price: number;
  model_original_price: number;
  image_info: { image_url: string | null } | null;
}

interface OrderDetail {
  order_sn: string;
  order_status: string;
  payment_method: string;
  total_amount: number;
  create_time: number;
  update_time: number;
  item_list: OrderDetailItem[];
}

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const INTEGER = new Intl.NumberFormat('pt-BR');

const DEFAULT_PAGE_SIZE = 50;
const TIME_RANGE_FIELD = 'update_time';

function formatBRL(value: number | null | undefined): string {
  if (value == null) return '—';
  return BRL.format(value);
}

function formatNumber(value: number | null | undefined): string {
  if (value == null) return '0';
  return INTEGER.format(value);
}

function formatPercent(value: number | null | undefined): string {
  if (value == null) return '—';
  return `${value.toFixed(1).replace('.', ',')}%`;
}

function statusLabel(raw: string): string {
  return ORDER_STATUSES.find(({ value }) => value === raw)?.label ?? raw;
}

function taxPercent(order: Order): number {
  return order.total_amount > 0
    ? (order.total_government_taxes / order.total_amount) * 100
    : 0;
}

function Cell({
  value,
  sub,
  className = 'text-heading',
}: {
  value: string;
  sub?: string;
  className?: string;
}) {
  return (
    <div className={`text-sm font-bold ${className}`}>
      {value}
      {sub ? <p className="text-[10px] font-medium text-label">{sub}</p> : null}
    </div>
  );
}

function MissingCell() {
  return (
    <div className="flex items-center justify-center text-alert-text">
      <FaExclamationTriangle className="text-sm" />
    </div>
  );
}

function formatTimestamp(epochSeconds: number | null | undefined): string {
  if (epochSeconds == null || epochSeconds <= 0) return '—';
  return new Date(epochSeconds * 1000).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function SearchedOrderCard({ order }: { order: OrderDetail }) {
  return (
    <div className="overflow-hidden rounded-card border border-card-border">
      <div className="flex flex-col gap-3 border-b border-card-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <CopyText label="ID Pedido" value={order.order_sn} />
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
          <div>
            <p className="text-[10px] font-bold uppercase text-label">Status</p>
            <p className="text-sm font-bold text-heading">
              {statusLabel(order.order_status)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-label">
              Pagamento
            </p>
            <p className="text-sm font-bold text-heading">
              {order.payment_method || '-'}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-label">Data</p>
            <p className="text-sm font-bold text-heading">
              {formatTimestamp(order.create_time)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase text-label">Total</p>
          <p className="text-sm font-bold text-heading">
            {formatBRL(order.total_amount)}
          </p>
        </div>
      </div>

      <ul className="divide-y divide-card-border">
        {order.item_list.map((item) => (
          <li key={item.item_id} className="flex items-center gap-3 p-4">
            {item.image_info?.image_url ? (
              <Image
                src={item.image_info.image_url}
                alt={item.item_name}
                width={48}
                height={48}
                className="h-12 w-12 shrink-0 rounded-btn-input object-cover"
              />
            ) : (
              <div className="h-12 w-12 shrink-0 rounded-btn-input bg-btn-muted flex items-center justify-center text-label">
                <HiOutlineCube className="text-xl" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-body">
                {item.item_name}
              </p>
              <CopyText label="SKU" value={item.item_sku || '-'} />
            </div>

            <div className="shrink-0 text-center">
              <p className="text-[10px] font-bold uppercase text-label">Qtd</p>
              <p className="text-sm font-bold text-heading">
                {formatNumber(item.model_quantity_purchased)}
              </p>
            </div>

            <div className="w-32 shrink-0 text-right">
              <p className="text-[10px] font-bold uppercase text-label">
                Preço unitário
              </p>
              <p className="text-sm font-bold text-heading">
                {formatBRL(item.model_discounted_price)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

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
  const token = await getTokenFromCookie();
  const shopId = user.shop?.id ?? (await getShopIdFromCookie());

  const searchCard = (
    <section className="rounded-card bg-card-bg p-6 shadow-card">
      <div className="mb-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-label">
          Buscar pedidos
        </h2>
        <p className="mt-1 text-sm text-subtitle">
          Encontre seus pedidos pelo status e veja custos, impostos e lucro de cada
          um.
        </p>
      </div>
      <OrderSearchForm
        defaultValue={orderStatus}
        defaultIntervalDays={intervalDays}
      />
    </section>
  );

  const orderIdSearchCard = (
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
  );

  if (!shopId) {
    return (
      <div className="space-y-6">
        {orderIdSearchCard}
        {searchCard}
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

  const statusLabelText = statusLabel(orderStatus);

  let searchedOrders: OrderDetail[] = [];
  let orderSearchError: string | null = null;

  if (orderId) {
    try {
      const detailsUrl = `${process.env.BACKEND_URL}/orders/details/${shopId}?order_id_list=${encodeURIComponent(orderId)}`;

      const detailsResponse = await fetch(detailsUrl, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });

      if (!detailsResponse.ok) {
        orderSearchError =
          'Não foi possível buscar o pedido. Tente novamente mais tarde.';
      } else {
        const payload = (await detailsResponse.json()) as unknown;
        const list = Array.isArray(
          (payload as { order_list?: unknown }).order_list,
        )
          ? ((payload as { order_list: unknown }).order_list as OrderDetail[])
          : [];

        const exact = list.filter(
          (order) => order.order_sn.toLowerCase() === orderId.toLowerCase(),
        );

        searchedOrders = exact;

        if (exact.length === 0) {
          orderSearchError = `Nenhum pedido encontrado com o ID ${orderId}.`;
        }
      }
    } catch {
      orderSearchError =
        'Não foi possível buscar o pedido. Tente novamente mais tarde.';
    }
  }

  let data: OrdersResponse;

  try {
    const url = `${process.env.BACKEND_URL}/report/orders/${shopId}?offset=0&page_size=${DEFAULT_PAGE_SIZE}&order_status=${orderStatus}&time_range_field=${TIME_RANGE_FIELD}&interval_days=${intervalDays}`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (response.status === 404) {
      return (
        <div className="space-y-6">
          {orderIdSearchCard}
          {searchCard}
          <section className="rounded-card bg-card-bg p-6 shadow-card">
            <p className="font-bold text-heading">
              Nenhum pedido encontrado nos últimos {Number(intervalDays)} dias
              com o status {statusLabelText}.
            </p>
          </section>
        </div>
      );
    }

    if (!response.ok) {
      throw new Error(`Falha ao buscar pedidos da loja (${response.status})`);
    }

    data = (await response.json()) as OrdersResponse;
  } catch {
    return (
      <div className="space-y-6">
        {orderIdSearchCard}
        {searchCard}
        <section className="rounded-card bg-card-bg p-6 shadow-card">
          <p className="font-bold text-heading">
            Não foi possível carregar os pedidos.
          </p>
          <p className="mt-2 text-sm text-body">Tente novamente mais tarde.</p>
        </section>
      </div>
    );
  }

  const { orders, summary } = data;
  const missingCostCount = summary.orders_with_missing_cost_data.length;

  const uniqueItemIds = [
    ...new Set(
      orders.flatMap((order) =>
        order.items_breakdown.map((item) => String(item.item_id)),
      ),
    ),
  ];

  const productImageByItemId = new Map<string, string>();

  if (uniqueItemIds.length > 0) {
    const imageResults = await Promise.allSettled(
      uniqueItemIds.map((itemId) =>
        fetch(
          `${process.env.BACKEND_URL}/products/${shopId}?product_id=${encodeURIComponent(itemId)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
          },
        ).then(async (response) => {
          if (!response.ok) return null;

          const data = (await response.json()) as unknown;
          const candidate = Array.isArray(data)
            ? data[0]
            : typeof data === 'object' && data !== null
              ? ((data as Record<string, unknown>).product ?? data)
              : null;

          if (typeof candidate !== 'object' || candidate === null) {
            return null;
          }

          const imageUrl = (candidate as { image_url?: unknown }).image_url;
          return {
            itemId,
            imageUrl:
              typeof imageUrl === 'string' && imageUrl !== '' ? imageUrl : null,
          };
        }),
      ),
    );

    for (const result of imageResults) {
      if (
        result.status === 'fulfilled' &&
        result.value?.imageUrl &&
        !productImageByItemId.has(result.value.itemId)
      ) {
        productImageByItemId.set(result.value.itemId, result.value.imageUrl);
      }
    }
  }

  const missingProductIds = summary.products_with_missing_cost_data ?? [];
  const cadastrarHref =
    missingProductIds.length > 0
      ? `/products?product_ids=${missingProductIds.join(',')}`
      : '/products';

  const SUMMARY_CARDS = [
    {
      label: 'Total Pedidos',
      value: formatNumber(summary.total_orders),
      icon: <LuClipboardList className="text-3xl" />,
    },
    {
      label: 'Faturamento Bruto',
      value: formatBRL(summary.total_revenue),
      icon: <TbDatabaseDollar className="text-3xl" />,
    },
    {
      label: 'Total Custos',
      value: formatBRL(summary.total_cost),
      icon: <LiaFileInvoiceDollarSolid className="text-3xl" />,
    },
    {
      label: 'Lucro Líquido',
      value: formatBRL(summary.total_net_profit),
      positive: (summary.total_net_profit ?? 0) >= 0,
      icon: <FaSackDollar className="text-3xl" />,
    },
  ];

  return (
    <div className="space-y-6">
      {orderIdSearchCard}
      {searchCard}

      {orderId ? (
        <section className="overflow-hidden rounded-card bg-card-bg shadow-card">
          <div className="flex items-center justify-between border-b border-card-border p-6">
            <h2 className="text-lg font-bold uppercase tracking-widest text-heading">
              Resultado da busca
            </h2>
            <Link
              href="/orders"
              className="text-xs font-bold uppercase text-label underline decoration-2 underline-offset-4 hover:text-heading"
            >
              Limpar busca
            </Link>
          </div>
          <div className="p-6">
            {orderSearchError ? (
              <Notice text={orderSearchError}>
                <FaExclamationTriangle className="shrink-0 text-xl" />
              </Notice>
            ) : null}
            {searchedOrders.map((order) => (
              <div
                key={order.order_sn}
                className={searchedOrders.length > 1 ? '[&+&]:mt-6' : ''}
              >
                <SearchedOrderCard order={order} />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {missingCostCount > 0 ? (
        <div className="flex items-center justify-between gap-4 rounded-card bg-alert-bg border-l-4 border-l-primary-pressed p-4">
          <div className="flex items-center gap-3">
            <FaExclamationTriangle className="text-alert-text shrink-0" />
            <p className="text-sm font-semibold text-alert-text">
              {missingCostCount}{' '}
              {missingCostCount === 1 ? 'pedido possui' : 'pedidos possuem'}{' '}
              produtos sem dados de custo cadastrado. Cadastre os custos para
              ter precisão no lucro.
            </p>
          </div>
          <Link
            href={cadastrarHref}
            className="shrink-0 text-xs font-black uppercase text-alert-text underline decoration-2 underline-offset-4 hover:opacity-80 print:hidden"
          >
            Cadastrar
          </Link>
        </div>
      ) : null}

      {/* Cards resumo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SUMMARY_CARDS.map((card) => {
          const isLucro = card.positive !== undefined;

          return (
            <div
              key={card.label}
              className={`flex min-h-35 flex-col justify-between rounded-card p-6 text-white ${
                isLucro
                  ? `shadow-xl ${
                      card.positive
                        ? 'bg-profit shadow-profit/10'
                        : 'bg-prejudice shadow-prejudice/10'
                    }`
                  : 'bg-card-bg text-inherit shadow-card'
              }`}
            >
              <div className="flex items-start justify-between">
                <span
                  className={`text-[20px] font-bold uppercase tracking-widest ${
                    isLucro ? 'text-white/80' : 'text-label'
                  }`}
                >
                  {card.label}
                </span>
                <span
                  className={`shrink-0 ${isLucro ? 'text-white' : 'text-label'}`}
                >
                  {card.icon}
                </span>
              </div>
              <div>
                <p
                  className={`text-2xl font-extrabold ${
                    isLucro ? 'text-white text-3xl' : 'text-heading'
                  }`}
                >
                  {card.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabela de pedidos */}
      <section className="rounded-card bg-card-bg shadow-card">
        <div className="flex items-center justify-between border-b border-card-border p-6">
          <h2 className="text-lg font-bold uppercase tracking-widest text-heading">
            Pedidos — {statusLabelText}
          </h2>
          <span className="text-xs font-bold uppercase text-label">
            {formatNumber(orders.length)} pedidos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-350 border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-card-bg shadow-[0_1px_0_0_var(--color-card-border)] [&>tr>th]:bg-card-bg">
              <tr>
                <th className="px-4 py-3 text-[10px] font-bold uppercase text-label">
                  Pedidos
                </th>
                <th className="px-4 py-3 text-center text-[10px] font-bold uppercase text-label">
                  Preço de venda
                </th>
                <th className="px-4 py-3 text-center text-[10px] font-bold uppercase text-label">
                  Qtd
                </th>
                <th className="px-4 py-3 text-center text-[10px] font-bold uppercase text-label">
                  Valor do pedido
                </th>
                <th className="px-4 py-3 text-center text-[10px] font-bold uppercase text-label">
                  Custo produto
                </th>
                <th className="px-4 py-3 text-center text-[10px] font-bold uppercase text-label">
                  Imposto
                </th>
                <th className="px-4 py-3 text-center text-[10px] font-bold uppercase text-label">
                  Tarifa Shopee
                </th>
                <th className="px-4 py-3 text-center text-[10px] font-bold uppercase text-label">
                  Frete
                </th>
                <th className="px-4 py-3 text-center text-[10px] font-bold uppercase text-label">
                  Total custos
                </th>
                <th className="px-4 py-3 text-center text-[10px] font-bold uppercase text-label">
                  Lucro líquido
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, orderIndex) => {
                const canCompute = order.items_cost != null;
                const itemCount = order.items_breakdown.length;

                return (
                  <Fragment key={order.order_sn}>
                    {order.items_breakdown.map((item, index) => {
                      const isFirst = index === 0;
                      const isLast = index === itemCount - 1;
                      const isOnly = itemCount === 1;

                      const cardCellClass = isOnly
                        ? 'px-4 py-4'
                        : isFirst
                          ? 'px-4 pt-4 pb-0'
                          : isLast
                            ? 'px-4 pt-0 pb-4'
                            : 'px-4 py-0';

                      const cardClass = [
                        'border border-card-border bg-page-bg p-2',
                        isOnly
                          ? 'rounded-btn-input'
                          : isFirst
                            ? 'rounded-t-btn-input rounded-b-none border-b-0'
                            : isLast
                              ? 'rounded-b-btn-input rounded-t-none border-t-0'
                              : 'rounded-none border-y-0',
                      ].join(' ');

                      const imageUrl = productImageByItemId.get(
                        String(item.item_id),
                      );

                      const productInfo = (
                        <>
                          <p className="max-w-64 truncate text-sm font-bold text-body">
                            {item.item_name}
                          </p>
                          <CopyText label="ID" value={String(item.item_id)} />
                          <CopyText label="SKU" value={item.sku ?? '-'} />
                          {!item.is_matched_to_product ||
                          item.unit_cost == null ||
                          item.unit_government_taxes == null ? (
                            <Link
                              href={`/products?product_ids=${item.item_id}`}
                              className="mt-0.5 inline-block text-[10px] font-black uppercase text-alert-text underline decoration-2 underline-offset-4 hover:opacity-80"
                            >
                              Cadastrar
                            </Link>
                          ) : null}
                          {isFirst ? (
                            <div className="mt-2">
                              <CopyText
                                label="ID Pedido"
                                value={order.order_sn}
                              />
                            </div>
                          ) : null}
                        </>
                      );

                      return (
                        <tr
                          key={`${order.order_sn}-${item.item_id}`}
                          className={`align-top ${
                            isFirst && orderIndex > 0
                              ? 'border-t border-card-border'
                              : ''
                          }`}
                        >
                          <td className={`min-w-72 ${cardCellClass}`}>
                            <div className={cardClass}>
                              {imageUrl ? (
                                <div className="flex items-start gap-2">
                                  <Image
                                    src={imageUrl}
                                    alt={item.item_name}
                                    width={40}
                                    height={40}
                                    className="shrink-0 rounded-[0.35rem] object-cover"
                                  />
                                  <div className="min-w-0 flex-1">
                                    {productInfo}
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-start gap-2">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.35rem] bg-btn-muted text-label">
                                    <HiOutlineCube className="text-base" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    {productInfo}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                          <td
                            className={`${cardCellClass} text-center ${
                              isOnly ? 'align-middle' : ''
                            }`}
                          >
                            <div
                              className={`text-sm font-bold text-heading ${
                                isOnly ? '' : 'pt-2'
                              }`}
                            >
                              {formatBRL(item.unit_price)}
                            </div>
                          </td>
                          <td
                            className={`${cardCellClass} text-center ${
                              isOnly ? 'align-middle' : ''
                            }`}
                          >
                            <div
                              className={`text-sm font-bold text-heading ${
                                isOnly ? '' : 'pt-2'
                              }`}
                            >
                              x{formatNumber(item.quantity)}
                            </div>
                          </td>
                          {isFirst ? (
                            <>
                              <td
                                className="px-4 py-4 align-middle text-center"
                                rowSpan={itemCount}
                              >
                                <Cell value={formatBRL(order.total_amount)} />
                              </td>
                              <td
                                className="px-4 py-4 align-middle text-center"
                                rowSpan={itemCount}
                              >
                                {order.items_cost == null ? (
                                  <MissingCell />
                                ) : (
                                  <Cell
                                    value={formatBRL(order.items_cost)}
                                    className="text-graphic-cost"
                                  />
                                )}
                              </td>
                              <td
                                className="px-4 py-4 align-middle text-center"
                                rowSpan={itemCount}
                              >
                                {canCompute ? (
                                  <Cell
                                    value={formatBRL(
                                      order.total_government_taxes,
                                    )}
                                    sub={formatPercent(taxPercent(order))}
                                    className="text-graphic-tax"
                                  />
                                ) : (
                                  <MissingCell />
                                )}
                              </td>
                              <td
                                className="px-4 py-4 align-middle text-center"
                                rowSpan={itemCount}
                              >
                                <Cell
                                  value={formatBRL(order.shopee_commission)}
                                  className="text-graphic-fee-shopee"
                                />
                              </td>
                              <td
                                className="px-4 py-4 align-middle text-center"
                                rowSpan={itemCount}
                              >
                                <Cell
                                  value={formatBRL(
                                    order.shipping_paid_by_seller,
                                  )}
                                  className="text-graphic-shipping"
                                />
                              </td>
                              <td
                                className="px-4 py-4 align-middle text-center"
                                rowSpan={itemCount}
                              >
                                {canCompute ? (
                                  <Cell value={formatBRL(order.total_cost)} />
                                ) : (
                                  <Cell value="—" />
                                )}
                              </td>
                              <td
                                className="px-4 py-4 align-middle text-center"
                                rowSpan={itemCount}
                              >
                                {canCompute ? (
                                  <Cell
                                    value={formatBRL(order.net_profit_margin)}
                                    className={
                                      (order.net_profit_margin ?? 0) >= 0
                                        ? 'text-profit'
                                        : 'text-alert-text'
                                    }
                                  />
                                ) : (
                                  <Cell value="—" />
                                )}
                              </td>
                            </>
                          ) : null}
                        </tr>
                      );
                    })}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {orders.length === 0 ? (
        <Notice text={`Nenhum pedido com o status ${statusLabelText}.`}>
          <FaExclamationTriangle className="shrink-0 text-xl" />
        </Notice>
      ) : null}
    </div>
  );
}
