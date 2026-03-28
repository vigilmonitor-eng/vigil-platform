export type Domain = 'geo' | 'fin' | 'cyber' | 'clim'
export type Severity = 'critical' | 'high' | 'medium' | 'low'

export interface Incident {
  id: string
  type: Domain
  lat: number
  lon: number
  title: string
  region: string
  severity: Severity
  time: string
  description: string
  source?: string
  url?: string
}

export interface MarketMetric {
  symbol: string
  label: string
  value: string
  change: string
  direction: 'up' | 'down' | 'flat'
}

export interface NewsItem {
  id: string
  title: string
  url: string
  source: string
  domain: Domain
  time: string
  region: string
}

export interface ThreatItem {
  id: string
  title: string
  severity: Severity
  cve?: string
  published: string
  summary: string
  url?: string
}

export interface DisasterEvent {
  id: string
  type: 'earthquake' | 'cyclone' | 'flood' | 'fire' | 'volcano'
  lat: number
  lon: number
  title: string
  magnitude?: number
  time: string
  region: string
}

export interface ApiResponse<T> {
  data: T
  timestamp: number
  source: string
}
