'use client';

import Link from 'next/link';
import { type ReactNode, useActionState, useState } from 'react';
import {
  MdOutlineCheckCircleOutline,
  MdOutlineErrorOutline,
} from 'react-icons/md';
import { RiVerifiedBadgeFill } from 'react-icons/ri';
import {
  type ResendVerificationEmailFormState,
  resendVerificationEmail,
  type SignUpFormState,
  signUp,
} from '@/actions/auth';
import { Logo } from '@/components/ui/logo';
import { Notice } from '@/components/ui/notice';
import { PasswordInput } from '@/components/ui/password-input';

const INITIAL_STATE: SignUpFormState = {};
const INITIAL_RESEND_STATE: ResendVerificationEmailFormState = {};

export function SignUpForm({ securityNotice }: { securityNotice: ReactNode }) {
  const [email, setEmail] = useState('');
  const [state, formAction, pending] = useActionState(signUp, INITIAL_STATE);
  const [resendState, resendFormAction, resendPending] = useActionState(
    resendVerificationEmail,
    INITIAL_RESEND_STATE,
  );

  return (
    <div className="flex flex-col items-center justify-center gap-4 max-w-md bg-card-bg rounded-card border-card-border-strong shadow-card p-8">
      <Logo logoFull width={250} />

      <div className="flex gap-2 items-center bg-badge-bg py-1 px-4 rounded-btn-input text-badge-text font-bold">
        <RiVerifiedBadgeFill />
        Oficial Shopee Partner
      </div>

      <p className="text-body font-bold mt-4">
        Tenha controle total da sua loja Shopee. Veja seus custos e lucros na
        Shopee em segundos.
      </p>

      <form
        action={formAction}
        className="flex flex-col items-center justify-center gap-4 w-full"
      >
        <input
          type="text"
          name="name"
          placeholder="Digite seu nome"
          id="name-input"
          className="bg-btn-muted w-full rounded-btn-input p-2 mt-4"
          aria-invalid={Boolean(state.fieldErrors?.name)}
        />
        {state.fieldErrors?.name ? (
          <p className="text-alert-text text-sm w-full">
            {state.fieldErrors.name}
          </p>
        ) : null}

        <input
          type="email"
          name="email"
          placeholder="Digite seu email"
          id="email-input"
          className="bg-btn-muted w-full rounded-btn-input p-2"
          aria-invalid={Boolean(state.fieldErrors?.email)}
          onChange={(event) => setEmail(event.target.value)}
        />
        {state.fieldErrors?.email ? (
          <p className="text-alert-text text-sm w-full">
            {state.fieldErrors.email}
          </p>
        ) : null}

        <PasswordInput
          aria-invalid={Boolean(state.fieldErrors?.password)}
          errorMessage={state.fieldErrors?.password}
        />

        {state.generalError ? (
          <Notice text={state.generalError}>
            <MdOutlineErrorOutline className="text-xl" />
          </Notice>
        ) : null}

        <input
          type="submit"
          value={pending ? 'Criando conta...' : 'Criar conta'}
          disabled={pending}
          className="bg-primary-base text-white font-bold w-full p-2 rounded-btn-input hover:bg-primary-hover cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        />

        <div className="mt-4">
          Já tem uma conta?
          <Link
            href="/"
            className="text-primary-base font-bold hover:text-primary-hover hover:underline cursor-pointer"
          >
            {' '}
            Entrar
          </Link>
        </div>
      </form>

      {state.successMessage ? (
        <div className="bg-profit text-white font-bold flex gap-2 items-start rounded-card p-3 w-full">
          <MdOutlineCheckCircleOutline className="text-xl shrink-0" />
          <div>
            <p className="text-sm">{state.successMessage}</p>
            <form action={resendFormAction}>
              <input type="hidden" name="email" value={email} />
              <button
                type="submit"
                disabled={resendPending}
                className="text-sm underline hover:no-underline disabled:no-underline disabled:opacity-70 cursor-pointer mt-2"
              >
                {resendPending
                  ? 'Enviando...'
                  : 'Não recebeu o email? Reenviar email'}
              </button>
            </form>
            {resendState.successMessage ? (
              <p className="text-sm mt-2">{resendState.successMessage}</p>
            ) : null}
            {resendState.generalError ? (
              <p className="text-alert-text text-sm mt-2">
                {resendState.generalError}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {securityNotice}
    </div>
  );
}
