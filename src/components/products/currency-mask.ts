export function groupThousands(int: string): string {
  return int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function formatCurrency(digits: string): string {
  if (digits === '') return '';
  const clean = digits.replace(/\D/g, '');
  if (clean === '') return '';
  const int = clean.slice(0, -2) || '0';
  const dec = clean.slice(-2).padStart(2, '0');
  return `${groupThousands(int)},${dec}`;
}

export function appendCurrencyDigit(digits: string, digit: string): string {
  return `${digits}${digit}`;
}

export function parsePastedCurrency(text: string): string {
  const commaIndex = text.indexOf(',');
  if (commaIndex !== -1) {
    const int = text.slice(0, commaIndex).replace(/[^\d]/g, '');
    const dec = text
      .slice(commaIndex + 1)
      .replace(/[^\d]/g, '')
      .slice(0, 2);
    return `${int || '0'}${dec.padEnd(2, '0')}`;
  }
  const digits = text.replace(/[^\d]/g, '');
  return `${digits}00`;
}

export function parseCurrencyToCents(formatted: string): number {
  const normalized = formatted.trim();
  if (normalized === '') return 0;
  const value = Number(normalized.replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(value) ? Math.round(value * 100) : 0;
}
