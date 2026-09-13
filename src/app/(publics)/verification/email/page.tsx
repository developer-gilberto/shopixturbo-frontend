'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useActionState, useEffect } from 'react';
import {
  MdOutlineCheckCircleOutline,
  MdOutlineErrorOutline,
} from 'react-icons/md';
import {
  type ResendVerificationEmailFormState,
  resendVerificationEmail,
} from '@/actions/auth';

const INITIAL_RESEND_STATE: ResendVerificationEmailFormState = {};

function ResendVerificationEmailForm() {
  const [state, formAction, pending] = useActionState(
    resendVerificationEmail,
    INITIAL_RESEND_STATE,
  );

  return (
    <form
      action={formAction}
      className="flex flex-col items-center gap-2 w-full"
    >
      <p className="text-body font-bold mt-4">
        Digite o email que você cadastrou quando criou sua conta no ShopixTurbo
        e tente novamente.
      </p>

      <input
        type="email"
        name="email"
        placeholder="Digite seu email"
        id="verify-email-input"
        className="bg-btn-muted w-full rounded-btn-input p-2 mt-4"
        disabled={pending}
      />

      <input
        type="submit"
        value={pending ? 'Enviando...' : 'Reenviar email'}
        disabled={pending}
        className="bg-primary-base text-white font-bold w-full p-2 rounded-btn-input hover:bg-primary-hover cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      />

      {state.successMessage ? (
        <div className="bg-profit text-white font-bold flex gap-2 items-start rounded-card p-3 w-full">
          <MdOutlineCheckCircleOutline className="text-xl shrink-0" />
          <p className="text-sm">{state.successMessage}</p>
        </div>
      ) : null}

      {state.generalError ? (
        <div className="bg-alert-bg w-full text-alert-text font-bold flex gap-2 items-center rounded-card p-3">
          <MdOutlineErrorOutline className="text-xl shrink-0" />
          <p className="text-sm">{state.generalError}</p>
        </div>
      ) : null}
    </form>
  );
}

function VerificationEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const status = searchParams.get('status');

  useEffect(() => {
    if (status === 'verified_email') {
      router.replace('/');
    }
  }, [router, status]);

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh">
      <div className="flex flex-col items-center justify-center gap-4 max-w-md bg-card-bg rounded-card border-card-border-strong shadow-card p-8 w-full">
        <h2 className="text-primary-base text-4xl font-extrabold mt-4">
          Ativar conta
        </h2>

        <p className="text-body font-bold">
          É necessário verificar seu email para fazer login. Verifique sua caixa
          de entrada para ativar sua conta.
        </p>

        <p className="text-subtitle text-sm">Status: {status}</p>

        {status !== 'verified_email' ? <ResendVerificationEmailForm /> : null}
      </div>
    </div>
  );
}

export default function VerificationEmailPage() {
  return (
    <Suspense>
      <VerificationEmail />
    </Suspense>
  );
}
