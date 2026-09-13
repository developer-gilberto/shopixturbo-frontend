import { FaBolt } from 'react-icons/fa';
import {
  HiOutlineClipboardList,
  HiOutlineCube,
  HiOutlineCurrencyDollar,
  HiOutlinePrinter,
  HiOutlineSparkles,
  HiOutlineTrendingUp,
} from 'react-icons/hi';
import { MdOutlineAutoGraph, MdOutlineSecurity } from 'react-icons/md';
import { Logo } from '@/components/ui/logo';
import { ShopeeCallbackForm } from '@/components/ui/shopee-callback-form';
import { SignInForm } from '@/components/ui/signin-form';

const HIGHLIGHTS = [
  { Icon: FaBolt, label: 'Simples' },
  { Icon: HiOutlineSparkles, label: 'Fácil' },
  { Icon: MdOutlineAutoGraph, label: 'Útil' },
  { Icon: HiOutlineCurrencyDollar, label: 'Custos e lucro real' },
  { Icon: HiOutlineClipboardList, label: 'Pedidos e vendas' },
  { Icon: HiOutlineTrendingUp, label: 'Ranking de produtos' },
  { Icon: HiOutlinePrinter, label: 'Relatórios e impressão' },
];

const FEATURES = [
  {
    Icon: HiOutlineCube,
    title: 'Produtos',
    description:
      'Informe o preço de custo, imposto e pronto! O ShopixTurbo te dá um relatório completo de seus custos e lucros.',
  },
  {
    Icon: HiOutlineSparkles,
    title: 'Sem planilhas',
    description:
      'Chega de planilhas chatas ou anotações com papel e caneta! O ShopixTurbo faz todo trabalho pesado por você.',
  },
  {
    Icon: HiOutlineTrendingUp,
    title: 'Decisões certeiras',
    description:
      'Veja o desempenho da sua loja de forma simples e clara. O ShopixTurbo oferece um ranking dos produtos da sua loja mais vendidos e os mais lucrativos.',
  },
  {
    Icon: HiOutlinePrinter,
    title: 'Relatórios com apenas 1 clique',
    description:
      'Gere relatórios e imprima direto pelo navegador, ou se preferir, baixe o arquivo e envie para quem você quiser.',
  },
  {
    Icon: HiOutlineCurrencyDollar,
    title: 'Custos e lucro real',
    description: 'Saiba exatamente quanto gasta e quanto lucra em cada venda.',
  },
  {
    Icon: HiOutlineClipboardList,
    title: 'Pedidos e vendas',
    description: 'Acompanhe seus pedidos por período e status de entrega.',
  },
];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    code?: string | string[];
    shop_id?: string | string[];
  }>;
}) {
  const params = await searchParams;

  if (typeof params.code === 'string' && typeof params.shop_id === 'string') {
    return <ShopeeCallbackForm code={params.code} shopId={params.shop_id} />;
  }

  const securityNotice = (
    <div className="bg-btn-muted text-subtitle flex gap-2 items-start rounded-card mt-4 p-3">
      <MdOutlineSecurity className="shrink-0" size={20} />
      <p className="text-sm">
        Nós nunca teremos acesso às suas senhas ou controle direto sobre sua
        loja. O ShopixTurbo utiliza a API oficial da Shopee para leitura de
        dados de pedidos e produtos, permitindo que você visualize seus custos e
        sua margem real de lucro.
      </p>
    </div>
  );

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <section className="flex w-full flex-col justify-center gap-6 bg-card-bg p-6 md:w-1/2 md:p-12 lg:p-16">
        <div className="flex flex-col gap-4">
          <Logo logoFull width={200} className="w-48 md:w-60" />

          <h1 className="text-3xl font-extrabold text-heading md:text-5xl">
            Sua loja Shopee{' '}
            <span className="text-primary-base">no controle total</span>
          </h1>

          <p className="text-body">
            Conecte sua loja à API oficial da Shopee e veja em segundos seus
            produtos, pedidos, custos e a margem real de lucro — tudo em um só
            lugar, sem planilhas e sem complicação.
          </p>
        </div>

        <ul className="flex flex-wrap items-center gap-2">
          {HIGHLIGHTS.map(({ Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-2 rounded-full bg-page-bg px-4 py-1.5 text-sm font-bold text-heading"
            >
              <Icon className="text-primary-base" />
              {label}
            </li>
          ))}
        </ul>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FEATURES.map(({ Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col gap-2 rounded-card bg-page-bg p-4"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-btn-input bg-primary-soft text-primary-base">
                <Icon className="text-2xl" />
              </div>
              <h2 className="font-bold text-heading">{title}</h2>
              <p className="text-sm text-body">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex w-full flex-1 items-center justify-center p-4 md:w-1/2 md:p-8">
        <SignInForm securityNotice={securityNotice} />
      </section>
    </div>
  );
}
