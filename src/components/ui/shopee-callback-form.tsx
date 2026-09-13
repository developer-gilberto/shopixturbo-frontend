'use client';

import { useActionState, useEffect, useRef } from 'react';
import {
  type ProcessShopeeCallbackState,
  processShopeeCallback,
} from '@/actions/shopee';
import { Loader } from '@/components/ui/loader';

const INITIAL_STATE: ProcessShopeeCallbackState = {};

export function ShopeeCallbackForm({
  code,
  shopId,
}: {
  code: string;
  shopId: string;
}) {
  const [state, formAction] = useActionState(
    processShopeeCallback,
    INITIAL_STATE,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    formRef.current?.requestSubmit();
  }, []);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col items-center justify-center min-h-dvh gap-4 bg-card-bg text-heading"
    >
      <input type="hidden" name="code" value={code} />
      <input type="hidden" name="shop_id" value={shopId} />
      <button type="submit" className="hidden" />
      {state.error ? (
        <p className="text-alert-text text-sm">{state.error}</p>
      ) : (
        <Loader />
      )}
    </form>
  );
}
