import { FaMagnifyingGlass } from 'react-icons/fa6';

interface ProductSearchFormProps {
  defaultValue?: string;
}

export function ProductSearchForm({ defaultValue }: ProductSearchFormProps) {
  return (
    <search>
      <form action="/products" method="get">
        <label htmlFor="product-id-search" className="sr-only">
          Buscar produto pelo ID
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="product-id-search"
            name="product_id"
            type="text"
            inputMode="numeric"
            defaultValue={defaultValue}
            placeholder="Digite o ID do produto"
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
