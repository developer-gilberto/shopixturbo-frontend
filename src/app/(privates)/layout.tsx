import { AppShell } from '@/components/layout/app-shell';
import { verifySession } from '@/lib/dal';
import { getShopIdFromCookie } from '@/lib/session';

export default async function PrivateLayout({ children }: LayoutProps<'/'>) {
  const [{ user }, shopId] = await Promise.all([
    verifySession(),
    getShopIdFromCookie(),
  ]);

  const shopLogo =
    user.shop && !user.shop.deleted_at ? user.shop.shop_logo : null;

  return (
    <AppShell hasStore={Boolean(shopId)} shopLogo={shopLogo}>
      {children}
    </AppShell>
  );
}
