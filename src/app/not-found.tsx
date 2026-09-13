import Link from 'next/link';
import { Logo } from '@/components/ui/logo';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh">
      <div className="flex flex-col items-center justify-center gap-4 max-w-md bg-card-bg rounded-card border-card-border-strong shadow-card p-8 text-center">
        <Logo logoFull width={200} />

        <div className="flex gap-2 items-center bg-badge-bg py-1 px-4 rounded-btn-input text-badge-text font-bold text-2xl">
          404
        </div>

        <h1 className="text-heading text-4xl font-bold">
          Página não encontrada
        </h1>

        <p className="text-body">
          A página que você procura não existe ou foi movida. Verifique a URL ou
          volte para a página inicial.
        </p>

        <Link
          href="/dashboard"
          className="bg-primary-base text-white font-bold w-full p-2 rounded-btn-input hover:bg-primary-hover cursor-pointer mt-2"
        >
          Voltar para o início
        </Link>
      </div>
    </div>
  );
}
