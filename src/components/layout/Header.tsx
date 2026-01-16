'use client';

import { useSupabaseAuth } from '@/components/auth/SupabaseAuthProvider';
import { Bell, ChevronRight, User } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [{ label: 'Dashboard', href: '/' }];

  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const label = segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    breadcrumbs.push({
      label: label.toUpperCase() === label ? label : label,
      href: index < segments.length - 1 ? currentPath : undefined,
    });
  });

  return breadcrumbs;
}

export const Header = React.memo(function Header() {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);
  const { user, signOut, loading } = useSupabaseAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      console.error('Sign-out failed:', error.message);
      return;
    }
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="h-16 bg-dark-950/80 backdrop-blur-xl border-b border-primary-500/10 flex items-center justify-between px-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight className="w-4 h-4 text-dark-600" />}
            {crumb.href ? (
              <a
                href={crumb.href}
                className="text-sm text-dark-400 hover:text-white transition-colors"
              >
                {crumb.label}
              </a>
            ) : (
              <span className="text-sm font-medium text-white">{crumb.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative p-2 text-dark-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-500 rounded-full" />
        </button>

        {/* User menu */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-white">{user?.email || 'Signed out'}</p>
            <p className="text-xs text-dark-400">{loading ? 'Loading session…' : 'Authenticated'}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-xs text-primary-400 hover:text-primary-300"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
});
Header.displayName = 'Header';
