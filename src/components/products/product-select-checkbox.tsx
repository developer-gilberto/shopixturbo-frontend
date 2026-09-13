'use client';

import { useProductSelection } from '@/components/products/product-selection-provider';

interface ProductSelectCheckboxProps {
  externalId: string;
}

export function ProductSelectCheckbox({
  externalId,
}: ProductSelectCheckboxProps) {
  const { selectedExternalIds, toggle } = useProductSelection();
  const checked = selectedExternalIds.includes(externalId);

  return (
    <label
      className="inline-flex cursor-pointer items-center"
      aria-label="Selecionar produto para edição em lote"
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={() => toggle(externalId)}
        className="h-4 w-4 shrink-0 cursor-pointer accent-primary-base"
      />
    </label>
  );
}
