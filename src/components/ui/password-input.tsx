'use client';

import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface PasswordInputProps {
  'aria-invalid'?: boolean;
  errorMessage?: string;
}

export function PasswordInput({
  'aria-invalid': ariaInvalid,
  errorMessage,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full flex flex-col gap-1">
      <div className="w-full bg-btn-muted flex items-center pr-2 rounded-btn-input">
        <input
          type={showPassword ? 'text' : 'password'}
          name="password"
          placeholder="Digite sua senha"
          aria-invalid={ariaInvalid}
          className="bg-btn-muted w-full rounded-btn-input p-2"
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="ml-2 cursor-pointer"
          aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
      {errorMessage ? (
        <p className="text-alert-text text-sm">{errorMessage}</p>
      ) : null}
    </div>
  );
}
