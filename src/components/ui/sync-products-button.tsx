'use client';

import { useActionState } from 'react';
import { FaSyncAlt } from 'react-icons/fa';
import { type SyncProductsState, syncProducts } from '@/actions/products';

const INITIAL_STATE: SyncProductsState = {};

export function SyncProductsButton() {
  const [state, formAction, pending] = useActionState(
    syncProducts,
    INITIAL_STATE,
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="flex items-center justify-center gap-2 bg-primary-base text-white font-bold rounded-btn-input py-2 px-4 hover:bg-primary-hover cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <FaSyncAlt className={pending ? 'animate-spin' : undefined} />
        {pending ? 'Sincronizando produtos...' : 'Sincronizar produtos'}
      </button>
      {state.success ? (
        <p className="text-xs font-bold text-profit">{state.success}</p>
      ) : null}
      {state.error ? (
        <p className="text-xs font-bold text-alert-text">{state.error}</p>
      ) : null}
    </form>
  );
}
