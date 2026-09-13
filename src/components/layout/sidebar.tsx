'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HiOutlineClipboardList,
  HiOutlineCube,
  HiOutlineHome,
  HiOutlineUser,
} from 'react-icons/hi';
import { SyncProductsButton } from '@/components/ui/sync-products-button';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  hasStore: boolean;
}

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', Icon: HiOutlineHome },
  { href: '/products', label: 'Produtos', Icon: HiOutlineCube },
  { href: '/orders', label: 'Pedidos', Icon: HiOutlineClipboardList },
  { href: '/my-account', label: 'Minha conta', Icon: HiOutlineUser },
];

export function Sidebar({ open, onClose, hasStore }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open ? (
        <div
          className="fixed inset-x-0 top-16 bottom-0 z-30 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      ) : null}

      <aside
        className={`fixed left-0 top-16 bottom-0 z-40 flex w-72 flex-col justify-between bg-card-bg border-r border-card-border p-4 shadow-card transition-transform duration-300 ease-in-out print:hidden ${
          open ? 'translate-x-0' : 'max-md:-translate-x-full'
        }`}
      >
        <nav className="flex flex-col gap-1 overflow-y-auto">
          {NAV_LINKS.map(({ href, label, Icon }) => {
            const isActive =
              pathname === href || pathname.startsWith(`${href}/`);
            const needsStore = href === '/my-account' && !hasStore;

            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-2 rounded-btn-input p-2 ${
                  isActive
                    ? 'bg-nav-active-bg text-heading font-bold'
                    : 'text-body hover:bg-btn-muted'
                }`}
              >
                <Icon className="text-xl" />
                {label}
                {needsStore ? (
                  <span className="relative ml-auto flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-base opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary-base" />
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        {pathname === '/products' ? <SyncProductsButton /> : null}
      </aside>
    </>
  );
}
