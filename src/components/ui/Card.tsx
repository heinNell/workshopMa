'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
  glow?: boolean;
}

export function Card({ className, children, hover = true, glow = false }: CardProps) {
  return (
    <div
      className={cn(
        'bg-dark-900/70 backdrop-blur-xl border border-primary-500/10 rounded-xl p-6',
        'transition-all duration-300',
        hover && 'hover:border-primary-500/25 hover:shadow-card-hover',
        glow && 'shadow-glow',
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  className?: string;
  children: React.ReactNode;
}

export function CardHeader({ className, children }: CardHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  className?: string;
  children: React.ReactNode;
}

export function CardTitle({ className, children }: CardTitleProps) {
  return (
    <h3 className={cn('text-lg font-semibold text-white', className)}>
      {children}
    </h3>
  );
}

interface CardDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

export function CardDescription({ className, children }: CardDescriptionProps) {
  return (
    <p className={cn('text-sm text-dark-400', className)}>
      {children}
    </p>
  );
}

interface CardContentProps {
  className?: string;
  children: React.ReactNode;
}

export function CardContent({ className, children }: CardContentProps) {
  return <div className={cn('', className)}>{children}</div>;
}

interface CardFooterProps {
  className?: string;
  children: React.ReactNode;
}

export function CardFooter({ className, children }: CardFooterProps) {
  return (
    <div className={cn('flex items-center gap-3 mt-4 pt-4 border-t border-primary-500/10', className)}>
      {children}
    </div>
  );
}
