import { ORDER_STATUSES } from '@/components/ui/order-status-options';

export interface OrderItem {
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

export interface Order {
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

export interface OrdersSummary {
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

export interface OrderDetailItem {
  item_id: number;
  item_name: string;
  item_sku: string;
  model_quantity_purchased: number;
  model_discounted_price: number;
  model_original_price: number;
  image_info: { image_url: string | null } | null;
}

export interface OrderDetail {
  order_sn: string;
  order_status: string;
  payment_method: string;
  total_amount: number;
  create_time: number;
  update_time: number;
  item_list: OrderDetailItem[];
}

export interface OrdersPagination {
  more: boolean;
  next_cursor: string | null;
}

export interface OrdersReportOk {
  status: 'ok';
  orders: Order[];
  summary: OrdersSummary;
  pagination: OrdersPagination;
  productImageByItemId: Record<string, string>;
}

export interface OrdersReportEmpty {
  status: 'empty';
  message: string;
}

export interface OrdersReportError {
  status: 'error';
  message: string;
}

export type OrdersReport =
  | OrdersReportOk
  | OrdersReportEmpty
  | OrdersReportError;

export interface OrdersApiResponse {
  searchedOrders: OrderDetail[] | null;
  orderSearchError: string | null;
  report: OrdersReport;
}

export function statusLabel(raw: string): string {
  return ORDER_STATUSES.find(({ value }) => value === raw)?.label ?? raw;
}

interface CacheEntry {
  data: OrdersApiResponse;
}

const cache = new Map<string, CacheEntry>();

function buildCacheKey(params: {
  orderStatus: string;
  intervalDays: string;
  orderId?: string;
  cursor?: string;
}): string {
  return `${params.orderStatus}|${params.intervalDays}|${params.orderId ?? ''}|${params.cursor ?? ''}`;
}

export async function fetchOrdersData(params: {
  orderStatus: string;
  intervalDays: string;
  orderId?: string;
  cursor?: string;
}): Promise<OrdersApiResponse> {
  const key = buildCacheKey(params);
  const cached = cache.get(key);
  if (cached) return cached.data;

  const searchParams = new URLSearchParams({
    order_status: params.orderStatus,
    interval_days: params.intervalDays,
  });
  if (params.orderId) {
    searchParams.set('order_id', params.orderId);
  }
  if (params.cursor) {
    searchParams.set('cursor', params.cursor);
  }

  const res = await fetch(`/api/orders?${searchParams.toString()}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      if (typeof window !== 'undefined') {
        window.location.assign('/');
      }
    }
    throw new Error(`Falha ao carregar pedidos (${res.status})`);
  }

  const data: OrdersApiResponse = await res.json();
  cache.set(key, { data });
  return data;
}

export function getCachedOrdersData(params: {
  orderStatus: string;
  intervalDays: string;
  orderId?: string;
  cursor?: string;
}): OrdersApiResponse | null {
  return cache.get(buildCacheKey(params))?.data ?? null;
}
