'use server';

import { storeShopId, verifyAuthToken } from '@/lib/session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export interface SignInFormState {
  fieldErrors?: {
    email?: string;
    password?: string;
  };
  generalError?: string;
}

export interface SignUpFormState {
  fieldErrors?: {
    name?: string;
    email?: string;
    password?: string;
  };
  generalError?: string;
  successMessage?: string;
}

export interface ResendVerificationEmailFormState {
  successMessage?: string;
  generalError?: string;
}

const BACKEND_URL = process.env.BACKEND_URL;

async function restoreLinkedShop(token: string) {
  const payload = await verifyAuthToken(token);
  if (payload?.shop?.id && !payload.shop.deleted_at) {
    await storeShopId(payload.shop.id);
  }
}

export async function signIn(
  _prevState: SignInFormState,
  formData: FormData,
): Promise<SignInFormState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  const fieldErrors: SignInFormState['fieldErrors'] = {};

  if (!email) {
    fieldErrors.email = 'Informe seu email';
  }

  if (!password) {
    fieldErrors.password = 'Informe sua senha';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  if (!BACKEND_URL) {
    throw new Error('BACKEND_URL não configurada');
  }

  let response: Response;

  try {
    response = await fetch(`${BACKEND_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    return {
      generalError: 'Não foi possível conectar ao servidor. Tente novamente.',
    };
  }

  if (response.ok) {
    const data = (await response.json()) as { user_auth_token?: string };

    if (!data.user_auth_token) {
      throw new Error('Resposta inesperada do servidor');
    }

    const cookieStore = await cookies();
    cookieStore.set('user_auth_token', data.user_auth_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    await restoreLinkedShop(data.user_auth_token);

    redirect('/dashboard');
  }

  if (response.status === 400) {
    const body = (await response.json().catch(() => null)) as {
      message?: string | string[];
    } | null;

    const errors: string[] = Array.isArray(body?.message)
      ? body.message
      : body?.message
        ? [body.message]
        : [];

    const nextFieldErrors: SignInFormState['fieldErrors'] = {};

    for (const error of errors) {
      const lower = error.toLowerCase();

      if (lower.startsWith('email') && !nextFieldErrors.email) {
        nextFieldErrors.email = error;
      } else if (lower.startsWith('senha') && !nextFieldErrors.password) {
        nextFieldErrors.password = error;
      }
    }

    return {
      fieldErrors: nextFieldErrors,
      generalError:
        nextFieldErrors.email || nextFieldErrors.password
          ? undefined
          : 'Dados inválidos',
    };
  }

  let generalError = 'Não foi possível fazer login. Tente novamente.';

  try {
    const body = (await response.json()) as { message?: string } | null;
    if (body?.message) {
      generalError = body.message;
    }
  } catch {
    // mantém a mensagem padrão
  }

  return { generalError };
}

export async function signUp(
  _prevState: SignUpFormState,
  formData: FormData,
): Promise<SignUpFormState> {
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  const fieldErrors: SignUpFormState['fieldErrors'] = {};

  if (!name) {
    fieldErrors.name = 'Informe seu nome';
  }

  if (!email) {
    fieldErrors.email = 'Informe seu email';
  }

  if (!password) {
    fieldErrors.password = 'Informe sua senha';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  if (!BACKEND_URL) {
    throw new Error('BACKEND_URL não configurada');
  }

  let response: Response;

  try {
    response = await fetch(`${BACKEND_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });
  } catch {
    return {
      generalError: 'Não foi possível conectar ao servidor. Tente novamente.',
    };
  }

  if (response.status === 201) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;

    return {
      successMessage:
        body?.message ??
        `Enviamos um email para '${email}'. Verifique sua caixa de entrada para ativar sua conta. Caso não esteja na caixa de entrada, verifique sua caixa de spam.`,
    };
  }

  if (response.status === 400) {
    const body = (await response.json().catch(() => null)) as {
      message?: string | string[];
    } | null;

    const errors: string[] = Array.isArray(body?.message)
      ? body.message
      : body?.message
        ? [body.message]
        : [];

    const nextFieldErrors: SignUpFormState['fieldErrors'] = {};

    for (const error of errors) {
      const lower = error.toLowerCase();

      if (lower.startsWith('nome') && !nextFieldErrors.name) {
        nextFieldErrors.name = error;
      } else if (lower.startsWith('email') && !nextFieldErrors.email) {
        nextFieldErrors.email = error;
      } else if (lower.startsWith('senha') && !nextFieldErrors.password) {
        nextFieldErrors.password = error;
      }
    }

    return {
      fieldErrors: nextFieldErrors,
      generalError:
        nextFieldErrors.name ||
        nextFieldErrors.email ||
        nextFieldErrors.password
          ? undefined
          : 'Dados inválidos',
    };
  }

  let generalError = 'Não foi possível criar sua conta. Tente novamente.';

  try {
    const body = (await response.json()) as { message?: string } | null;
    if (body?.message) {
      generalError = body.message;
    }
  } catch {
    // mantém a mensagem padrão
  }

  return { generalError };
}

export async function resendVerificationEmail(
  _prevState: ResendVerificationEmailFormState,
  formData: FormData,
): Promise<ResendVerificationEmailFormState> {
  const email = String(formData.get('email') ?? '').trim();

  if (!email) {
    return {
      generalError: 'Informe seu email para reenviar a verificação.',
    };
  }

  if (!BACKEND_URL) {
    throw new Error('BACKEND_URL não configurada');
  }

  let response: Response;

  try {
    response = await fetch(`${BACKEND_URL}/auth/resend-verification-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
  } catch {
    return {
      generalError: 'Não foi possível conectar ao servidor. Tente novamente.',
    };
  }

  if (response.status === 202) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;

    return {
      successMessage:
        body?.message ??
        'Se o email estiver cadastrado, você receberá um novo link de verificação.',
    };
  }

  if (response.status === 400) {
    const body = (await response.json().catch(() => null)) as {
      message?: string | string[];
    } | null;

    const message = Array.isArray(body?.message)
      ? body.message[0]
      : body?.message;

    return {
      generalError: message ?? 'Email inválido',
    };
  }

  let generalError = 'Não foi possível reenviar o email. Tente novamente.';

  try {
    const body = (await response.json()) as { message?: string } | null;
    if (body?.message) {
      generalError = body.message;
    }
  } catch {
    // mantém a mensagem padrão
  }

  return { generalError };
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete('user_auth_token');
  cookieStore.delete('shop_id');
  redirect('/');
}
