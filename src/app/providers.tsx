'use client';

import { SupabaseAuthProvider } from '@/components/auth/SupabaseAuthProvider';
import { AppearanceProvider } from '@/components/providers';
import React from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseAuthProvider>
      <AppearanceProvider>{children}</AppearanceProvider>
    </SupabaseAuthProvider>
  );
}