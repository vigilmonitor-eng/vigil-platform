'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import TopBar from '@/components/TopBar'
import Sidebar from '@/components/Sidebar'
import MetricsBar from '@/components/MetricsBar'
import RightPanel from '@/components/RightPanel'
import { NewsItem, ThreatItem, MarketMetric, DisasterEvent } from '@/lib/types'
import { MapIncident } from '@/components/WorldMap'

const WorldMap = dynamic(() => import('@/components/WorldMap'), {
  ssr: false,
  loading: () => (
    <div style={{ flex: 1, background: '#D5E9F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 36, height: 36, border: '2px solid #E5DDD5', borderTop: '2px solid #00695C', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#7A6550' }}>Loading world map…</div>
      </div>
    </div>
  ),
})

const STATIC_INCIDENTS: MapIncident[] = [
  { id: 's1', type: 'geo', lat: 24, lon: 120, title: 'PLA Naval Activity — Taiwan Strait', region: 'Indo-Pacific', severity: 'critical', time: '2m ago' },
  { id: 's2', type: 'geo', lat: 34, lon: 72, title: 'Pakistan-India LoC — Artillery Exchange', region: 'Kashmir', severity: 'high', time: '27m ago' },
  { id: 's3', type: 'geo', lat: 15.5, lon: 32.5, title: 'UN Convoy Ambush — Sudan', region: 'Khartoum', severity: 'high', time: '35m ago' },
  { id: 's4', type: 'geo', lat: 48.5, lon: 35, title: 'Front-Line Activity — Eastern Ukraine', region: 'Zaporizhzhia', severity: 'high', time: '1h ago' },
  { id: 's5', type: 'geo', lat: 31.5, lon: 34.5, title: 'IDF Operations — Gaza Strip', region: 'Gaza', severity: 'critical', time: '44m ago' },
  { id: 's6', type: 'geo', lat: 17, lon: 96, title: 'Myanmar Civil War — PDF vs Junta', region: 'Sagaing', severity: 'high', time: '2h ago' },
  { id: 's7', type: 'cyber', lat: 38.9, lon: -77.0, title: 'Volt Typhoon — US Grid Nodes', region: 'CONUS', severity: 'critical', time: '5m ago' },
  { id: 's8', type: 'cyber', lat: 50.4, lon: 30.5, title: 'APT29 — EU Logistics Infrastructure', region: 'Eastern Europe', severity: 'high', time: '19m ago' },
  { id: 's9', type: 'cyber', lat: 37.5, lon: 127, title: 'Lazarus Group C2 Rotation', region: 'APAC', severity: 'high', time: '33m ago' },
  { id: 's10', type: 'clim', lat: 21.5, lon: 90, title: 'Cyclone Mona — Category 4', region: 'Bay of Bengal', severity: 'critical', time: '8m ago' },
  { id: 's11', type: 'clim', lat: -5, lon: -55, title: 'Amazon Wildfires — 847 Hotspots', region: 'Brazil', severity: 'high', time: '31m ago' },
  { id: 's12', type: 'fin', lat: 51.5, lon: -0.1, title: 'OPEC+ Emergency Session Signal', region: 'London', severity: 'high', time: '12m ago' },
  { id: 's13', type: 'fin', lat: 40.7, lon: -74, title: 'VIX Intraday Spike — Tail Risk', region: 'New York', severity: 'medium', time: '40m ago' },
  { id: 's14', type: 'geo', lat: 16, lon: -3, title: 'JNIM Attack — UN Base Mali', region: 'Sahel', severity: 'high', time: '3h ago' },
]

export default function HomePage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [threats, setThreats] = useState<ThreatItem[]>([])
  const [markets, setMarkets] = useState<MarketMetric[]>([])
  const [disasters, setDisasters] = useState<DisasterEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilters, setActiveFilters] = useState(new Set(['geo', 'fin', 'cyber', 'clim']))
  const [activeDomain, setActiveDomain] = useState('all')
  const [riskScore, setRiskScore] = useState(6.4)
  const [selectedCountry, setSelectedCountry] = useState<{ name: string; code: string } | null>(null)
  const riskRef = useRef(6.4)

  const fetchAll = useCallback(async () => {
    try {
      const [newsRes, marketsRes, threatsRes, disastersRes] = await Promise.allSettled([
        fetch('/api/news').then(r => r.json()),
        fetch('/api/markets').then(r => r.json()),
        fetch('/api/threats').then(r => r.json()),
        fetch('/api/disasters').then(r => r.json()),
      ])
      if (newsRes.status === 'fulfilled') setNews(newsRes.value.data ?? [])
      if (marketsRes.status === 'fulfilled') setMarkets(marketsRes.value.data ?? [])
      if (threatsRes.status === 'fulfilled') setThreats(threatsRes.value.data ?? [])
      if (disastersRes.status === 'fulfilled') {
        const d = disastersRes.value.data
        setDisasters([...(d.earthquakes ?? []), ...(d.events ?? [])])
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchAll()
    const id = setInterval(fetchAll, 120_000)
    return () => clearInterval(id)
  }, [fetchAll])

  useEffect(() => {
    const id = setInterval(() => {
      riskRef.current = Math.min(8.5, Math.max(5.0, riskRef.current + (Math.random() * 0.06 - 0.03)))
      setRiskScore(parseFloat(riskRef.current.toFixed(1)))
    }, 4200)
    return () => clearInterval(id)
  }, [])

  // Sidebar domain change → update map filters too
  const handleDomainChange = useCallback((d: string) => {
    setActiveDomain(d)
    if (d === 'all') setActiveFilters(new Set(['geo', 'fin', 'cyber', 'clim']))
    else if (['geo', 'fin', 'cyber', 'clim'].includes(d)) setActiveFilters(new Set([d]))
    else if (d === 'war') setActiveFilters(new Set(['geo']))
    setSelectedCountry(null)
  }, [])

  const toggleFilter = useCallback((key: string) => {
    setActiveFilters(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }, [])

  const handleCountryClick = useCallback((country: { name: string; code: string }) => {
    setSelectedCountry(country)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      <TopBar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar active={activeDomain} onChange={handleDomainChange} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <WorldMap
            incidents={STATIC_INCIDENTS}
            disasters={disasters}
            activeFilters={activeFilters}
            onFilterToggle={toggleFilter}
            onCountryClick={handleCountryClick}
          />
          <MetricsBar metrics={markets} loading={loading && markets.length === 0} />
        </div>
        <RightPanel
          news={news}
          threats={threats}
          loading={loading}
          riskScore={riskScore}
          activeDomain={activeDomain}
          selectedCountry={selectedCountry}
        />
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.35;transform:scale(0.6)} }
        .shimmer { background: linear-gradient(90deg,#F1EDE6 25%,#E5DDD5 50%,#F1EDE6 75%); background-size:200% 100%; animation:shimmer 1.6s infinite; }
        @keyframes shimmer { from{background-position:-200% 0} to{background-position:200% 0} }
        .hover-bg { transition: background-color 0.15s ease; }
        .hover-bg:hover { background-color: var(--bg3,#F1EDE6); }
      `}</style>
    </div>
  )
}
