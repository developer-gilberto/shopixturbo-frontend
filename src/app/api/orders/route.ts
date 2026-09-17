import {
  DEFAULT_INTERVAL_DAYS,
  DEFAULT_ORDER_STATUS,
  INTERVAL_DAYS_OPTIONS,
  ORDER_STATUSES,
} from '@/components/ui/order-status-options';
import type {
  Order,
  OrdersApiResponse,
  OrdersSummary,
} from '@/lib/orders-data';
import {
  getShopIdFromCookie,
  getTokenFromCookie,
  verifyAuthToken,
} from '@/lib/session';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.BACKEND_URL;
const DEFAULT_PAGE_SIZE = 50;
const TIME_RANGE_FIELD = 'update_time';

function parseOrderId(value: string | null): string | undefined {
  return value?.trim() || undefined;
}

async function fetchSearchedOrder(
  shopId: string,
  token: string,
  orderId: string,
): Promise<{
  searchedOrders: OrdersApiResponse['searchedOrders'];
  orderSearchError: string | null;
}> {
  try {
    const detailsUrl = `${BACKEND_URL}/orders/details/${shopId}?order_id_list=${encodeURIComponent(orderId)}`;

    const response = await fetch(detailsUrl, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!response.ok) {
      return {
        searchedOrders: null,
        orderSearchError:
          'Não foi possível buscar o pedido. Tente novamente mais tarde.',
      };
    }

    const payload = (await response.json()) as unknown;
    const list = Array.isArray((payload as { order_list?: unknown }).order_list)
      ? ((payload as { order_list: unknown })
          .order_list as OrdersApiResponse['searchedOrders'])
      : [];

    const exact = (list ?? []).filter(
      (order) => order.order_sn.toLowerCase() === orderId.toLowerCase(),
    );

    return {
      searchedOrders: exact,
      orderSearchError:
        exact.length === 0
          ? `Nenhum pedido encontrado com o ID ${orderId}.`
          : null,
    };
  } catch {
    return {
      searchedOrders: null,
      orderSearchError:
        'Não foi possível buscar o pedido. Tente novamente mais tarde.',
    };
  }
}

async function resolveProductImages(
  shopId: string,
  token: string,
  orders: Order[],
): Promise<Record<string, string>> {
  const uniqueItemIds = [
    ...new Set(
      orders.flatMap((order) =>
        order.items_breakdown.map((item) => String(item.item_id)),
      ),
    ),
  ];

  if (uniqueItemIds.length === 0) {
    return {};
  }

  const imageResults = await Promise.allSettled(
    uniqueItemIds.map((itemId) =>
      fetch(
        `${BACKEND_URL}/products/${shopId}?product_id=${encodeURIComponent(itemId)}`,
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

  const productImageByItemId = new Map<string, string>();
  for (const result of imageResults) {
    if (
      result.status === 'fulfilled' &&
      result.value?.imageUrl &&
      !productImageByItemId.has(result.value.itemId)
    ) {
      productImageByItemId.set(result.value.itemId, result.value.imageUrl);
    }
  }

  return Object.fromEntries(productImageByItemId);
}

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const token = await getTokenFromCookie();
    const user = await verifyAuthToken(token);

    if (!user || !token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const shopId = user.shop?.id ?? (await getShopIdFromCookie());
    if (!shopId) {
      return Response.json({ error: 'No shop linked' }, { status: 400 });
    }

    const searchParams = request.nextUrl.searchParams;

    const rawStatus = searchParams.get('order_status');
    const orderStatus =
      typeof rawStatus === 'string' &&
      ORDER_STATUSES.some(({ value }) => value === rawStatus)
        ? rawStatus
        : DEFAULT_ORDER_STATUS;

    const rawInterval = searchParams.get('interval_days');
    const intervalDays =
      typeof rawInterval === 'string' &&
      INTERVAL_DAYS_OPTIONS.some(({ value }) => value === rawInterval)
        ? rawInterval
        : DEFAULT_INTERVAL_DAYS;

    const orderId = parseOrderId(searchParams.get('order_id'));

    let searchedOrders: OrdersApiResponse['searchedOrders'] = null;
    let orderSearchError: string | null = null;

    if (orderId) {
      const searchResult = await fetchSearchedOrder(shopId, token, orderId);
      searchedOrders = searchResult.searchedOrders;
      orderSearchError = searchResult.orderSearchError;
    }

    let report: OrdersApiResponse['report'];

    try {
      const reportUrl = `${BACKEND_URL}/report/orders/${shopId}?offset=0&page_size=${DEFAULT_PAGE_SIZE}&order_status=${orderStatus}&time_range_field=${TIME_RANGE_FIELD}&interval_days=${intervalDays}`;

      const reportResponse = await fetch(reportUrl, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });

      if (reportResponse.status === 404) {
        const statusLabel =
          ORDER_STATUSES.find(({ value }) => value === orderStatus)?.label ??
          orderStatus;
        report = {
          status: 'empty',
          message: `Nenhum pedido encontrado nos últimos ${Number(intervalDays)} dias com o status ${statusLabel}.`,
        };
      } else if (!reportResponse.ok) {
        report = {
          status: 'error',
          message: 'Não foi possível carregar os pedidos.',
        };
      } else {
        const data = (await reportResponse.json()) as {
          orders: Order[];
          summary: OrdersSummary;
        };

        const productImageByItemId = await resolveProductImages(
          shopId,
          token,
          data.orders,
        );

        report = {
          status: 'ok',
          orders: data.orders,
          summary: data.summary,
          productImageByItemId,
        };
      }
    } catch {
      report = {
        status: 'error',
        message: 'Não foi possível carregar os pedidos.',
      };
    }

    const payload: OrdersApiResponse = {
      searchedOrders,
      orderSearchError,
      report,
    };

    return Response.json(payload);
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
