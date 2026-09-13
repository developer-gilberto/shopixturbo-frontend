import { FaMagnifyingGlass } from 'react-icons/fa6';
import {
  DEFAULT_INTERVAL_DAYS,
  DEFAULT_ORDER_STATUS,
  INTERVAL_DAYS_OPTIONS,
  ORDER_STATUSES,
} from '@/components/ui/order-status-options';

interface OrderSearchFormProps {
  defaultValue?: string;
  defaultIntervalDays?: string;
}

export function OrderSearchForm({
  defaultValue,
  defaultIntervalDays,
}: OrderSearchFormProps) {
  return (
    <search>
      <form action="/orders" method="get">
        <label htmlFor="order-status-search" className="sr-only">
          Status dos pedidos
        </label>
        <label htmlFor="order-interval-search" className="sr-only">
          Intervalo de dias
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            id="order-status-search"
            name="order_status"
            defaultValue={defaultValue ?? DEFAULT_ORDER_STATUS}
            className="bg-btn-muted w-full rounded-btn-input px-4 py-2 text-sm font-semibold text-heading outline-none sm:max-w-md"
          >
            {ORDER_STATUSES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            id="order-interval-search"
            name="interval_days"
            defaultValue={defaultIntervalDays ?? DEFAULT_INTERVAL_DAYS}
            className="bg-btn-muted w-full rounded-btn-input px-4 py-2 text-sm font-semibold text-heading outline-none sm:max-w-40"
          >
            {INTERVAL_DAYS_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-btn-input bg-primary-base px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
          >
            <FaMagnifyingGlass className="shrink-0" />
            Buscar pedidos
          </button>
        </div>
      </form>
    </search>
  );
}
