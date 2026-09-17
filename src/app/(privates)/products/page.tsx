import Image from 'next/image';
import Link from 'next/link';
import { FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6';
import { BulkCostModal } from '@/components/products/bulk-cost-modal';
import { EditCostModal } from '@/components/products/edit-cost-modal';
import { ProductSearchForm } from '@/components/products/product-search-form';
import { ProductSelectAllCheckbox } from '@/components/products/product-select-all-checkbox';
import { ProductSelectCheckbox } from '@/components/products/product-select-checkbox';
import { ProductSelectionProvider } from '@/components/products/product-selection-provider';
import { ConnectShopeeButton } from '@/components/ui/connect-shopee-button';
import { CopyText } from '@/components/ui/copy-text';
import { Notice } from '@/components/ui/notice';
import { verifySession } from '@/lib/dal';
import { getShopIdFromCookie, getTokenFromCookie } from '@/lib/session';

interface Product {
  id: string;
  marketplace: string;
  category_id: number;
  name: string;
  sku: string;
  image_url: string;
  stock: number;
  sale_price_cents: number;
  cost_price_cents: number | null;
  government_taxes: number | null;
  external_id: string;
  external_created_at: string;
  external_updated_at: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  shop_id: string;
}

interface ProductsResponse {
  pagination: {
    next_offset: number | null;
    has_next_page: boolean;
    total_products: number;
  };
  products: Product[];
}

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const INTEGER = new Intl.NumberFormat('pt-BR');

const PAGE_SIZE = 10;

function formatCents(value: number | null | undefined): string {
  if (value == null) return '—';
  return BRL.format(value / 100);
}

function formatTaxPercent(
  governmentTaxes: number | null,
  salePriceCents: number,
): string {
  if (governmentTaxes == null || salePriceCents <= 0) return '—';
  return `${((governmentTaxes / salePriceCents) * 100).toFixed(1).replace('.', ',')}%`;
}

function formatNumber(value: number | null | undefined): string {
  if (value == null) return '0';
  return INTEGER.format(value);
}

function clampOffset(raw: string | undefined): number {
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 0) return 0;
  return parsed;
}

function normalizeSingleProduct(data: unknown): Product | null {
  const candidate = Array.isArray(data)
    ? data[0]
    : typeof data === 'object' && data !== null
      ? ((data as Record<string, unknown>).product ?? data)
      : undefined;

  if (
    typeof candidate === 'object' &&
    candidate !== null &&
    typeof (candidate as { id?: unknown }).id === 'string' &&
    typeof (candidate as { external_id?: unknown }).external_id === 'string'
  ) {
    return candidate as Product;
  }

  return null;
}

