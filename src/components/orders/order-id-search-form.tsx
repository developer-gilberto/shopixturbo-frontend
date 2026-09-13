import { FaMagnifyingGlass } from 'react-icons/fa6';

interface OrderIdSearchFormProps {
  defaultValue?: string;
}

export function OrderIdSearchForm({ defaultValue }: OrderIdSearchFormProps) {
  return (
    <search>
      <form action="/orders" method="get">
        <label htmlFor="order-id-search" className="sr-only">
          Buscar pedido pelo ID
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="order-id-search"
            name="order_id"
            type="text"
            defaultValue={defaultValue}
            placeholder="Digite o ID do pedido"
            className="bg-btn-muted w-full rounded-btn-input px-4 py-2 text-sm font-semibold text-heading outline-none placeholder:text-subtitle sm:max-w-md"
          />
          <button
            type="submit"
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-btn-input bg-primary-base px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
          >
            <FaMagnifyingGlass className="shrink-0" />
            Buscar
          </button>
        </div>
      </form>
    </search>
  );
}
