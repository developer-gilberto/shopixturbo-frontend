'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useActionState } from 'react';
import { MdOutlineErrorOutline } from 'react-icons/md';
import { RiVerifiedBadgeFill } from 'react-icons/ri';
import { type SignInFormState, signIn } from '@/actions/auth';
import { Logo } from '@/components/ui/logo';
import { Notice } from '@/components/ui/notice';
import { PasswordInput } from '@/components/ui/password-input';

const INITIAL_STATE: SignInFormState = {};

export function SignInForm({ securityNotice }: { securityNotice: ReactNode }) {
  const [state, formAction, pending] = useActionState(signIn, INITIAL_STATE);

  return (
    <form
      action={formAction}
      className="flex flex-col items-center justify-center gap-4 max-w-md bg-card-bg rounded-card border-card-border-strong shadow-card p-8"
    >
      <Logo logoFull width={250} />

      <div className="flex gap-2 items-center bg-badge-bg py-1 px-4 rounded-btn-input text-badge-text font-bold">
        <RiVerifiedBadgeFill />
        Oficial Shopee Partner
      </div>

      <h2 className="text-primary-base text-4xl font-extrabold mt-4">Login</h2>

      <input
        type="email"
        name="email"
        placeholder="Digite seu email"
        id="email-input"
        className="bg-btn-muted w-full rounded-btn-input p-2 mt-4"
        aria-invalid={Boolean(state.fieldErrors?.email)}
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
        value={pending ? 'Entrando...' : 'Entrar'}
        disabled={pending}
        className="bg-primary-base text-white font-bold w-full p-2 rounded-btn-input hover:bg-primary-hover cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      />

      <div className="mt-4">
        Não tem uma conta?
        <Link
          href="/signup"
          className="text-primary-base font-bold hover:text-primary-hover hover:underline cursor-pointer"
        >
          {' '}
          Criar conta
        </Link>
      </div>

      {securityNotice}
    </form>
  );
}
