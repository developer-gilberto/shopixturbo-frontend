import { verifySession } from '@/lib/dal';

export default async function Orders() {
  await verifySession();

  return <div className="text-heading text-4xl">Orders</div>;
}
