// ═══════════════════════════════════════════════════════════════════════
// FORMATTERS
// ═══════════════════════════════════════════════════════════════════════

import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';

export const formatDate = (date: string | Date, formatStr: string = 'PP'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, formatStr, { locale: fr });
};

export const formatTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'HH:mm');
};

export const formatRelativeTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isToday(d)) {
    return `Aujourd'hui, ${formatTime(d)}`;
  }
  
  if (isYesterday(d)) {
    return `Hier, ${formatTime(d)}`;
  }
  
  return formatDate(d, 'd MMMM, HH:mm');
};

export const formatDistanceShort = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { locale: fr, addSuffix: true });
};

export const formatCompatibilityScore = (score: number): string => {
  return `${Math.round(score)}%`;
};

export const formatCurrency = (amountCents: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
  }).format(amountCents / 100);
};

export const formatDistance = (km: number): string => {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${Math.round(km)}km`;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};
