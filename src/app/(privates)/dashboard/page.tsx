import Image from 'next/image';
import Link from 'next/link';
import { FaExclamationTriangle } from 'react-icons/fa';
import { FaSackDollar } from 'react-icons/fa6';
import { LiaFileInvoiceDollarSolid } from 'react-icons/lia';
import { LuClipboardList } from 'react-icons/lu';
import { TbDatabaseDollar } from 'react-icons/tb';
import { ConnectShopeeButton } from '@/components/ui/connect-shopee-button';
import { CopyText } from '@/components/ui/copy-text';
import {
  DEFAULT_ORDER_STATUS,
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
  unit_cost: number;
  unit_government_taxes: number;
  total_government_taxes: number;
  revenue: number;
  total_cost: number;
  net_profit: number;
  is_matched_to_product: boolean;
}

interface Order {
  order_sn: string;
  payment_method: string;
  total_amount: number;
  shipping_paid_by_seller: number;
  shopee_commission: number;
  total_government_taxes: number;
  items_cost: number;
  total_cost: number;
  net_profit_margin: number;
  margin_percent: number;
  has_partial_cost_data: boolean;
  items_breakdown: OrderItem[];
}

interface OrdersSummary {
  total_orders: number;
  total_revenue: number;
  total_shipping: number;
  total_shopee_commission: number;
  total_items_cost: number;
  total_cost: number;
  total_government_taxes: number;
  total_net_profit: number;
  overall_margin_percent: number;
  orders_with_missing_cost_data: string[];
  products_with_missing_cost_data: number[];
  unmatched_item_skus: string[];
}

interface OrdersResponse {
  orders: Order[];
  summary: OrdersSummary;
}

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const INTEGER = new Intl.NumberFormat('pt-BR');

function formatBRL(value: number | null | undefined): string {
  if (value == null) return 'R$ 0,00';
  return BRL.format(value);
}

function formatNumber(value: number | null | undefined): string {
  if (value == null) return '0';
  return INTEGER.format(value);
}

function formatPercent(value: number | null | undefined): string {
  if (value == null) return '0%';
  return `${value.toFixed(1).replace('.', ',')}%`;
}

interface ProductRank {
  item_id: number;
  name: string;
  sku: string | null;
  quantity: number;
  revenue: number;
  net_profit: number;
  image_url?: string;
}

function buildProductRankings(orders: Order[]) {
  const byItem = new Map<number, ProductRank>();

  for (const order of orders) {
    for (const item of order.items_breakdown) {
      const current = byItem.get(item.item_id) ?? {
        item_id: item.item_id,
        name: item.item_name,
        sku: item.sku,
        quantity: 0,
        revenue: 0,
        net_profit: 0,
      };

      current.quantity += item.quantity;
      current.revenue += item.revenue;
      current.net_profit += item.net_profit;

      byItem.set(item.item_id, current);
    }
  }

  const products = [...byItem.values()];

  return {
    topSelling: [...products]
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10),
    topProfitable: [...products]
      .sort((a, b) => b.net_profit - a.net_profit)
      .slice(0, 10),
  };
}

function marginPercent(rank: ProductRank): string {
  return rank.revenue > 0
    ? formatPercent((rank.net_profit / rank.revenue) * 100)
    : formatPercent(0);
}

function rankLabel(index: number): string {
  return String(index + 1).padStart(2, '0');
}

