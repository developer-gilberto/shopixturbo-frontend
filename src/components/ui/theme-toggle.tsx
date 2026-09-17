'use client';

import { useEffect, useState } from 'react';
import { LuMoon, LuSun } from 'react-icons/lu';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  function handleToggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {
      // ignora falha de persistência (ex.: storage indisponível)
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      title={isDark ? 'Tema claro' : 'Tema escuro'}
      className="flex items-center justify-center rounded-btn-input bg-btn-muted p-2 text-heading hover:bg-card-border cursor-pointer"
    >
      {isDark ? <LuSun className="text-lg" /> : <LuMoon className="text-lg" />}
    </button>
  );
}
