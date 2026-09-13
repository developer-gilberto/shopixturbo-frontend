import Link from 'next/link';
import { Logo } from '../ui/logo';

export function Footer() {
  return (
    <footer className="flex justify-between items-center gap-2 bg-card-bg border-t border-card-border px-4 py-2 shadow-card text-subtitle">
      <Link href="/dashboard" className="flex items-center">
        <Logo width={50} height={50} className="w-8 h-8 md:w-12 md:h-12" />
      </Link>
    </footer>
  );
}