function SearchResultRow({ product }: { product: Product }) {
  const hasCostAndTaxes =
    product.cost_price_cents != null && product.government_taxes != null;

  return (
    <div className="divide-y divide-card-border overflow-hidden rounded-card border border-card-border">
      <div className="hidden items-center gap-4 border-b border-card-border px-4 py-3 min-h-20 md:flex">
        <div className="w-28 shrink-0 pl-3" aria-hidden="true" />
        <span className="flex-1 pl-16 text-[10px] font-bold uppercase text-label">
          Produto
        </span>
        <span className="w-20 shrink-0 text-center text-[10px] font-bold uppercase text-label">
          Estoque
        </span>
        <span className="w-28 shrink-0 text-center text-[10px] font-bold uppercase text-label">
          Preço de venda
        </span>
        <span className="w-28 shrink-0 text-center text-[10px] font-bold uppercase text-label">
          Custo do produto
        </span>
        <span className="w-24 shrink-0 text-center text-[10px] font-bold uppercase text-label">
          Impostos
        </span>
        <span className="w-16 shrink-0 text-center text-[10px] font-bold uppercase text-label">
          Status
        </span>
        <span className="w-18 shrink-0 text-center text-[10px] font-bold uppercase text-label">
          Cadastrar
        </span>
      </div>

      <div className="flex items-center gap-3 p-4 md:hidden">
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

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-body">{product.name}</p>
          <CopyText label="ID" value={product.external_id} />
          <CopyText label="SKU" value={product.sku ?? '-'} />
        </div>

        {hasCostAndTaxes ? (
          <FaCheck className="shrink-0 text-lg text-profit" />
        ) : (
          <FaExclamationTriangle className="shrink-0 text-lg text-prejudice" />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-card-border p-4 pt-3 sm:grid-cols-4 md:hidden">
        <div className="text-center">
          <p className="mb-0.5 text-[10px] font-bold uppercase text-label">
            Estoque
          </p>
          <p className="text-sm font-bold text-heading">
            {formatNumber(product.stock)}
          </p>
        </div>
        <div className="text-center">
          <p className="mb-0.5 text-[10px] font-bold uppercase text-label">
            Preço de venda
          </p>
          <p className="text-sm font-bold text-heading">
            {formatCents(product.sale_price_cents)}
          </p>
        </div>
        <div className="text-center">
          <p className="mb-0.5 text-[10px] font-bold uppercase text-label">
            Custo do produto
          </p>
          {product.cost_price_cents != null ? (
            <p className="text-sm font-bold text-graphic-cost">
              {formatCents(product.cost_price_cents)}
            </p>
          ) : (
            <p className="text-xs font-bold text-alert-text">***</p>
          )}
        </div>
        <div className="text-center">
          <p className="mb-0.5 text-[10px] font-bold uppercase text-label">
            Impostos
          </p>
          {product.government_taxes != null ? (
            <div className="text-sm font-bold text-graphic-tax">
              {formatCents(product.government_taxes)}
              <p className="text-[10px] font-medium text-label">
                {formatTaxPercent(
                  product.government_taxes,
                  product.sale_price_cents,
                )}
              </p>
            </div>
          ) : (
            <p className="text-xs font-bold text-alert-text">***</p>
          )}
        </div>
        <div className="col-span-2 text-center sm:col-span-4">
          <EditCostModal
            product={product}
            buttonClassName="inline-flex w-full cursor-pointer items-center justify-center text-heading transition-colors hover:text-primary-base hover:underline"
          />
        </div>
      </div>

      <div className="hidden items-center gap-4 p-4 md:flex">
        <div className="w-28 shrink-0 pl-1" aria-hidden="true" />
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

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-body">{product.name}</p>
          <CopyText label="ID" value={product.external_id} />
          <CopyText label="SKU" value={product.sku ?? '-'} />
        </div>

        <div className="w-20 shrink-0 text-center">
          <p className="text-sm font-bold text-heading">
            {formatNumber(product.stock)}
          </p>
        </div>

        <div className="w-28 shrink-0 text-center">
          <p className="text-sm font-bold text-heading">
            {formatCents(product.sale_price_cents)}
          </p>
        </div>

        <div className="w-28 shrink-0 text-center">
          {product.cost_price_cents != null ? (
            <p className="text-sm font-bold text-graphic-cost">
              {formatCents(product.cost_price_cents)}
            </p>
          ) : (
            <p className="text-xs font-bold text-alert-text">***</p>
          )}
        </div>

        <div className="w-24 shrink-0 text-center">
          {product.government_taxes != null ? (
            <div className="text-sm font-bold text-graphic-tax">
              {formatCents(product.government_taxes)}
              <p className="text-[10px] font-medium text-label">
                {formatTaxPercent(
                  product.government_taxes,
                  product.sale_price_cents,
                )}
              </p>
            </div>
          ) : (
            <p className="text-xs font-bold text-alert-text">***</p>
          )}
        </div>

        <div className="w-16 shrink-0 text-center">
          {hasCostAndTaxes ? (
            <FaCheck className="mx-auto text-lg text-profit" />
          ) : (
            <FaExclamationTriangle className="mx-auto text-lg text-prejudice" />
          )}
        </div>

        <div className="w-18 shrink-0 text-center">
          <EditCostModal product={product} />
        </div>
      </div>
    </div>
  );
}

export default async function Products({
  searchParams,
}: {
  searchParams: Promise<{
    offset?: string | string[];
    product_id?: string | string[];
    product_ids?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const rawOffset = Array.isArray(params.offset)
    ? params.offset[0]
    : params.offset;
  const parsedOffset = clampOffset(rawOffset);
  const offset = parsedOffset - (parsedOffset % PAGE_SIZE);

  const rawProductId = Array.isArray(params.product_id)
    ? params.product_id[0]
    : params.product_id;
  const productId = rawProductId?.trim() || undefined;

  const rawProductIds = Array.isArray(params.product_ids)
    ? params.product_ids[0]
    : params.product_ids;
  const commaIds = rawProductIds
    ? rawProductIds
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean)
    : [];

  const searchIds = [
    ...new Set(commaIds.length > 0 ? commaIds : productId ? [productId] : []),
  ];

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
            Vincule sua loja em para gerenciar o catálogo de produtos.
          </p>
          <div className="mt-6 flex justify-center">
            <ConnectShopeeButton highlight />
          </div>
        </section>
      </div>
    );
  }

  const searchedProducts: Product[] = [];
  const notFoundIds: string[] = [];
  let searchNetworkError = false;

  if (searchIds.length > 0) {
    const searchResults = await Promise.allSettled(
      searchIds.map(async (id) => {
        try {
          const searchUrl = `${process.env.BACKEND_URL}/products/${shopId}?product_id=${encodeURIComponent(id)}`;

          const searchResponse = await fetch(searchUrl, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
          });

          if (!searchResponse.ok) return null;

          return normalizeSingleProduct(await searchResponse.json());
        } catch {
          searchNetworkError = true;
          return null;
        }
      }),
    );

    searchResults.forEach((result, index) => {
      const product = result.status === 'fulfilled' ? result.value : null;
      if (product) {
        searchedProducts.push(product);
      } else if (!searchNetworkError) {
        notFoundIds.push(searchIds[index]);
      }
    });
  }

  let searchErrorMessage: string | null = null;

  if (searchNetworkError) {
    searchErrorMessage =
      'Não foi possível buscar o produto. Tente novamente mais tarde.';
  } else if (notFoundIds.length > 0) {
    searchErrorMessage = `Nenhum produto encontrado com ${
      notFoundIds.length === 1 ? 'o ID' : 'os IDs'
    } ${notFoundIds.join(', ')}.`;
  }

  let data: ProductsResponse;

  try {
    const url = `${process.env.BACKEND_URL}/products/full/${shopId}?offset=${offset}&page_size=${PAGE_SIZE}`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Falha ao buscar produtos da loja (${response.status})`);
    }

    data = (await response.json()) as ProductsResponse;
  } catch {
    return (
      <div className="space-y-6">
        <section className="rounded-card bg-card-bg p-6 shadow-card">
          <p className="font-bold text-heading">
            Não foi possível carregar os produtos.
          </p>
          <p className="mt-2 text-sm text-body">Tente novamente mais tarde.</p>
        </section>
      </div>
    );
  }

  const { products, pagination } = data;
  const pageExternalIds = products.map((product) => product.external_id);
  const missingCostCount = products.filter(
    (product) => product.cost_price_cents == null,
  ).length;

  const buildQuery = (nextOffset: number) =>
    `?offset=${nextOffset}&page_size=${PAGE_SIZE}`;

  const hasPrevious = offset > 0;
  const hasNext = pagination.has_next_page && pagination.next_offset != null;
  const pageNumber = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = Math.ceil(pagination.total_products / PAGE_SIZE);

  return (
    <div className="space-y-6">
      {missingCostCount > 0 ? (
        <div className="flex items-center gap-3 rounded-card bg-alert-bg border-l-4 border-l-primary-pressed p-4">
          <FaExclamationTriangle className="text-alert-text shrink-0" />
          <p className="text-sm font-semibold text-alert-text">
            {missingCostCount}{' '}
            {missingCostCount === 1 ? 'produto sem' : 'produtos sem'} dados de
            custo cadastrado.
          </p>
        </div>
      ) : null}

      <section className="rounded-card bg-card-bg p-6 shadow-card">
        <div className="mb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-label">
            Buscar produto
          </h2>
          <p className="mt-1 text-sm text-subtitle">
            Encontre um produto específico pelo ID.
          </p>
        </div>
        <ProductSearchForm defaultValue={productId} />
      </section>

      {searchIds.length > 0 ? (
        <section className="overflow-hidden rounded-card bg-card-bg shadow-card">
          <div className="flex items-center justify-between border-b border-card-border p-6">
            <h2 className="text-lg font-bold uppercase tracking-widest text-heading">
              Resultado da busca
            </h2>
            <Link
              href="/products"
              className="text-xs font-bold uppercase text-label underline decoration-2 underline-offset-4 hover:text-heading"
            >
              Limpar busca
            </Link>
          </div>
          <div className="p-6">
            {searchErrorMessage ? (
              <Notice text={searchErrorMessage}>
                <FaExclamationTriangle className="shrink-0 text-xl" />
              </Notice>
            ) : null}
            {searchedProducts.map((product) => (
              <div
                key={product.id}
                className={searchedProducts.length > 1 ? '[&+&]:mt-4' : ''}
              >
                <SearchResultRow product={product} />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="overflow-hidden rounded-card bg-card-bg shadow-card">
        <ProductSelectionProvider>
          <div className="flex items-center justify-between border-b border-card-border p-6">
            <h2 className="text-xl font-bold uppercase tracking-widest text-heading">
              Produtos
            </h2>
            <span className="text-xs font-bold uppercase text-label">
              {formatNumber(pagination.total_products)} produtos
            </span>
          </div>

          {products.length === 0 ? (
            <p className="p-6 text-sm text-subtitle">
              Nenhum produto encontrado.
            </p>
          ) : (
            <>
              <div className="hidden items-center gap-4 border-b border-card-border px-4 py-3 min-h-20 md:flex">
                <div className="w-28 shrink-0 flex items-center gap-2 pl-3">
                  <ProductSelectAllCheckbox externalIds={pageExternalIds} />
                  <span className="text-[10px] font-bold uppercase text-label">
                    Selecionar todos
                  </span>
                </div>
                <span className="flex-1 pl-16 text-[10px] font-bold uppercase text-label">
                  Produto
                </span>
                <span className="w-20 shrink-0 text-center text-[10px] font-bold uppercase text-label">
                  Estoque
                </span>
                <span className="w-28 shrink-0 text-center text-[10px] font-bold uppercase text-label">
                  Preço de venda
                </span>
                <span className="w-28 shrink-0 text-center text-[10px] font-bold uppercase text-label">
                  Custo do produto
                </span>
                <span className="w-24 shrink-0 text-center text-[10px] font-bold uppercase text-label">
                  Impostos
                </span>
                <span className="w-16 shrink-0 text-center text-[10px] font-bold uppercase text-label">
                  Status
                </span>
                <span className="w-18 shrink-0 text-center text-[10px] font-bold uppercase text-label">
                  Cadastrar
                </span>
              </div>

              <BulkCostModal products={products} />

              <div className="flex items-center gap-2 border-b border-card-border py-2 min-h-20 pl-6 pr-4 md:hidden">
                <ProductSelectAllCheckbox externalIds={pageExternalIds} />
                <span className="text-xs font-bold uppercase text-label">
                  Selecionar todos
                </span>
              </div>

              <ul className="divide-y divide-card-border">
                {products.map((product) => {
                  const hasCostAndTaxes =
                    product.cost_price_cents != null &&
                    product.government_taxes != null;

                  return (
                    <li
                      key={product.id}
                      className="transition-colors hover:bg-btn-muted px-2"
                    >
                      <div className="flex items-center gap-3 p-4 md:hidden">
                        <ProductSelectCheckbox
                          externalId={product.external_id}
                        />
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

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-body">
                            {product.name}
                          </p>
                          <CopyText label="ID" value={product.external_id} />
                          <CopyText label="SKU" value={product.sku ?? '-'} />
                        </div>

                        {hasCostAndTaxes ? (
                          <FaCheck className="shrink-0 text-lg text-profit" />
                        ) : (
                          <FaExclamationTriangle className="shrink-0 text-lg text-prejudice" />
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3 border-t border-card-border p-4 pt-3 sm:grid-cols-4 md:hidden">
                        <div className="text-center">
                          <p className="mb-0.5 text-[10px] font-bold uppercase text-label">
                            Estoque
                          </p>
                          <p className="text-sm font-bold text-heading">
                            {formatNumber(product.stock)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="mb-0.5 text-[10px] font-bold uppercase text-label">
                            Preço de venda
                          </p>
                          <p className="text-sm font-bold text-heading">
                            {formatCents(product.sale_price_cents)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="mb-0.5 text-[10px] font-bold uppercase text-label">
                            Custo do produto
                          </p>
                          {product.cost_price_cents != null ? (
                            <p className="text-sm font-bold text-graphic-cost">
                              {formatCents(product.cost_price_cents)}
                            </p>
                          ) : (
                            <p className="text-xs font-bold text-alert-text">
                              ***
                            </p>
                          )}
                        </div>
                        <div className="text-center">
                          <p className="mb-0.5 text-[10px] font-bold uppercase text-label">
                            Impostos
                          </p>
                          {product.government_taxes != null ? (
                            <div className="text-sm font-bold text-graphic-tax">
                              {formatCents(product.government_taxes)}
                              <p className="text-[10px] font-medium text-label">
                                {formatTaxPercent(
                                  product.government_taxes,
                                  product.sale_price_cents,
                                )}
                              </p>
                            </div>
                          ) : (
                            <p className="text-xs font-bold text-alert-text">
                              ***
                            </p>
                          )}
                        </div>
                        <div className="col-span-2 text-center sm:col-span-4">
                          <EditCostModal
                            product={product}
                            buttonClassName="inline-flex w-full cursor-pointer items-center justify-center text-heading transition-colors hover:text-primary-base hover:underline"
                          />
                        </div>
                      </div>

                      <div className="hidden items-center gap-4 p-4 md:flex">
                        <div className="w-28 shrink-0 text-left pl-1">
                          <ProductSelectCheckbox
                            externalId={product.external_id}
                          />
                        </div>
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

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-body">
                            {product.name}
                          </p>
                          <CopyText label="ID" value={product.external_id} />
                          <CopyText label="SKU" value={product.sku ?? '-'} />
                        </div>

                        <div className="w-20 shrink-0 text-center">
                          <p className="text-sm font-bold text-heading">
                            {formatNumber(product.stock)}
                          </p>
                        </div>

                        <div className="w-28 shrink-0 text-center">
                          <p className="text-sm font-bold text-heading">
                            {formatCents(product.sale_price_cents)}
                          </p>
                        </div>

                        <div className="w-28 shrink-0 text-center">
                          {product.cost_price_cents != null ? (
                            <p className="text-sm font-bold text-graphic-cost">
                              {formatCents(product.cost_price_cents)}
                            </p>
                          ) : (
                            <div className="flex items-center justify-center gap-1.5">
                              <span className="text-xs font-bold text-alert-text">
                                ***
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="w-24 shrink-0 text-center">
                          {product.government_taxes != null ? (
                            <div className="text-sm font-bold text-graphic-tax">
                              {formatCents(product.government_taxes)}
                              <p className="text-[10px] font-medium text-label">
                                {formatTaxPercent(
                                  product.government_taxes,
                                  product.sale_price_cents,
                                )}
                              </p>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1.5">
                              <span className="text-xs font-bold text-alert-text">
                                ***
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="w-16 shrink-0 text-center">
                          {hasCostAndTaxes ? (
                            <FaCheck className="mx-auto text-lg text-profit" />
                          ) : (
                            <FaExclamationTriangle className="mx-auto text-lg text-prejudice" />
                          )}
                        </div>

                        <div className="w-18 shrink-0 text-center">
                          <EditCostModal product={product} />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          <div className="flex items-center justify-center gap-4 border-t border-card-border p-4">
            {hasPrevious ? (
              <Link
                href={buildQuery(offset - PAGE_SIZE)}
                className="flex items-center gap-2 rounded-btn-input bg-btn-muted px-4 py-2 text-sm font-bold text-heading hover:bg-card-border"
              >
                <FaAngleLeft /> Anterior
              </Link>
            ) : (
              <span className="px-4 py-2 text-sm font-bold text-label opacity-40">
                <FaAngleLeft className="mr-2 inline" />
                Anterior
              </span>
            )}

            <p className="text-xs font-bold uppercase text-label">
              Página {formatNumber(pageNumber)} de {formatNumber(totalPages)}
            </p>

            {hasNext ? (
              <Link
                href={buildQuery(pagination.next_offset ?? offset + PAGE_SIZE)}
                className="flex items-center gap-2 rounded-btn-input bg-btn-muted px-4 py-2 text-sm font-bold text-heading hover:bg-card-border"
              >
                Próxima <FaAngleRight />
              </Link>
            ) : (
              <span className="px-4 py-2 text-sm font-bold text-label opacity-40">
                Próxima <FaAngleRight className="ml-2 inline" />
              </span>
            )}
          </div>
        </ProductSelectionProvider>
      </section>
    </div>
  );
}
