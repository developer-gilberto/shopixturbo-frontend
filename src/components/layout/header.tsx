'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { IconType } from 'react-icons';
import { FaUserCircle } from 'react-icons/fa';
import { FaBars, FaRightFromBracket } from 'react-icons/fa6';
import { signOut } from '@/actions/auth';
import { Logo } from '../ui/logo';

interface HeaderProps {
  onToggle?: () => void;
  hasStore?: boolean;
  shopLogo?: string | null;
}

const MENU_ITEMS: Array<{
  label: string;
  Icon: IconType;
  href?: string;
}> = [{ label: 'minha conta', Icon: FaUserCircle, href: '/my-account' }];

export function Header({
  onToggle,
  hasStore = true,
  shopLogo = null,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 flex min-h-16 items-center justify-between gap-2 bg-card-bg border-b border-card-border px-4 py-2 shadow-card print:hidden">
      <div className="flex items-center gap-2">
        {onToggle ? (
          <button
            type="button"
            onClick={onToggle}
            aria-label="Alternar menu"
            className="flex items-center justify-center text-heading bg-btn-muted hover:bg-card-border rounded-btn-input p-2 cursor-pointer md:hidden"
          >
            <FaBars />
          </button>
        ) : null}
        <Link href="/dashboard" className="flex items-center">
          <Logo logoFull width={150} height={150} className="w-32 md:w-40" />
        </Link>
      </div>

      <div className="flex flex-1 flex-wrap items-center justify-center gap-2 px-2 md:px-4" />

      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label="Menu da loja"
          className="border-2 border-card-bg hover:border-label cursor-pointer rounded-full transition-opacity hover:opacity-80"
        >
          {shopLogo ? (
            <Image
              src={shopLogo}
              alt="Imagem da loja"
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <FaUserCircle className="h-10 w-10 text-label" />
          )}
        </button>

        {menuOpen ? (
          <div
            role="menu"
            className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-card bg-card-bg border border-card-border shadow-card"
          >
            <div className="divide-y divide-card-border">
              {MENU_ITEMS.map(({ label, Icon, href }) =>
                href ? (
                  <Link
                    key={label}
                    href={href}
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex w-full items-center gap-3 p-3 text-sm font-bold text-body hover:bg-btn-muted"
                  >
                    <Icon className="text-lg text-label" />
                    {label}
                    {!hasStore && href === '/my-account' ? (
                      <span className="relative ml-auto flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-base opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary-base" />
                      </span>
                    ) : null}
                  </Link>
                ) : (
                  <button
                    key={label}
                    type="button"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex w-full items-center gap-3 p-3 text-sm font-bold text-body hover:bg-btn-muted cursor-pointer"
                  >
                    <Icon className="text-lg text-label" />
                    {label}
                  </button>
                ),
              )}
              <form action={signOut}>
                <button
                  type="submit"
                  role="menuitem"
                  className="flex w-full items-center gap-3 p-3 text-sm font-bold text-alert-text hover:bg-btn-muted cursor-pointer"
                >
                  <FaRightFromBracket className="text-lg text-label" />
                  Sair
                </button>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
