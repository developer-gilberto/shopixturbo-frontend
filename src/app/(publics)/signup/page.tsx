import { MdOutlineSecurity } from 'react-icons/md';
import { SignUpForm } from '@/components/ui/signup-form';

export default function Signup() {
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
      <SignUpForm securityNotice={securityNotice} />
    </div>
  );
}
