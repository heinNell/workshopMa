'use client';

import { cn } from '@/lib/utils';
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-medium text-dark-300 mb-1"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full bg-dark-900/80 border border-primary-500/20 rounded-lg px-3 py-2',
          'text-sm text-white placeholder:text-dark-500',
          'focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20',
          'transition-all duration-200',
          error && 'border-danger-500/50 focus:border-danger-500 focus:ring-danger-500/20',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-[10px] text-danger-500">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-[10px] text-dark-400">{helperText}</p>
      )}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Textarea({
  label,
  error,
  helperText,
  className,
  id,
  ...props
}: TextareaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-xs font-medium text-dark-300 mb-1"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn(
          'w-full bg-dark-900/80 border border-primary-500/20 rounded-lg px-3 py-2',
          'text-sm text-white placeholder:text-dark-500',
          'focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20',
          'transition-all duration-200 resize-none',
          error && 'border-danger-500/50 focus:border-danger-500 focus:ring-danger-500/20',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-[10px] text-danger-500">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-[10px] text-dark-400">{helperText}</p>
      )}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export function Select({
  label,
  error,
  helperText,
  options,
  placeholder,
  className,
  id,
  ...props
}: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-medium text-dark-300 mb-1"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'w-full bg-dark-900/80 border border-primary-500/20 rounded-lg px-3 py-2',
          'text-sm text-white',
          'focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20',
          'transition-all duration-200 cursor-pointer',
          error && 'border-danger-500/50 focus:border-danger-500 focus:ring-danger-500/20',
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-[10px] text-danger-500">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-[10px] text-dark-400">{helperText}</p>
      )}
    </div>
  );
}
