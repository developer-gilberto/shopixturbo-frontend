'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  DEFAULT_ORDER_STATUS,
  ORDER_STATUSES,
} from '@/components/ui/order-status-options';

const RANGES = [
  { value: '1', label: 'Relatório de hoje' },
  { value: '7', label: 'Relatório dos últimos 7 dias' },
  { value: '15', label: 'Relatório dos últimos 15 dias' },
];

type FilterName = 'interval_days' | 'order_status';

function shortLabel(label: string): string {
  return label.split(' ').slice(-2).join(' ');
}

export function ReportFilter() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentDays = searchParams.get('interval_days') ?? '7';
  const days = RANGES.some(({ value }) => value === currentDays)
    ? currentDays
    : '7';

  const currentStatus =
    searchParams.get('order_status') ?? DEFAULT_ORDER_STATUS;
  const status = ORDER_STATUSES.some(({ value }) => value === currentStatus)
    ? currentStatus
    : DEFAULT_ORDER_STATUS;

  const handleChange = (name: FilterName, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(name, value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <select
        value={days}
        onChange={(event) => handleChange('interval_days', event.target.value)}
        aria-label="Intervalo de dias"
        className="bg-btn-muted text-heading font-bold rounded-btn-input px-3 py-1 text-sm cursor-pointer md:hidden"
      >
        {RANGES.map(({ value, label }) => (
          <option key={value} value={value} className="whitespace-nowrap">
            {shortLabel(label)}
          </option>
        ))}
      </select>
      <select
        value={days}
        onChange={(event) => handleChange('interval_days', event.target.value)}
        aria-label="Intervalo de dias"
        className="hidden md:block bg-btn-muted text-heading font-bold rounded-btn-input px-3 py-1 text-sm cursor-pointer"
      >
        {RANGES.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <select
        value={status}
        onChange={(event) => handleChange('order_status', event.target.value)}
        aria-label="Status do pedido"
        className="bg-btn-muted text-heading font-bold rounded-btn-input px-3 py-1 text-sm cursor-pointer"
      >
        {ORDER_STATUSES.map(({ value, label }) => (
          <option key={value} value={value} className="whitespace-nowrap">
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
