'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Fragment, useEffect, useRef, useState } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import { FaSackDollar } from 'react-icons/fa6';
import { HiOutlineCube } from 'react-icons/hi';
import { LiaFileInvoiceDollarSolid } from 'react-icons/lia';
import { LuClipboardList } from 'react-icons/lu';
import { TbDatabaseDollar } from 'react-icons/tb';
import { OrdersSkeleton } from '@/components/orders/orders-skeleton';
import { CopyText } from '@/components/ui/copy-text';
import { Notice } from '@/components/ui/notice';
import { PlainReport } from '@/components/ui/plain-report';
import { PrintReportButton } from '@/components/ui/print-report-button';
import {
  fetchOrdersData,
  getCachedOrdersData,
  type Order,
  type OrderDetail,
  type OrderItem,
  type OrdersApiResponse,
  type OrdersSummary,
  statusLabel,
} from '@/lib/orders-data';
import { generateReportText } from '@/lib/report-text';

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const INTEGER = new Intl.NumberFormat('pt-BR');

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

function itemTaxPercent(item: OrderItem): number | null {
  if (item.total_government_taxes == null || item.revenue <= 0) return null;
  return (item.total_government_taxes / item.revenue) * 100;
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

const COLUMN_HEADERS: Array<{
  label: string;
  center: boolean;
  width: string;
}> = [
  { label: 'Pedidos', center: false, width: 'w-72' },
  { label: 'Valor do pedido', center: true, width: 'w-32' },
  { label: 'Qtd', center: true, width: 'w-16' },
  { label: 'Preço de venda', center: true, width: 'w-32' },
  { label: 'Custo do produto', center: true, width: 'w-36' },
  { label: 'Imposto', center: true, width: 'w-32' },
  { label: 'Tarifa Shopee', center: true, width: 'w-32' },
  { label: 'Frete', center: true, width: 'w-28' },
  { label: 'Total custos', center: true, width: 'w-32' },
  { label: 'Lucro líquido', center: true, width: 'w-32' },
];

function TableHeaderRow() {
  return (
    <tr>
      {COLUMN_HEADERS.map(({ label, center, width }) => (
        <th
          key={label}
          className={`px-4 py-3 text-[10px] font-bold uppercase text-label ${width} ${
            center ? 'text-center' : ''
          }`}
        >
          {label}
        </th>
      ))}
    </tr>
  );
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
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-btn-input bg-btn-muted text-label">
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

function OrderMobileCard({
  order,
  productImageByItemId,
}: {
  order: Order;
  productImageByItemId: Record<string, string>;
}) {
  const canCompute = order.items_cost != null;
  const itemCount = order.items_breakdown.length;

  return (
    <li className="flex flex-col gap-3 rounded-card border border-card-border bg-card-bg p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <CopyText
            label="ID Pedido"
            value={order.order_sn}
            labelClassName="text-body font-bold"
          />
        </div>
        <div className="shrink-0 text-right">
          <p className="mb-0.5 text-[10px] font-bold uppercase text-label">
            Valor do pedido
          </p>
          <p className="text-sm font-bold text-heading">
            {formatBRL(order.total_amount)}
          </p>
        </div>
      </div>

      <ul className="overflow-hidden rounded-btn-input border border-card-border">
        {order.items_breakdown.map((item, index) => {
          const isLast = index === itemCount - 1;
          const imageUrl = productImageByItemId[String(item.item_id)];
          const missingCost =
            !item.is_matched_to_product ||
            item.unit_cost == null ||
            item.unit_government_taxes == null;

          return (
            <li
              key={`${order.order_sn}-${item.item_id}`}
              className={isLast ? '' : 'border-b border-card-border'}
            >
              <div className="flex items-center gap-3 p-3">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={item.item_name}
                    width={40}
                    height={40}
                    className="h-10 w-10 shrink-0 rounded-btn-input object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-btn-input bg-btn-muted text-label">
                    <HiOutlineCube className="text-base" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-body">
                    {item.item_name}
                  </p>
                  <CopyText
                    label="ID"
                    value={String(item.item_id)}
                    labelClassName="text-body font-bold"
                  />
                  <CopyText
                    label="SKU"
                    value={item.sku ?? '-'}
                    labelClassName="text-body font-bold"
                  />
                  {missingCost ? (
                    <Link
                      href={`/products?product_ids=${item.item_id}`}
                      className="mt-0.5 inline-block text-[10px] font-black uppercase text-alert-text underline decoration-2 underline-offset-4 hover:opacity-80"
                    >
                      Cadastrar
                    </Link>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-card-border p-3 pt-2.5 sm:grid-cols-4">
                <div className="text-center">
                  <p className="mb-0.5 text-[10px] font-bold uppercase text-label">
                    Qtd
                  </p>
                  <p className="text-sm font-bold text-heading">
                    x{formatNumber(item.quantity)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="mb-0.5 text-[10px] font-bold uppercase text-label">
                    Preço de venda
                  </p>
                  <p className="text-sm font-bold text-heading">
                    {formatBRL(item.unit_price)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="mb-0.5 text-[10px] font-bold uppercase text-label">
                    Custo do produto
                  </p>
                  {item.unit_cost == null ? (
                    <MissingCell />
                  ) : (
                    <p className="text-sm font-bold text-graphic-cost">
                      {formatBRL(item.unit_cost)}
                    </p>
                  )}
                </div>
                <div className="text-center">
                  <p className="mb-0.5 text-[10px] font-bold uppercase text-label">
                    Imposto
                  </p>
                  {item.total_government_taxes == null ? (
                    <MissingCell />
                  ) : (
                    <div className="text-sm font-bold text-graphic-tax">
                      {formatBRL(item.total_government_taxes)}
                      <p className="text-[10px] font-medium text-label">
                        {formatPercent(itemTaxPercent(item))}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="grid grid-cols-2 gap-3 border-t border-card-border pt-3 sm:grid-cols-4">
        <div className="text-center">
          <p className="mb-0.5 text-[10px] font-bold uppercase text-label">
            Tarifa Shopee
          </p>
          <p className="text-sm font-bold text-graphic-fee-shopee">
            {formatBRL(order.shopee_commission)}
          </p>
        </div>
        <div className="text-center">
          <p className="mb-0.5 text-[10px] font-bold uppercase text-label">
            Frete
          </p>
          <p className="text-sm font-bold text-graphic-shipping">
            {formatBRL(order.shipping_paid_by_seller)}
          </p>
        </div>
        <div className="text-center">
          <p className="mb-0.5 text-[10px] font-bold uppercase text-label">
            Total custos
          </p>
          <p className="text-sm font-bold text-heading">
            {canCompute ? formatBRL(order.total_cost) : '—'}
          </p>
        </div>
        <div className="text-center">
          <p className="mb-0.5 text-[10px] font-bold uppercase text-label">
            Lucro líquido
          </p>
          {canCompute ? (
            <p
              className={`text-sm font-bold ${
                (order.net_profit_margin ?? 0) >= 0
                  ? 'text-profit'
                  : 'text-alert-text'
              }`}
            >
              {formatBRL(order.net_profit_margin)}
            </p>
          ) : (
            <p className="text-sm font-bold text-heading">—</p>
          )}
        </div>
      </div>
    </li>
  );
}

interface ProductRank {
  item_id: number;
  name: string;
  sku: string | null;
  quantity: number;
  revenue: number;
  net_profit: number;
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
      current.net_profit += item.net_profit ?? 0;

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

function ReportBody({
  orders,
  summary,
  productImageByItemId,
  orderStatus,
  shopName,
  marketplace,
  userName,
  intervalDays,
}: {
  orders: Order[];
  summary: OrdersSummary;
  productImageByItemId: Record<string, string>;
  orderStatus: string;
  shopName: string;
  marketplace: string;
  userName: string;
  intervalDays: number;
}) {
  const missingCostCount = summary.orders_with_missing_cost_data.length;
  const missingProductIds = summary.products_with_missing_cost_data ?? [];
  const cadastrarHref =
    missingProductIds.length > 0
      ? `/products?product_ids=${missingProductIds.join(',')}`
      : '/products';

  const summaryCards = [
    {
      key: 'total-orders',
      label: 'Total Pedidos',
      value: formatNumber(summary.total_orders),
      icon: <LuClipboardList className="text-3xl" />,
    },
    {
      key: 'gross-revenue',
      label: 'Faturamento Bruto',
      value: formatBRL(summary.total_revenue),
      icon: <TbDatabaseDollar className="text-3xl" />,
    },
    {
      key: 'total-costs',
      label: 'Total Custos',
      value: formatBRL(summary.total_cost),
      icon: <LiaFileInvoiceDollarSolid className="text-3xl" />,
    },
    {
      key: 'net-profit',
      label: 'Lucro Líquido',
      value: formatBRL(summary.total_net_profit),
      positive: (summary.total_net_profit ?? 0) >= 0,
      icon: <FaSackDollar className="text-3xl" />,
    },
  ];

  const statusLabelText = statusLabel(orderStatus);

  const { topSelling, topProfitable } = buildProductRankings(orders);

  const reportText = generateReportText({
    shopName,
    marketplace,
    userName,
    intervalDays,
    totalOrders: summary.total_orders,
    totalRevenue: summary.total_revenue,
    totalItemsCost: summary.total_items_cost ?? 0,
    totalGovernmentTaxes: summary.total_government_taxes,
    totalShopeeCommission: summary.total_shopee_commission,
    totalShipping: summary.total_shipping,
    totalCost: summary.total_cost ?? 0,
    totalNetProfit: summary.total_net_profit ?? 0,
    topSelling: topSelling[0] ?? null,
    topProfitable: topProfitable[0] ?? null,
    sellingRanking: topSelling.map((item) => ({
      itemId: item.item_id,
      name: item.name,
      sku: item.sku,
      quantity: item.quantity,
      revenue: item.revenue,
    })),
    profitableRanking: topProfitable.map((item) => ({
      itemId: item.item_id,
      name: item.name,
      sku: item.sku,
      quantity: item.quantity,
      net_profit: item.net_profit,
      revenue: item.revenue,
    })),
  });

  const cloneHeaderRef = useRef<HTMLTableElement>(null);

  return (
    <>
      <PlainReport text={reportText} />
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <h1 className="text-2xl font-extrabold text-heading">Pedidos</h1>
        <PrintReportButton reportText={reportText} />
      </div>
      {missingCostCount > 0 ? (
        <div className="flex flex-col gap-3 rounded-card bg-alert-bg border-l-4 border-l-primary-pressed p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
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
        {summaryCards.map((card) => {
          const isLucro = card.positive !== undefined;

          return (
            <div
              key={card.key}
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
      <section className="rounded-card bg-page-bg shadow-none md:bg-card-bg md:shadow-card">
        <div className="flex flex-col gap-2 border-b border-card-border p-6 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold uppercase tracking-widest text-heading">
            Pedidos — {statusLabelText}
          </h2>
          <span className="text-xs font-bold uppercase text-label">
            {formatNumber(orders.length)} pedidos
          </span>
        </div>

        <div className="relative hidden md:block">
          <div className="sticky top-0 z-20 overflow-hidden bg-card-bg shadow-[0_1px_0_0_var(--color-card-border)] print:hidden">
            <table
              ref={cloneHeaderRef}
              className="w-full min-w-350 table-fixed text-left"
            >
              <thead>
                <TableHeaderRow />
              </thead>
            </table>
          </div>
          <div
            className="overflow-x-auto print:hidden"
            onScroll={(e) => {
              const header = cloneHeaderRef.current;
              if (header) {
                header.style.transform = `translateX(${-e.currentTarget.scrollLeft}px)`;
              }
            }}
          >
            <table className="w-full min-w-350 table-fixed border-collapse text-left">
              <thead className="invisible print:visible">
                <TableHeaderRow />
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

                        const imageUrl =
                          productImageByItemId[String(item.item_id)];

                        const productInfo = (
                          <>
                            <p className="max-w-64 truncate text-sm font-bold text-body">
                              {item.item_name}
                            </p>
                            <CopyText
                              label="ID"
                              value={String(item.item_id)}
                              labelClassName="text-body font-bold"
                            />
                            <CopyText
                              label="SKU"
                              value={item.sku ?? '-'}
                              labelClassName="text-body font-bold"
                            />
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
                                  labelClassName="text-body font-bold"
                                />
                              </div>
                            ) : null}
                          </>
                        );

                        const orderCell = (
                          <div className={cardClass}>
                            <div className="flex items-start gap-2">
                              {imageUrl ? (
                                <Image
                                  src={imageUrl}
                                  alt={item.item_name}
                                  width={40}
                                  height={40}
                                  className="shrink-0 rounded-[0.35rem] object-cover"
                                />
                              ) : (
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.35rem] bg-btn-muted text-label">
                                  <HiOutlineCube className="text-base" />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                {productInfo}
                              </div>
                            </div>
                          </div>
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
                              {orderCell}
                            </td>
                            {isFirst ? (
                              <td
                                className="px-4 py-4 align-middle text-center"
                                rowSpan={itemCount}
                              >
                                <Cell value={formatBRL(order.total_amount)} />
                              </td>
                            ) : null}
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
                                className={`text-sm font-bold text-graphic-cost ${
                                  isOnly ? '' : 'pt-2'
                                }`}
                              >
                                {item.unit_cost == null ? (
                                  <MissingCell />
                                ) : (
                                  formatBRL(item.unit_cost)
                                )}
                              </div>
                            </td>
                            <td
                              className={`${cardCellClass} text-center ${
                                isOnly ? 'align-middle' : ''
                              }`}
                            >
                              <div className={isOnly ? '' : 'pt-2'}>
                                {item.total_government_taxes == null ? (
                                  <MissingCell />
                                ) : (
                                  <Cell
                                    value={formatBRL(
                                      item.total_government_taxes,
                                    )}
                                    sub={formatPercent(itemTaxPercent(item))}
                                    className="text-graphic-tax"
                                  />
                                )}
                              </div>
                            </td>
                            {isFirst ? (
                              <>
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
        </div>

        <ul className="flex flex-col gap-4 md:hidden print:hidden">
          {orders.map((order) => (
            <OrderMobileCard
              key={order.order_sn}
              order={order}
              productImageByItemId={productImageByItemId}
            />
          ))}
        </ul>
      </section>

      {orders.length === 0 ? (
        <Notice text={`Nenhum pedido com o status ${statusLabelText}.`}>
          <FaExclamationTriangle className="shrink-0 text-xl" />
        </Notice>
      ) : null}
    </>
  );
}

interface OrdersContentProps {
  orderStatus: string;
  intervalDays: number;
  orderId?: string;
  shopName: string;
  marketplace: string;
  userName: string;
}

type ViewState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: OrdersApiResponse };

export function OrdersContent({
  orderStatus,
  intervalDays,
  orderId,
  shopName,
  marketplace,
  userName,
}: OrdersContentProps) {
  const [view, setView] = useState<ViewState>(() => {
    const cached = getCachedOrdersData({
      orderStatus,
      intervalDays: String(intervalDays),
      orderId,
    });
    return cached ? { status: 'ready', data: cached } : { status: 'loading' };
  });

  useEffect(() => {
    let cancelled = false;

    setView((current) =>
      current.status === 'ready' ? current : { status: 'loading' },
    );

    fetchOrdersData({
      orderStatus,
      intervalDays: String(intervalDays),
      orderId,
    })
      .then((data) => {
        if (!cancelled) {
          setView({ status: 'ready', data });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setView({
            status: 'error',
            message:
              'Não foi possível carregar os pedidos. Tente novamente mais tarde.',
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [orderStatus, intervalDays, orderId]);

  if (view.status === 'loading') {
    return <OrdersSkeleton />;
  }

  if (view.status === 'error') {
    return (
      <section className="rounded-card bg-card-bg p-6 shadow-card">
        <p className="font-bold text-heading">{view.message}</p>
      </section>
    );
  }

  const { report, orderSearchError, searchedOrders } = view.data;

  if (report.status === 'empty') {
    return (
      <section className="rounded-card bg-card-bg p-6 shadow-card">
        <p className="font-bold text-heading">{report.message}</p>
      </section>
    );
  }

  if (report.status === 'error') {
    return (
      <section className="rounded-card bg-card-bg p-6 shadow-card">
        <p className="font-bold text-heading">{report.message}</p>
        <p className="mt-2 text-sm text-body">Tente novamente mais tarde.</p>
      </section>
    );
  }

  return (
    <>
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
            {searchedOrders?.map((order) => (
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

      <ReportBody
        orders={report.orders}
        summary={report.summary}
        productImageByItemId={report.productImageByItemId}
        orderStatus={orderStatus}
        shopName={shopName}
        marketplace={marketplace}
        userName={userName}
        intervalDays={intervalDays}
      />
    </>
  );
}
