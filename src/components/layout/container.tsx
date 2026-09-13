import type { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
}

export function Container({ children }: ContainerProps) {
  return (
    <div className="grid flex-1 grid-cols-1 grid-rows-[auto_1fr] bg-page-bg">
      {children}
    </div>
  );
}
