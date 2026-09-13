'use client';

import { useProductSelection } from '@/components/products/product-selection-provider';

interface ProductSelectAllCheckboxProps {
  externalIds: string[];
}

export function ProductSelectAllCheckbox({
  externalIds,
}: ProductSelectAllCheckboxProps) {
  const { selectedExternalIds, selectAll, clearSelection } =
    useProductSelection();

  const allSelected =
    externalIds.length > 0 &&
    externalIds.every((externalId) => selectedExternalIds.includes(externalId));
  const someSelected = externalIds.some((externalId) =>
    selectedExternalIds.includes(externalId),
  );

  return (
    <label
      className="inline-flex cursor-pointer items-center"
      aria-label="Selecionar todos os produtos da página"
    >
      <input
        type="checkbox"
        checked={allSelected}
        ref={(element) => {
          if (element) {
            element.indeterminate = someSelected && !allSelected;
          }
        }}
        onChange={() => {
          if (allSelected) {
            clearSelection();
          } else {
            selectAll(externalIds);
          }
        }}
        className="h-4 w-4 shrink-0 cursor-pointer accent-primary-base"
      />
    </label>
  );
}
