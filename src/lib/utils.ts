import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DEFAULT_TIME_ZONE = 'Africa/Johannesburg';

export function formatDate(date: Date | string | undefined | null): string {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: DEFAULT_TIME_ZONE,
  });
}

export function formatDateTime(date: Date | string | undefined | null): string {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: DEFAULT_TIME_ZONE,
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  }).format(amount);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    active: 'success',
    completed: 'success',
    pending: 'warning',
    'in-progress': 'info',
    overdue: 'danger',
    critical: 'danger',
    scheduled: 'info',
    closed: 'success',
  };
  return statusColors[status.toLowerCase()] || 'info';
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function calculateDaysUntil(date: Date | string): number {
  const targetDate = new Date(date);
  const today = new Date();
  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getFleetCategory(fleetNumber: string): string {
  if (fleetNumber.endsWith('H')) {
    const num = parseInt(fleetNumber.replace('H', ''));
    if ([1, 4, 6, 29, 30].includes(num)) return 'ridgets';
    return 'horses';
  }
  if (fleetNumber.endsWith('F')) return 'reefers';
  if (fleetNumber.endsWith('T')) return 'interlinks';
  if (fleetNumber.endsWith('L')) return 'bakkies';
  return 'unknown';
}
