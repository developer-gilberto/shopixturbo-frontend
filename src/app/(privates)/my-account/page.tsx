import Image from 'next/image';
import { ConnectShopeeButton } from '@/components/ui/connect-shopee-button';
import { verifySession } from '@/lib/dal';
import { getShopIdFromCookie, getTokenFromCookie } from '@/lib/session';

interface Shop {
  id: string;
  shop_name: string;
  description: string | null;
  shop_logo: string | null;
  marketplace: string;
  authorization_expiration: string | null;
  authorized_in: string | null;
  status: string;
  invoice_issuer: string | null;
  region: string | null;
}

function formatDate(iso: string | null) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default async function MyAccountPage() {
  const { user } = await verifySession();
  const token = await getTokenFromCookie();
  const shopId = await getShopIdFromCookie();

  const userCard = (
    <section className="rounded-card bg-card-bg p-6 shadow-card">
      <h1 className="text-2xl font-extrabold text-heading mb-4">MINHA CONTA</h1>
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-btn-muted flex items-center justify-center text-lg font-bold text-label">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-heading">{user.name}</p>
          <p className="text-sm text-subtitle">{user.email}</p>
        </div>
      </div>
    </section>
  );

  if (!shopId) {
    return (
      <div className="space-y-6">
        {userCard}
        <section className="rounded-card bg-card-bg p-6">
          <p className="text-sm text-body">
            Nenhuma loja vinculada à sua conta. Conecte uma loja para começar.
          </p>
          <div className="mt-4">
            <ConnectShopeeButton highlight />
          </div>
        </section>
      </div>
    );
  }

  const res = await fetch(`${process.env.BACKEND_URL}/shops/full/${shopId}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    return (
      <div className="space-y-6">
        {userCard}
        <section className="rounded-card bg-card-bg p-6 text-heading">
          Não foi possível carregar os dados da loja.
        </section>
      </div>
    );
  }

  const shop: Shop = await res.json();

  const daysUntilExpiration = shop.authorization_expiration
    ? Math.ceil(
        (new Date(shop.authorization_expiration).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24),
      )
    : null;

  const isExpiringSoon =
    daysUntilExpiration !== null &&
    daysUntilExpiration >= 0 &&
    daysUntilExpiration <= 30;

  const isExpired = daysUntilExpiration !== null && daysUntilExpiration < 0;

  return (
    <div className="space-y-6">
      {userCard}

      <section className="rounded-card bg-card-bg p-6 shadow-card md:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {shop.shop_logo ? (
            <Image
              src={shop.shop_logo}
              alt={shop.shop_name}
              width={80}
              height={80}
              className="h-20 w-20 rounded-full object-cover shadow-card"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-btn-muted flex items-center justify-center text-xl font-bold text-label">
              {shop.shop_name.charAt(0)}
            </div>
          )}

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl font-extrabold text-heading truncate">
                {shop.shop_name}
              </h1>
              <span className="text-[11px] font-bold uppercase px-2 py-1 rounded-full bg-card-border text-heading">
                {shop.marketplace}
              </span>
              <span
                className={`text-[11px] font-bold uppercase px-2 py-1 rounded-full ${
                  shop.status === 'NORMAL'
                    ? 'bg-profit text-white'
                    : 'bg-prejudice text-white'
                }`}
              >
                {shop.status}
              </span>
            </div>

            {shop.description ? (
              <p className="text-sm text-subtitle max-w-xl truncate">
                {shop.description}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-card bg-card-bg p-6 shadow-card">
          <h2 className="text-sm font-bold uppercase text-label mb-3">
            Autorização
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-subtitle">Concedida em:</dt>
              <dd className="font-bold text-heading">
                {formatDate(shop.authorized_in)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-subtitle">Expira em:</dt>
              <dd
                className={`font-bold ${
                  isExpired
                    ? 'text-prejudice'
                    : isExpiringSoon
                      ? 'text-alert-text'
                      : 'text-heading'
                }`}
              >
                {formatDate(shop.authorization_expiration)}
                {isExpiringSoon ? (
                  <span className="ml-2 text-xs text-alert-text">
                    ({daysUntilExpiration} dias restantes)
                  </span>
                ) : null}
                {isExpired ? (
                  <span className="ml-2 text-xs text-prejudice">
                    (expirado)
                  </span>
                ) : null}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-card bg-card-bg p-6 shadow-card">
          <h2 className="text-sm font-bold uppercase text-label mb-3">
            Detalhes
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-subtitle">Região:</dt>
              <dd className="font-bold text-heading">{shop.region ?? '-'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-subtitle">Emissor de fatura:</dt>
              <dd className="font-bold text-heading">
                {shop.invoice_issuer ?? '-'}
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}
