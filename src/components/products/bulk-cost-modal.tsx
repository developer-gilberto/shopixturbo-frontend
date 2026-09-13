'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { FaXmark } from 'react-icons/fa6';
import { MdOutlineErrorOutline } from 'react-icons/md';
import {
  type UpdateProductCostState,
  updateProductCost,
} from '@/actions/products';
import { CurrencyInput } from '@/components/products/currency-input';
import { parseCurrencyToCents } from '@/components/products/currency-mask';
import { useProductSelection } from '@/components/products/product-selection-provider';
import { Notice } from '@/components/ui/notice';

interface BulkCostModalProduct {
  external_id: string;
  sale_price_cents: number;
  cost_price_cents: number | null;
  government_taxes: number | null;
}

interface BulkCostModalProps {
  products: BulkCostModalProduct[];
}

type CostMode = 'both' | 'cost' | 'tax';

const COST_MODES: { value: CostMode; label: string }[] = [
  { value: 'both', label: 'Custo e imposto' },
  { value: 'cost', label: 'Somente custo' },
  { value: 'tax', label: 'Somente imposto' },
];

const MODE_DESCRIPTIONS: Record<CostMode, string> = {
  both: 'O mesmo preço de custo e a mesma porcentagem de imposto serão aplicados a todos os produtos selecionados.',
  cost: 'O mesmo preço de custo será aplicado a todos os produtos selecionados. O imposto de cada um será mantido.',
  tax: 'O mesmo percentual de imposto será aplicado a todos os produtos selecionados. O custo de cada um será mantido.',
};

const INITIAL_STATE: UpdateProductCostState = {};

function parseDecimalInput(raw: string): number {
  const normalized = raw.trim().replace(',', '.');
  if (normalized === '') return 0;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : 0;
}

export function BulkCostModal({ products }: BulkCostModalProps) {
  const { selectedExternalIds, selectedCount, clearSelection } =
    useProductSelection();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<CostMode>('both');
  const [costValue, setCostValue] = useState('');
  const [taxInput, setTaxInput] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState(
    updateProductCost,
    INITIAL_STATE,
  );
  const prevSuccess = useRef(false);
  const submittedRef = useRef(false);

  const includesCost = mode !== 'tax';
  const includesTax = mode !== 'cost';

  const taxPercent = parseDecimalInput(taxInput);
  const costPriceCents = parseCurrencyToCents(costValue);

  const productsById = new Map(
    products.map((product) => [product.external_id, product]),
  );
  const taxCentsByProduct = new Map(
    products.map((product) => [
      product.external_id,
      Math.round((product.sale_price_cents * taxPercent) / 100),
    ]),
  );

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      setOpen(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setMode('both');
    setCostValue('');
    setTaxInput('');
    setLocalError(null);
    prevSuccess.current = false;
    submittedRef.current = false;
    setOpen(true);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    submittedRef.current = true;
    if (includesCost && costValue.trim() === '') {
      setLocalError('Informe o preço de custo.');
      event.preventDefault();
      return;
    }
    if (includesTax && taxInput.trim() === '') {
      setLocalError('Informe o percentual de imposto.');
      event.preventDefault();
    }
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
      clearSelection();
      setLocalError(null);
    }
  }, [state, clearSelection]);

  return (
    <>
      {selectedCount > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-card-border bg-btn-muted px-4 py-3">
          <p className="text-sm font-bold text-heading">
            {selectedCount}{' '}
            {selectedCount === 1
              ? 'produto selecionado'
              : 'produtos selecionados'}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={clearSelection}
              className="cursor-pointer rounded-btn-input bg-card-bg px-4 py-2 text-sm font-bold text-heading transition-colors hover:bg-card-border"
            >
              Limpar
            </button>
            <button
              type="button"
              onClick={handleOpen}
              className="cursor-pointer rounded-btn-input bg-primary-base px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
            >
              Cadastrar dados de custo
            </button>
          </div>
        </div>
      ) : null}

      {open ? (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={handleBackdropClick}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="bulk-cost-title"
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-card bg-card-bg p-6 shadow-card"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2
                  id="bulk-cost-title"
                  className="text-xl font-extrabold text-heading"
                >
                  Aplicar custos em lote
                </h2>
                <p className="mt-1 text-sm text-subtitle">
                  {selectedCount}{' '}
                  {selectedCount === 1
                    ? 'produto selecionado'
                    : 'produtos selecionados'}
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

            <form
              action={formAction}
              onSubmit={handleSubmit}
              className="space-y-4"
              aria-label="Cadastrar custos em lote"
            >
              <input
                type="hidden"
                name="cost_mode"
                value={mode}
                aria-hidden="true"
              />

              <fieldset>
                <legend className="text-xs font-bold uppercase text-label">
                  O que deseja cadastrar?
                </legend>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {COST_MODES.map((option) => {
                    const active = mode === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setMode(option.value)}
                        className={`cursor-pointer rounded-btn-input px-2 py-2 text-xs font-bold transition-colors ${
                          active
                            ? 'bg-primary-base text-white'
                            : 'bg-btn-muted text-heading hover:bg-card-border'
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {selectedExternalIds.map((externalId) => {
                const existing = productsById.get(externalId);
                return (
                  <div key={externalId} className="hidden">
                    <input
                      type="hidden"
                      name="external_id"
                      value={externalId}
                    />
                    <input
                      type="hidden"
                      name="cost_price_cents"
                      value={String(
                        includesCost
                          ? costPriceCents
                          : (existing?.cost_price_cents ?? 0),
                      )}
                    />
                    <input
                      type="hidden"
                      name="government_taxes_cents"
                      value={String(
                        includesTax
                          ? (taxCentsByProduct.get(externalId) ?? 0)
                          : (existing?.government_taxes ?? 0),
                      )}
                    />
                  </div>
                );
              })}

              <p className="text-sm text-subtitle">{MODE_DESCRIPTIONS[mode]}</p>

              {includesCost ? (
                <label
                  htmlFor="bulk-cost-price"
                  className="flex flex-col gap-1"
                >
                  <span className="text-xs font-bold uppercase text-label">
                    Preço de custo (R$)
                  </span>
                  <div className="flex items-center gap-2 rounded-btn-input bg-btn-muted px-3">
                    <span className="text-sm font-bold text-subtitle">R$</span>
                    <CurrencyInput
                      id="bulk-cost-price"
                      initialValue=""
                      onValueChange={setCostValue}
                      className="w-full bg-transparent p-2 text-sm font-semibold text-heading outline-none"
                    />
                  </div>
                </label>
              ) : null}

              {includesTax ? (
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
              ) : null}

              {(localError ??
              (submittedRef.current ? state.error : undefined)) ? (
                <Notice
                  text={
                    localError ??
                    (submittedRef.current ? state.error : undefined) ??
                    ''
                  }
                >
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
      ) : null}
    </>
  );
}
