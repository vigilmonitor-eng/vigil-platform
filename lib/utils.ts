import { Domain, Severity } from './types'

export const DOMAIN_COLORS: Record<Domain, string> = {
  geo: '#C62828',
  fin: '#0D47A1',
  cyber: '#00695C',
  clim: '#6A1B9A',
}

export const DOMAIN_LABELS: Record<Domain, string> = {
  geo: 'Geopolitical',
  fin: 'Markets',
  cyber: 'Cyber',
  clim: 'Climate',
}

export const DOMAIN_BG: Record<Domain, string> = {
  geo: 'rgba(198,40,40,0.08)',
  fin: 'rgba(13,71,161,0.08)',
  cyber: 'rgba(0,105,92,0.08)',
  clim: 'rgba(106,27,154,0.08)',
}

export const SEV_COLORS: Record<Severity, string> = {
  critical: '#C62828',
  high: '#C76B00',
  medium: '#0D47A1',
  low: '#00695C',
}

export const SEV_ORDER: Record<Severity, number> = {
  critical: 0, high: 1, medium: 2, low: 3,
}

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = Date.now()
  const diff = now - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function formatNumber(n: number, decimals = 2): string {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function clsx(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
