'use client';

import { useRef, useState } from 'react';
import {
  appendCurrencyDigit,
  formatCurrency,
  parsePastedCurrency,
} from '@/components/products/currency-mask';

interface CurrencyInputProps {
  id?: string;
  initialValue?: string;
  onValueChange: (formatted: string) => void;
  className?: string;
  placeholder?: string;
  ariaLabel?: string;
}

export function CurrencyInput({
  id,
  initialValue = '',
  onValueChange,
  className,
  placeholder = '0,00',
  ariaLabel,
}: CurrencyInputProps) {
  const rawRef = useRef(initialValue.replace(/\D/g, ''));
  const [value, setValue] = useState(initialValue);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const { data, inputType } = event.nativeEvent as {
      data?: string | null;
      inputType?: string;
    };

    if (
      input.selectionStart === 0 &&
      input.selectionEnd === input.value.length
    ) {
      rawRef.current = '';
    }

    let raw = rawRef.current;

    if (inputType?.startsWith('delete')) {
      raw = raw.slice(0, -1);
    } else if (data) {
      if (/^\d$/.test(data)) {
        raw = appendCurrencyDigit(raw, data);
      } else if (/\d/.test(data)) {
        raw = parsePastedCurrency(data);
      }
    }

    rawRef.current = raw;
    const formatted = formatCurrency(raw);
    setValue(formatted);
    onValueChange(formatted);
  };

  return (
    <input
      id={id}
      type="text"
      inputMode="decimal"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      aria-label={ariaLabel}
      className={className}
    />
  );
}
