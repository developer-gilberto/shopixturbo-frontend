import { AppShell } from '@/components/layout/app-shell';
import { getShopIdFromCookie } from '@/lib/session';

export default async function PrivateLayout({ children }: LayoutProps<'/'>) {
  const shopId = await getShopIdFromCookie();

  return <AppShell hasStore={Boolean(shopId)}>{children}</AppShell>;
}
