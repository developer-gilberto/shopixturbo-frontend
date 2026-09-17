import type { ReactNode } from 'react';

export function Main({ children }: { children: ReactNode }) {
  return (
    <main className="flex-1 overflow-auto p-4 print:overflow-visible">
      {children}
    </main>
  );
}
