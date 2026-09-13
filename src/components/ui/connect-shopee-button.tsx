'use client';

import { useActionState } from 'react';
import { FaShop } from 'react-icons/fa6';
import { type ConnectShopFormState, connectShop } from '@/actions/shopee';

const INITIAL_STATE: ConnectShopFormState = {};

interface ConnectShopeeButtonProps {
  highlight?: boolean;
}

export function ConnectShopeeButton({
  highlight = false,
}: ConnectShopeeButtonProps) {
  const [state, formAction, pending] = useActionState(
    connectShop,
    INITIAL_STATE,
  );

  return (
    <form action={formAction}>
      <button
        type="submit"
        disabled={pending}
        className={`flex items-center gap-2 bg-primary-base text-white font-bold rounded-btn-input px-4 py-2 hover:bg-primary-hover cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          highlight ? 'animate-attention' : ''
        }`}
      >
        <FaShop />
        {pending ? 'Conectando...' : 'Conectar-se à Shopee'}
      </button>
      {state.generalError ? (
        <p className="text-alert-text text-sm mt-2">{state.generalError}</p>
      ) : null}
    </form>
  );
}
