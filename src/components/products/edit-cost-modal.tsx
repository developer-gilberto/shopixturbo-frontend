'use client';

import Image from 'next/image';
import { useActionState, useEffect, useRef, useState } from 'react';
import { FaPencilAlt } from 'react-icons/fa';
import { FaXmark } from 'react-icons/fa6';
import { MdOutlineErrorOutline } from 'react-icons/md';
import {
  type UpdateProductCostState,
  updateProductCost,
} from '@/actions/products';
import { CurrencyInput } from '@/components/products/currency-input';
import {
  formatCurrency,
  parseCurrencyToCents,
} from '@/components/products/currency-mask';
import { CopyText } from '@/components/ui/copy-text';
import { Notice } from '@/components/ui/notice';

interface EditCostModalProduct {
  id: string;
  external_id: string;
  name: string;
  sku: string;
  image_url: string;
  sale_price_cents: number;
  cost_price_cents: number | null;
  government_taxes: number | null;
}

interface EditCostModalProps {
  product: EditCostModalProduct;
  buttonClassName?: string;
}

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const INITIAL_STATE: UpdateProductCostState = {};

function parseDecimalInput(raw: string): number {
  const normalized = raw.trim().replace(',', '.');
  if (normalized === '') return 0;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : 0;
}

function formatBRL(cents: number): string {
  return BRL.format(cents / 100);
}

function formatPercent(value: number): string {
  return `${value.toFixed(1).replace('.', ',')}%`;
}

export function EditCostModal({
  product,
  buttonClassName,
}: EditCostModalProps) {
  const [open, setOpen] = useState(false);
  const [costValue, setCostValue] = useState('');
  const [taxInput, setTaxInput] = useState('');
  const [state, formAction, pending] = useActionState(
    updateProductCost,
    INITIAL_STATE,
  );
  const prevSuccess = useRef(false);

  const salePriceCents = product.sale_price_cents;
  const costPriceCents = parseCurrencyToCents(costValue);
  const taxPercent = parseDecimalInput(taxInput);
  const governmentTaxesCents = Math.round((salePriceCents * taxPercent) / 100);
  const totalCostCents = costPriceCents + governmentTaxesCents;
  const netProfitCents = salePriceCents - totalCostCents;
  const marginPercent =
    salePriceCents > 0 ? (netProfitCents / salePriceCents) * 100 : 0;

  const initialCostValue =
    (product.cost_price_cents ?? 0) > 0
      ? formatCurrency(String(product.cost_price_cents ?? 0))
      : '';
  const currentTaxPercent =
    product.government_taxes != null && salePriceCents > 0
      ? (product.government_taxes / salePriceCents) * 100
      : null;

  const handleOpen = () => {
    setCostValue(initialCostValue);
    setTaxInput(
      currentTaxPercent != null
        ? currentTaxPercent.toFixed(2).replace('.', ',')
        : '',
    );
    setOpen(true);
  };

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      setOpen(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (state.success && !prevSuccess.current) {
      prevSuccess.current = true;
      setOpen(false);
    }
  }, [state]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Editar custos"
        className={
          buttonClassName ??
          'inline-flex cursor-pointer items-center justify-center text-heading transition-colors hover:text-primary-base hover:underline'
        }
      >
        <FaPencilAlt />
      </button>
    );
  }

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-cost-title"
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-card bg-card-bg p-6 shadow-card"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2
              id="edit-cost-title"
              className="text-xl font-extrabold text-heading"
            >
              Cadastrar custos
            </h2>
            <p className="mt-1 text-sm text-subtitle">
              Informe o preço de custo e imposto do produto
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Fechar"
            className="cursor-pointer text-label transition-colors hover:text-heading"
          >
            <FaXmark className="text-xl" />
          </button>
        </div>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="external_id" value={product.external_id} />
          <input
            type="hidden"
            name="cost_price_cents"
            value={String(costPriceCents)}
          />
          <input
            type="hidden"
            name="government_taxes_cents"
            value={String(governmentTaxesCents)}
          />

          <div className="flex items-center gap-3 rounded-card bg-btn-muted p-3">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                width={48}
                height={48}
                className="h-12 w-12 shrink-0 rounded-btn-input object-cover"
              />
            ) : (
              <div className="h-12 w-12 shrink-0 rounded-btn-input bg-card-border" />
            )}
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-bold text-body">
                {product.name}
              </p>
              <CopyText label="ID" value={product.external_id} />
              <CopyText label="SKU" value={product.sku ?? '-'} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label
              htmlFor={`cost-price-${product.external_id}`}
              className="flex flex-col gap-1"
            >
              <span className="text-xs font-bold uppercase text-label">
                Preço de custo (R$)
              </span>
              <div className="flex items-center gap-2 rounded-btn-input bg-btn-muted px-3">
                <span className="text-sm font-bold text-subtitle">R$</span>
                <CurrencyInput
                  id={`cost-price-${product.external_id}`}
                  initialValue={initialCostValue}
                  onValueChange={setCostValue}
                  className="w-full bg-transparent p-2 text-sm font-semibold text-heading outline-none"
                />
              </div>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase text-label">
                Imposto (%)
              </span>
              <div className="flex items-center gap-2 rounded-btn-input bg-btn-muted px-3">
                <input
                  type="text"
                  inputMode="decimal"
                  value={taxInput}
                  onChange={(event) => setTaxInput(event.target.value)}
                  placeholder="0,0"
                  className="w-full bg-transparent p-2 text-sm font-semibold text-heading outline-none"
                />
                <span className="text-sm font-bold text-subtitle">%</span>
              </div>
            </label>
          </div>

          <div className="rounded-card border border-card-border p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-label">
              Prévia
            </p>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-subtitle">Preço de venda</dt>
                <dd className="font-bold text-heading">
                  {formatBRL(salePriceCents)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-subtitle">Total de custos</dt>
                <dd className="font-bold text-heading">
                  {formatBRL(totalCostCents)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-subtitle">Lucro líquido</dt>
                <dd
                  className={`font-bold ${
                    netProfitCents >= 0 ? 'text-profit' : 'text-prejudice'
                  }`}
                >
                  {formatBRL(netProfitCents)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-subtitle">Margem</dt>
                <dd
                  className={`font-bold ${
                    marginPercent >= 0 ? 'text-profit' : 'text-prejudice'
                  }`}
                >
                  {formatPercent(marginPercent)}
                </dd>
              </div>
            </dl>
          </div>

          {state.error ? (
            <Notice text={state.error}>
              <MdOutlineErrorOutline className="text-xl" />
            </Notice>
          ) : null}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="cursor-pointer rounded-btn-input bg-btn-muted px-4 py-2 text-sm font-bold text-heading transition-colors hover:bg-card-border"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={pending}
              className="cursor-pointer rounded-btn-input bg-primary-base px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
