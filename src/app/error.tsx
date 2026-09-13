'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { MdOutlineErrorOutline } from 'react-icons/md';
import { Logo } from '@/components/ui/logo';
import { Notice } from '@/components/ui/notice';

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh">
      <div className="flex flex-col items-center justify-center gap-4 max-w-md bg-card-bg rounded-card border-card-border-strong shadow-card p-8 text-center">
        <Logo logoFull width={200} />

        <Notice text={`Algo deu errado`}>
          <MdOutlineErrorOutline className="text-xl" />
        </Notice>

        <h1 className="text-heading text-4xl font-bold">
          Ocorreu um erro inesperado
        </h1>

        <p className="text-body">
          Não foi possível carregar esta página. Tente novamente ou volte para a
          página inicial.
        </p>

        <button
          type="button"
          onClick={retry}
          className="bg-primary-base text-white font-bold w-full p-2 rounded-btn-input hover:bg-primary-hover cursor-pointer mt-2"
        >
          Tentar novamente
        </button>

        <Link
          href="/"
          className="bg-primary-base text-white font-bold w-full p-2 rounded-btn-input hover:bg-primary-hover cursor-pointer mt-2"
        >
          Voltar para o início
        </Link>
      </div>
    </div>
  );
}
