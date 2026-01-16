'use client';

import { Button, Card, Input } from '@/components/ui';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import { useSupabaseAuth } from './SupabaseAuthProvider';

type Mode = 'signin' | 'signup';

export function LoginForm() {
  const { signInWithPassword, signUpWithPassword, loading, supabase } = useSupabaseAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);

    const action = mode === 'signin' ? signInWithPassword : signUpWithPassword;
    const { error: authError } = await action(email.trim(), password);

    if (authError) {
      setError(authError.message);
      setBusy(false);
      return;
    }

    router.push(redirectTo);
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      setError('Enter your email first, then resend.');
      return;
    }
    setResending(true);
    setError(null);
    setInfo(null);
    const { error: resendError } = await supabase.auth.resend({ type: 'signup', email: email.trim() });
    if (resendError) {
      setError(resendError.message);
    } else {
      setInfo('Verification email sent. Please check your inbox (and spam).');
    }
    setResending(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-dark-900 to-dark-950 px-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary-400 font-semibold">Workshop</p>
          <h1 className="text-2xl font-bold text-white mt-1">Sign {mode === 'signin' ? 'in' : 'up'} to continue</h1>
          <p className="text-dark-400 mt-1 text-sm">Access fleet, jobs, inspections, and inventory in real time.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            required
          />

          {error && <p className="text-sm text-danger-500">{error}</p>}
          {info && <p className="text-sm text-success-500">{info}</p>}

          <Button type="submit" className="w-full" disabled={busy || loading}>
            {busy ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </Button>
          {error?.toLowerCase().includes('confirm') && (
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              disabled={resending}
              onClick={handleResendConfirmation}
            >
              {resending ? 'Sending…' : 'Resend verification email'}
            </Button>
          )}
        </form>

        <div className="text-sm text-dark-400">
          {mode === 'signin' ? (
            <button
              type="button"
              className="text-primary-400 hover:text-primary-300"
              onClick={() => setMode('signup')}
            >
              New here? Create an account
            </button>
          ) : (
            <button
              type="button"
              className="text-primary-400 hover:text-primary-300"
              onClick={() => setMode('signin')}
            >
              Already have an account? Sign in
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}