'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

interface ProductSelectionContextValue {
  selectedExternalIds: string[];
  toggle: (externalId: string) => void;
  selectAll: (externalIds: string[]) => void;
  clearSelection: () => void;
  selectedCount: number;
}

const ProductSelectionContext =
  createContext<ProductSelectionContextValue | null>(null);

export function ProductSelectionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  const toggle = useCallback((externalId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(externalId)) {
        next.delete(externalId);
      } else {
        next.add(externalId);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback((externalIds: string[]) => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const externalId of externalIds) {
        next.add(externalId);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelected(new Set());
  }, []);

  const value = useMemo(
    () => ({
      selectedExternalIds: [...selected],
      toggle,
      selectAll,
      clearSelection,
      selectedCount: selected.size,
    }),
    [selected, toggle, selectAll, clearSelection],
  );

  return (
    <ProductSelectionContext.Provider value={value}>
      {children}
    </ProductSelectionContext.Provider>
  );
}

export function useProductSelection(): ProductSelectionContextValue {
  const context = useContext(ProductSelectionContext);
  if (!context) {
    throw new Error(
      'useProductSelection deve ser usado dentro de ProductSelectionProvider',
    );
  }
  return context;
}