function clampIntervalDays(raw: string | undefined): number {
  const parsed = Number(raw);
  if (!Number.isInteger(parsed)) return 7;
  return Math.min(Math.max(parsed, 1), 30);
}

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{
    interval_days?: string | string[];
    order_status?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const rawInterval = Array.isArray(params.interval_days)
    ? params.interval_days[0]
    : params.interval_days;
  const intervalDays = clampIntervalDays(rawInterval);

  const rawStatus = Array.isArray(params.order_status)
    ? params.order_status[0]
    : params.order_status;
  const orderStatus = ORDER_STATUSES.some(({ value }) => value === rawStatus)
    ? rawStatus
    : DEFAULT_ORDER_STATUS;

  const { user } = await verifySession();
  const token = await getTokenFromCookie();
  const shopId = user.shop?.id ?? (await getShopIdFromCookie());

  if (!shopId) {
    return (
      <div className="space-y-6">
        <section className="rounded-card bg-card-bg p-6 text-center shadow-card">
          <p className="text-lg font-bold text-heading">
            Nenhuma loja vinculada à sua conta
          </p>
          <p className="mt-2 text-sm text-body">
            Vincule sua loja para acompanhar pedidos, custos e lucros na
            dashboard.
          </p>
          <div className="mt-6 flex justify-center">
            <ConnectShopeeButton highlight />
          </div>
        </section>
      </div>
    );
  }

  let data: OrdersResponse;

  try {
    const url = `${process.env.BACKEND_URL}/report/orders/${shopId}?offset=0&page_size=50&order_status=${orderStatus}&time_range_field=update_time&interval_days=${intervalDays}`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (response.status === 404) {
      const statusLabel =
        ORDER_STATUSES.find(({ value }) => value === orderStatus)?.label ??
        orderStatus;
      return (
        <div className="space-y-6">
          <section className="rounded-card bg-card-bg p-6 shadow-card">
            <p className="font-bold text-heading">
              Nenhum pedido encontrado nos últimos {intervalDays} dias com o
              status {statusLabel}.
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
        <section className="rounded-card bg-card-bg p-6 shadow-card">
          <p className="font-bold text-heading">
            Não foi possível carregar os dados da dashboard.
          </p>
          <p className="mt-2 text-sm text-body">Tente novamente mais tarde.</p>
        </section>
      </div>
    );
  }

  const { orders, summary } = data;
  const { topSelling, topProfitable } = buildProductRankings(orders);

  const rankedItemIds = [
    ...new Set([...topSelling, ...topProfitable].map((item) => item.item_id)),
  ];

  const productImageByItemId = new Map<string, string>();

  if (rankedItemIds.length > 0) {
    const imageResults = await Promise.allSettled(
      rankedItemIds.map((itemId) =>
        fetch(
          `${process.env.BACKEND_URL}/products/${shopId}?product_id=${encodeURIComponent(String(itemId))}`,
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
            itemId: String(itemId),
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

  const topSellingWithImages = topSelling.map((item) => ({
    ...item,
    image_url: productImageByItemId.get(String(item.item_id)),
  }));
  const topProfitableWithImages = topProfitable.map((item) => ({
    ...item,
    image_url: productImageByItemId.get(String(item.item_id)),
  }));

  const missingProductsCount = (summary.products_with_missing_cost_data ?? [])
    .length;
  const missingSkusCount = summary.unmatched_item_skus.length;
  const showAlert = missingProductsCount > 0 || missingSkusCount > 0;

  const alertMessage =
    missingSkusCount > 0
      ? `${missingSkusCount} ${missingSkusCount === 1 ? 'produto sem' : 'produtos sem'} o preço de custo cadastrado. Cadastre agora para ter precisão no lucro.`
      : `${missingProductsCount} ${missingProductsCount === 1 ? 'produto sem' : 'produtos sem'} dados de custo cadastrado. Cadastre os custos para ter precisão no lucro.`;

  const missingProductIds = summary.products_with_missing_cost_data ?? [];
  const cadastrarHref =
    missingProductIds.length > 0
      ? `/products?product_ids=${missingProductIds.join(',')}`
      : '/products';

  const totalRevenue = summary.total_revenue;

  const CHART_SEGMENTS = [
    {
      label: 'Preço de Custo',
      value:
        totalRevenue > 0 ? (summary.total_items_cost / totalRevenue) * 100 : 0,
      amount: formatBRL(summary.total_items_cost),
      color: 'bg-graphic-cost',
    },
    {
      label: 'Impostos',
      value:
        totalRevenue > 0
          ? (summary.total_government_taxes / totalRevenue) * 100
          : 0,
      amount: formatBRL(summary.total_government_taxes),
      color: 'bg-graphic-tax',
    },
    {
      label: 'Tarifa Shopee',
      value:
        totalRevenue > 0
          ? (summary.total_shopee_commission / totalRevenue) * 100
          : 0,
      amount: formatBRL(summary.total_shopee_commission),
      color: 'bg-graphic-fee-shopee',
    },
    {
      label: 'Frete',
      value:
        totalRevenue > 0 ? (summary.total_shipping / totalRevenue) * 100 : 0,
      amount: formatBRL(summary.total_shipping),
      color: 'bg-graphic-shipping',
    },
    {
      label: 'Lucro Líquido',
      value:
        totalRevenue > 0 ? (summary.total_net_profit / totalRevenue) * 100 : 0,
      amount: formatBRL(summary.total_net_profit),
      color: 'bg-graphic-profit',
    },
  ];

  const VISIBLE_CHART_SEGMENTS = CHART_SEGMENTS.filter(
    (segment) => segment.value > 0,
  );

  const STAT_CARDS = [
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
      margin: formatPercent(summary.overall_margin_percent),
      positive: summary.total_net_profit >= 0,
      icon: <FaSackDollar className="text-3xl" />,
    },
  ];

  return (
    <div className="space-y-6">
      {showAlert ? (
        <div className="flex items-center justify-between gap-4 rounded-card bg-alert-bg border-l-4 border-l-primary-pressed p-4">
          <div className="flex items-center gap-3">
            <FaExclamationTriangle className="text-alert-text shrink-0" />
            <p className="text-sm font-semibold text-alert-text">
              {alertMessage}
            </p>
          </div>
          <Link
            href={cadastrarHref}
            className="shrink-0 text-xs font-black uppercase text-alert-text underline decoration-2 underline-offset-4 hover:opacity-80"
          >
            Cadastrar
          </Link>
        </div>
      ) : null}

      {/* Visão Geral de Custos */}
      <section className="rounded-card bg-card-bg p-6 shadow-card md:p-8">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-xl font-bold uppercase tracking-widest text-label">
              Visão Geral de Custos
            </p>
            <h2 className="text-2xl font-extrabold text-heading md:text-3xl">
              {formatBRL(totalRevenue)}{' '}
              <span className="text-sm font-bold text-subtitle">
                Faturamento bruto
              </span>
            </h2>
          </div>
        </div>

        {/* Barra horizontal multi-segmento */}
        <div className="mb-6 flex h-10 w-full overflow-hidden rounded-full bg-card-border sm:h-12">
          {VISIBLE_CHART_SEGMENTS.map((seg) => (
            <div
              key={seg.label}
              className={`${seg.color} flex h-full items-center justify-center text-xl font-bold text-white transition-all`}
              style={{ width: `${Math.max(0, seg.value)}%` }}
              title={`${seg.label}: ${Math.round(seg.value)}%`}
            >
              <span className="hidden sm:inline">{Math.round(seg.value)}%</span>
            </div>
          ))}
        </div>

        {/* Legenda */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {CHART_SEGMENTS.map((seg) => (
            <div key={seg.label} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className={`h-5 w-5 shrink-0 rounded-full ${seg.color}`} />
                <p className="text-xl font-bold uppercase text-label">
                  {seg.label}
                </p>
              </div>
              <p className="pl-7 text-xl font-bold text-heading">
                {seg.amount}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Cards resumo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((card) => {
          const isLucro = card.margin !== undefined;

          return (
            <div
              key={card.label}
              className={`flex min-h-35 flex-col justify-between rounded-card p-6 text-white ${
                isLucro
                  ? `shadow-xl ${
                      card.positive !== false
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
                  className={`text-2xl font-extrabold ${isLucro ? 'text-white text-3xl' : 'text-heading'}`}
                >
                  {card.value}
                </p>
                {card.margin ? (
                  <p
                    className={`text-xs font-medium ${
                      card.positive !== false
                        ? 'text-emerald-100'
                        : 'text-red-500'
                    }`}
                  >
                    Margem: {card.margin}
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Rankings */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Produtos Mais Vendidos */}
        <section className="overflow-hidden rounded-card bg-card-bg shadow-card">
          <div className="flex items-center justify-between font-extrabold uppercase border-b border-card-border p-6">
            <h3 className="font-bold text-heading">Produtos mais vendidos</h3>
            <span className="text-xs font-bold uppercase text-label">
              Qtd Vendida
            </span>
          </div>
          <div className="divide-y divide-card-border">
            {topSellingWithImages.length === 0 ? (
              <p className="p-6 text-sm text-subtitle">
                Sem dados de vendas ainda.
              </p>
            ) : (
              topSellingWithImages.map((product, index) => (
                <div
                  key={product.item_id}
                  className="flex items-center justify-between p-4 transition-colors hover:bg-btn-muted"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <span className="w-4 shrink-0 text-sm font-black text-subtitle">
                      {rankLabel(index)}
                    </span>
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="h-12 w-12 shrink-0 rounded-btn-input object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 shrink-0 rounded-btn-input bg-btn-muted" />
                    )}
                    <div className="min-w-0">
                      <p className="max-w-45 truncate text-sm font-bold text-body">
                        {product.name}
                      </p>
                      <CopyText label="ID" value={String(product.item_id)} />
                      <CopyText label="SKU" value={product.sku ?? '-'} />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-heading">
                      {formatNumber(product.quantity)} unid
                    </p>
                    <p className="text-[10px] font-bold text-profit">
                      {formatBRL(product.revenue)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Produtos Mais Lucrativos */}
        <section className="overflow-hidden rounded-card bg-card-bg shadow-card">
          <div className="flex items-center justify-between font-extrabold uppercase border-b border-card-border p-6">
            <h3 className="font-bold text-heading">Produtos mais lucrativos</h3>
            <span className="text-xs font-bold uppercase text-label">
              Margem %
            </span>
          </div>
          <div className="divide-y divide-card-border">
            {topProfitableWithImages.length === 0 ? (
              <p className="p-6 text-sm text-subtitle">
                Sem dados de vendas ainda.
              </p>
            ) : (
              topProfitableWithImages.map((product, index) => (
                <div
                  key={product.item_id}
                  className="flex items-center justify-between p-4 transition-colors hover:bg-btn-muted"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <span className="w-4 shrink-0 text-sm font-black text-subtitle">
                      {rankLabel(index)}
                    </span>
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="h-12 w-12 shrink-0 rounded-btn-input object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 shrink-0 rounded-btn-input bg-btn-muted" />
                    )}
                    <div className="min-w-0">
                      <p className="max-w-45 truncate text-sm font-bold text-body">
                        {product.name}
                      </p>
                      <CopyText label="ID" value={String(product.item_id)} />
                      <CopyText label="SKU" value={product.sku ?? '-'} />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-profit">
                      {marginPercent(product)} Margem
                    </p>
                    <p className="text-[10px] font-bold text-label">
                      Lucro: {formatBRL(product.net_profit)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
