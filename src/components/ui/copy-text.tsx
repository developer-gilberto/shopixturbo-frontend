'use client';

import { useRef, useState } from 'react';
import { LuCheck, LuCopy } from 'react-icons/lu';

interface CopyTextProps {
  label: string;
  value: string;
  labelClassName?: string;
}

export function CopyText({ label, value, labelClassName }: CopyTextProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <p className="flex items-center gap-1 text-[10px] font-medium text-label">
      <span className={labelClassName}>{label}:</span> {value}
      <button
        type="button"
        onClick={handleCopy}
        aria-label={`Copiar ${label}`}
        className="group relative flex items-center cursor-pointer print:hidden"
      >
        {copied ? (
          <LuCheck className="text-xs text-profit" />
        ) : (
          <LuCopy className="text-xs text-label group-hover:text-primary-base" />
        )}
        <span
          className={`pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-btn-input bg-heading px-2 py-1 text-[10px] font-bold text-white shadow-card transition-opacity ${
            copied ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          {copied ? 'copiado' : 'copiar'}
        </span>
      </button>
    </p>
  );
}
