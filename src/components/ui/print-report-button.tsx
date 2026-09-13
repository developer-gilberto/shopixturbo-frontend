'use client';

import { useEffect, useRef, useState } from 'react';
import { LuDownload, LuFileText, LuMail, LuPrinter } from 'react-icons/lu';

interface PrintReportButtonProps {
  reportText: string;
  fileName?: string;
}

function buildFileName(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  const date = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}`;
  const time = `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
  return `relatorio-shopixturbo-${date}-${time}.txt`;
}

export function PrintReportButton({
  reportText,
  fileName,
}: PrintReportButtonProps) {
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

  function handleDownload() {
    const blob = new Blob([reportText], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName ?? buildFileName();
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setMenuOpen(false);
  }

  function handlePrint() {
    setMenuOpen(false);
    window.print();
  }

  function handleSendEmail() {
    setMenuOpen(false);
    const subject = encodeURIComponent('Relatório ShopixTurbo');
    const body = encodeURIComponent(reportText);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        className="flex items-center gap-2 rounded-btn-input bg-primary-base px-4 py-2 font-bold text-white hover:bg-primary-hover cursor-pointer print:hidden"
      >
        <LuFileText />
        Gerar relatório
      </button>

      {menuOpen ? (
        <div
          role="menu"
          className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-card border bg-card-bg border-card-border shadow-card"
        >
          <div className="divide-y divide-card-border">
            <button
              type="button"
              role="menuitem"
              onClick={handlePrint}
              className="flex w-full items-center gap-3 p-3 text-sm font-bold text-body hover:bg-btn-muted cursor-pointer"
            >
              <LuPrinter className="text-lg text-label" />
              Imprimir relatório
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={handleDownload}
              className="flex w-full items-center gap-3 p-3 text-sm font-bold text-body hover:bg-btn-muted cursor-pointer"
            >
              <LuDownload className="text-lg text-label" />
              Baixar .txt
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={handleSendEmail}
              className="flex w-full items-center gap-3 p-3 text-sm font-bold text-body hover:bg-btn-muted cursor-pointer"
            >
              <LuMail className="text-lg text-label" />
              Enviar por email
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
