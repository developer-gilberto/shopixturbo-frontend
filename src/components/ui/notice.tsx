import type { ReactNode } from 'react';

interface NoticeProps {
  text: string;
  children?: ReactNode;
}

export function Notice({ text, children }: NoticeProps) {
  return (
    <div
      className={
        'bg-alert-bg w-full text-alert-text font-bold flex gap-2 items-center rounded-card p-3'
      }
    >
      {children}
      <p>{text}</p>
    </div>
  );
}
