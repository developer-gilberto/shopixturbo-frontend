import { MdOutlineSecurity } from 'react-icons/md';
import { ShopeeCallbackForm } from '@/components/ui/shopee-callback-form';
import { SignInForm } from '@/components/ui/signin-form';

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
    <div className="flex flex-col items-center justify-center min-h-dvh">
      <SignInForm securityNotice={securityNotice} />
    </div>
  );
}
