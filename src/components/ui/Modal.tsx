'use client';

import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import React from 'react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string | React.ReactNode;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  children,
}: ModalProps) {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal content */}
      <div
        className={cn(
          'relative w-full mx-4 bg-dark-900 border border-primary-500/20 rounded-xl shadow-2xl',
          'animate-in max-h-[90vh] overflow-hidden flex flex-col',
          sizes[size]
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-primary-500/10">
          <div className="flex-1">
            {typeof title === 'string' ? (
              <h2 className="text-lg font-semibold text-white">{title}</h2>
            ) : (
              title
            )}
            {description && (
              <p className="mt-0.5 text-xs text-dark-400">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-dark-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md mx-4 bg-dark-900 border border-primary-500/20 rounded-2xl shadow-2xl animate-in">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-white mb-2">{title}</h2>
          <p className="text-dark-300">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 pt-0">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
