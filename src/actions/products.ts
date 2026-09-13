'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/dal';
import { getShopIdFromCookie } from '@/lib/session';

export interface UpdateProductCostState {
  error?: string;
  success?: boolean;
}

const BACKEND_URL = process.env.BACKEND_URL;

export async function updateProductCost(
  _prevState: UpdateProductCostState,
  formData: FormData,
): Promise<UpdateProductCostState> {
  await verifySession();

  const externalIds = formData
    .getAll('external_id')
    .map((value) => String(value))
    .filter(Boolean);
  const governmentTaxesList = formData
    .getAll('government_taxes_cents')
    .map((value) => Number(value));
  const costPriceCents = Number(formData.get('cost_price_cents') ?? 0);

  if (externalIds.length === 0) {
    return { error: 'Produto inválido.' };
  }

  if (
    !Number.isFinite(costPriceCents) ||
    costPriceCents < 0 ||
    governmentTaxesList.length !== externalIds.length ||
    governmentTaxesList.some((value) => !Number.isFinite(value) || value < 0)
  ) {
    return { error: 'Informe valores válidos de custo e imposto.' };
  }

  const shopId = await getShopIdFromCookie();

  if (!shopId) {
    return { error: 'Nenhuma loja vinculada à sua conta.' };
  }

  if (!BACKEND_URL) {
    return { error: 'Erro interno: BACKEND_URL não configurada.' };
  }

  const token = (await cookies()).get('user_auth_token')?.value;

  let response: Response;

  try {
    response = await fetch(`${BACKEND_URL}/products/cost-taxes/${shopId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        products: externalIds.map((id, index) => ({
          id,
          cost_price_cents: Math.round(costPriceCents),
          government_taxes: Math.round(governmentTaxesList[index] ?? 0),
        })),
      }),
    });
  } catch {
    return {
      error: 'Não foi possível conectar ao servidor. Tente novamente.',
    };
  }

  if (!response.ok) {
    return { error: 'Não foi possível salvar as alterações. Tente novamente.' };
  }

  revalidatePath('/products');

  return { success: true };
}
