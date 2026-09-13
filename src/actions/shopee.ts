'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/dal';
import { storeShopId } from '@/lib/session';

export interface ConnectShopFormState {
  generalError?: string;
}

export interface ProcessShopeeCallbackState {
  error?: string;
}

const BACKEND_URL = process.env.BACKEND_URL;

export async function processShopeeCallback(
  _prevState: ProcessShopeeCallbackState,
  formData: FormData,
): Promise<ProcessShopeeCallbackState> {
  await verifySession();

  const code = String(formData.get('code') ?? '');
  const shopId = String(formData.get('shop_id') ?? '');

  if (!BACKEND_URL) {
    throw new Error('BACKEND_URL não configurada');
  }

  if (!code || !shopId) {
    return { error: 'Dados do callback inválidos.' };
  }

  const token = (await cookies()).get('user_auth_token')?.value;

  const url = `${BACKEND_URL}/integration/shopee/callback/access-token?code=${encodeURIComponent(code)}&shop_id=${encodeURIComponent(shopId)}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    return { error: 'Não foi possível conectar a loja. Tente novamente.' };
  }

  const data = (await res.json()) as { shop?: { id?: string } };

  if (!data.shop?.id) {
    return { error: 'Resposta inesperada do servidor.' };
  }

  await storeShopId(data.shop.id);

  redirect('/my-account');
}

export async function connectShop(
  _prevState: ConnectShopFormState,
  _formData: FormData,
): Promise<ConnectShopFormState> {
  await verifySession();

  if (!BACKEND_URL) {
    throw new Error('BACKEND_URL não configurada');
  }

  const token = (await cookies()).get('user_auth_token')?.value;

  let response: Response;

  try {
    response = await fetch(`${BACKEND_URL}/integration/shopee/auth-url`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
  } catch {
    return {
      generalError: 'Não foi possível conectar ao servidor. Tente novamente.',
    };
  }

  if (!response.ok) {
    return {
      generalError:
        'Não foi possível gerar o link de conexão. Tente novamente.',
    };
  }

  const data = (await response.json()) as { auth_url?: string };

  if (!data.auth_url) {
    return { generalError: 'Resposta inesperada do servidor.' };
  }

  redirect(data.auth_url);
}
