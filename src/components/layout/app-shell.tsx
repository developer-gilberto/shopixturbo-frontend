'use client';

import { type ReactNode, useState } from 'react';
import { Container } from '@/components/layout/container';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { Sidebar } from '@/components/layout/sidebar';

interface AppShellProps {
  children: ReactNode;
  hasStore: boolean;
  shopLogo?: string | null;
}

export function AppShell({
  children,
  hasStore,
  shopLogo = null,
}: AppShellProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-dvh flex-col overflow-hidden print:overflow-visible">
      <Container>
        <Header
          onToggle={() => setOpen((prev) => !prev)}
          hasStore={hasStore}
          shopLogo={shopLogo}
        />
        <Sidebar
          open={open}
          onClose={() => setOpen(false)}
          hasStore={hasStore}
        />
        <div className="col-start-1 row-start-2 flex flex-col overflow-hidden md:pl-72 print:overflow-visible print:pl-0">
          <Main>{children}</Main>
          <Footer />
        </div>
      </Container>
    </div>
  );
}
