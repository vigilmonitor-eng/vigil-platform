'use client'
import { useState, useEffect, useRef } from 'react'
import { NewsItem, ThreatItem } from '@/lib/types'
import { DOMAIN_COLORS, DOMAIN_LABELS, SEV_COLORS, timeAgo } from '@/lib/utils'

interface Props {
  news: NewsItem[]
  threats: ThreatItem[]
  loading: boolean
  riskScore: number
  activeDomain: string
  selectedCountry: { name: string; code: string } | null
}

const RISK_ROWS = [
  { label: 'Conflict', d: 'geo', score: 7.8 },
  { label: 'Cyber', d: 'cyber', score: 7.1 },
  { label: 'Climate', d: 'clim', score: 6.2 },
  { label: 'Economic', d: 'fin', score: 5.4 },
]

const AI_BRIEFS = [
  { q: 'Taiwan Strait escalation probability in 72h?', a: 'Based on current vessel positioning and ADIZ breach patterns, escalation sits at 31–38%. Key trigger: US 7th Fleet response posture.', conf: 76, src: 14 },
  { q: 'OPEC+ production cuts effect on Brent in Q2?', a: '500k bpd cut would push Brent to $86–90 by late April. China demand is the primary swing variable.', conf: 81, src: 9 },
  { q: 'Most active APT groups this week?', a: 'Volt Typhoon (critical infra), Lazarus Group (financial), APT29 (EU logistics). All three show elevated C2 activity vs 7-day baseline.', conf: 88, src: 22 },
]

const WAR_INCIDENTS = [
  { region: 'Taiwan Strait', status: 'CRITICAL', flag: '🇹🇼', detail: '3 PLA warships entered ADIZ. US 7th Fleet on standoff watch. Escalation risk: 34%.', time: '2m ago', color: '#C62828' },
  { region: 'Ukraine — Zaporizhzhia', status: 'ACTIVE', flag: '🇺🇦', detail: 'Artillery exchange reported on southern front line. 14km contested zone. No ceasefire signals.', time: '18m ago', color: '#C62828' },
  { region: 'Kashmir LoC', status: 'HIGH', flag: '🇮🇳', detail: 'India-Pakistan cross-border fire reported. Small arms + mortar exchange. Both sides deny escalation.', time: '27m ago', color: '#C76B00' },
  { region: 'Sudan — Khartoum', status: 'HIGH', flag: '🇸🇩', detail: 'UN convoy ambushed. 3 aid workers killed. RSF forces responsible per OCHA assessment.', time: '35m ago', color: '#C76B00' },
  { region: 'Gaza Strip', status: 'ACTIVE', flag: '🇵🇸', detail: 'IDF operations continuing in Rafah sector. UNRWA reports critical humanitarian access blocked.', time: '44m ago', color: '#C62828' },
  { region: 'Iraq — Baghdad', status: 'MEDIUM', flag: '🇮🇶', detail: 'IED strike on coalition supply route near Abu Ghraib. No casualties. EOD teams deployed.', time: '1h ago', color: '#0D47A1' },
  { region: 'Myanmar', status: 'ACTIVE', flag: '🇲🇲', detail: 'PDF resistance forces claim control of 3 townships in Sagaing. Junta airstrikes reported.', time: '2h ago', color: '#C62828' },
  { region: 'Sahel — Mali/Niger', status: 'HIGH', flag: '🇲🇱', detail: 'JNIM linked attack on UN base near Timbuktu. Wagner-aligned forces expanding presence.', time: '3h ago', color: '#C76B00' },
]

type Tab = 'situation' | 'feed' | 'cyber' | 'brief' | 'war' | 'country'

export default function RightPanel({ news, threats, loading, riskScore, activeDomain, selectedCountry }: Props) {
  const [tab, setTab] = useState<Tab>('situation')
  const [filled, setFilled] = useState(false)
  const [fading, setFading] = useState(false)
  const prevDomain = useRef(activeDomain)

  useEffect(() => { setTimeout(() => setFilled(true), 200) }, [])

  // Auto switch tab when sidebar domain changes
  useEffect(() => {
    if (activeDomain === prevDomain.current) return
    prevDomain.current = activeDomain
    const map: Record<string, Tab> = {
      all: 'situation', geo: 'feed', fin: 'feed',
      cyber: 'cyber', clim: 'feed', war: 'war',
      alert: 'situation', report: 'brief',
    }
    switchTab(map[activeDomain] ?? 'situation')
  }, [activeDomain])

  // Auto switch when country selected
  useEffect(() => {
    if (selectedCountry) switchTab('country')
  }, [selectedCountry])

  const switchTab = (t: Tab) => {
    setFading(true)
    setTimeout(() => { setTab(t); setFading(false) }, 160)
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'situation', label: 'Situation' },
    { key: 'feed', label: 'Live Feed' },
    { key: 'cyber', label: 'Cyber' },
    { key: 'war', label: '⚔️ War' },
    { key: 'brief', label: 'AI Brief' },
  ]

  return (
    <div style={{
      width: 292, background: 'var(--bg2)',
      borderLeft: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      flexShrink: 0, overflow: 'hidden',
    }}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', height: 38, flexShrink: 0 }}>
        {TABS.map(({ key, label }) => (
          <button key={key} onClick={() => switchTab(key)} style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9.5, fontWeight: 600, letterSpacing: '0.02em',
            color: tab === key ? 'var(--ink)' : 'var(--ink4)',
            cursor: 'pointer', background: 'none', border: 'none',
            borderBottom: tab === key ? '2px solid var(--geo)' : '2px solid transparent',
            marginBottom: -1, transition: 'color 0.15s',
          }}>{label}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{
        flex: 1, overflowY: 'auto', overflowX: 'hidden',
        opacity: fading ? 0 : 1,
        transform: fading ? 'translateY(4px)' : 'translateY(0)',
        transition: 'opacity 0.18s, transform 0.18s',
      }}>
        {tab === 'situation' && <SituationTab riskScore={riskScore} filled={filled} />}
        {tab === 'feed' && <FeedTab news={news} loading={loading} domain={activeDomain} />}
        {tab === 'cyber' && <CyberTab threats={threats} loading={loading} />}
        {tab === 'war' && <WarTab />}
        {tab === 'brief' && <BriefTab />}
        {tab === 'country' && selectedCountry && <CountryTab country={selectedCountry} news={news} />}
      </div>
    </div>
  )
}

function SituationTab({ riskScore, filled }: { riskScore: number; filled: boolean }) {
  return (
    <div>
      <div style={{ padding: '14px 14px 12px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 7.5, color: 'var(--ink4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Global Situation Index</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 44, fontWeight: 700, color: '#C76B00', lineHeight: 1 }}>{riskScore.toFixed(1)}</div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 10, fontWeight: 500, color: '#C76B00', marginBottom: 2 }}>ELEVATED</div>
            <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 8, color: 'var(--ink4)' }}>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {RISK_ROWS.map(({ label, d, score }) => (
            <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{ fontSize: 10, fontWeight: 600, flex: '0 0 58px', color: DOMAIN_COLORS[d as keyof typeof DOMAIN_COLORS] }}>{label}</div>
              <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 2, background: DOMAIN_COLORS[d as keyof typeof DOMAIN_COLORS], width: filled ? `${score * 10}%` : '0%', transition: 'width 1.4s cubic-bezier(0.4,0,0.2,1)' }} />
              </div>
              <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 10, fontWeight: 500, flex: '0 0 24px', textAlign: 'right', color: DOMAIN_COLORS[d as keyof typeof DOMAIN_COLORS] }}>{score}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '6px 14px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-jetbrains)', fontSize: 7.5, color: 'var(--ink4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Priority Alerts</div>
      {[
        { n: '01', title: 'ADIZ breach — Taiwan Strait — PLA NAVY', sub: 'Critical · Indo-Pacific · 2m ago' },
        { n: '02', title: 'Volt Typhoon — US power grid nodes', sub: 'Critical · CONUS · 5m ago' },
        { n: '03', title: 'Cyclone Mona Cat-4 — 38h to landfall', sub: 'High · Bay of Bengal · 8m ago' },
        { n: '04', title: 'OPEC+ emergency call — production cut', sub: 'High · Global Markets · 12m ago' },
      ].map(({ n, title, sub }) => (
        <div key={n} className="hover-bg" style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)', cursor: 'pointer', display: 'flex', gap: 11 }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 700, lineHeight: 1, color: 'var(--border2)', flexShrink: 0 }}>{n}</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.4, color: 'var(--ink)', marginBottom: 2 }}>{title}</div>
            <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 8.5, color: 'var(--ink4)' }}>{sub}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function WarTab() {
  return (
    <div>
      <div style={{ padding: '8px 14px', background: '#B71C1C', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', animation: 'pulseDot 1s ease-in-out infinite' }} />
        <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 9, color: '#fff', letterSpacing: '0.1em', fontWeight: 500 }}>WAR ROOM — LIVE CONFLICT TRACKER</span>
      </div>
      <div style={{ padding: '6px 14px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 7.5, color: 'var(--ink4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Active Conflict Zones</span>
        <span style={{ background: 'rgba(198,40,40,0.1)', padding: '1px 7px', borderRadius: 8, fontFamily: 'var(--font-jetbrains)', fontSize: 8, color: '#C62828' }}>{WAR_INCIDENTS.length} ZONES</span>
      </div>
      {WAR_INCIDENTS.map((inc, i) => (
        <div key={i} className="hover-bg" style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontSize: 14 }}>{inc.flag}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink)' }}>{inc.region}</span>
            </div>
            <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 8, fontWeight: 500, padding: '2px 7px', borderRadius: 4, background: `${inc.color}15`, color: inc.color }}>{inc.status}</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink2)', lineHeight: 1.55, marginBottom: 5 }}>{inc.detail}</div>
          <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 8.5, color: 'var(--ink4)' }}>{inc.time}</div>
        </div>
      ))}
    </div>
  )
}

function CountryTab({ country, news }: { country: { name: string; code: string }; news: NewsItem[] }) {
  const countryNews = news.filter(n =>
    n.region?.toLowerCase().includes(country.name.toLowerCase()) ||
    n.title?.toLowerCase().includes(country.name.toLowerCase())
  ).slice(0, 8)

  return (
    <div>
      <div style={{ padding: '14px 14px 12px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
        <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 8, color: 'var(--ink4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Selected Region</div>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700 }}>{country.name}</div>
        <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 9, color: 'var(--ink4)', marginTop: 4 }}>Click map markers for incident details</div>
      </div>
      <div style={{ padding: '6px 14px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-jetbrains)', fontSize: 7.5, color: 'var(--ink4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        Related Intelligence
      </div>
      {countryNews.length > 0 ? countryNews.map((item, i) => (
        <a key={i} href={item.url} target="_blank" rel="noopener noreferrer"
          className="hover-bg"
          style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 9, textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
          <div style={{ width: 3, borderRadius: 2, flexShrink: 0, alignSelf: 'stretch', background: DOMAIN_COLORS[item.domain] }} />
          <div>
            <span style={{ display: 'inline-block', marginBottom: 4, fontFamily: 'var(--font-jetbrains)', fontSize: 8, fontWeight: 500, padding: '2px 5px', borderRadius: 3, background: `${DOMAIN_COLORS[item.domain]}15`, color: DOMAIN_COLORS[item.domain], textTransform: 'uppercase' }}>{DOMAIN_LABELS[item.domain]}</span>
            <div style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.4, color: 'var(--ink)', marginBottom: 3 }}>{item.title}</div>
            <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 8.5, color: 'var(--ink4)' }}>{item.source} · {timeAgo(item.time)}</div>
          </div>
        </a>
      )) : (
        <div style={{ padding: '20px 14px', textAlign: 'center', color: 'var(--ink4)', fontSize: 12 }}>
          No recent intelligence for this region.<br />
          <span style={{ fontSize: 10 }}>Click an incident marker on the map for details.</span>
        </div>
      )}
    </div>
  )
}

function FeedTab({ news, loading, domain }: { news: NewsItem[]; loading: boolean; domain: string }) {
  const filtered = domain === 'all' || domain === 'alert' || domain === 'report' || domain === 'settings'
    ? news
    : news.filter(n => n.domain === domain)

  if (loading) return (
    <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Array(5).fill(null).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 9 }}>
          <div className="shimmer" style={{ width: 3, height: 60, borderRadius: 2, flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div className="shimmer" style={{ height: 9, width: 50, borderRadius: 3 }} />
            <div className="shimmer" style={{ height: 12, borderRadius: 3 }} />
            <div className="shimmer" style={{ height: 9, width: 80, borderRadius: 3 }} />
          </div>
        </div>
      ))}
    </div>
  )

  const display = filtered.length > 0 ? filtered : news

  return (
    <>
      <div style={{ padding: '6px 14px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 7.5, color: 'var(--ink4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {domain !== 'all' ? `${DOMAIN_LABELS[domain] ?? 'Live'} Feed` : 'Live Intelligence Feed'}
        </span>
        <span style={{ background: 'var(--border)', padding: '1px 7px', borderRadius: 8, fontFamily: 'var(--font-jetbrains)', fontSize: 8, color: 'var(--ink3)' }}>{display.length}</span>
      </div>
      {display.map((item, i) => (
        <a key={i} href={item.url} target="_blank" rel="noopener noreferrer"
          className="hover-bg"
          style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', cursor: 'pointer', display: 'flex', gap: 9, textDecoration: 'none', color: 'inherit' }}>
          <div style={{ width: 3, borderRadius: 2, flexShrink: 0, alignSelf: 'stretch', background: DOMAIN_COLORS[item.domain] }} />
          <div>
            <span style={{ display: 'inline-block', marginBottom: 4, fontFamily: 'var(--font-jetbrains)', fontSize: 8, fontWeight: 500, padding: '2px 5px', borderRadius: 3, background: `${DOMAIN_COLORS[item.domain]}15`, color: DOMAIN_COLORS[item.domain], textTransform: 'uppercase' }}>{DOMAIN_LABELS[item.domain]}</span>
            <div style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.4, color: 'var(--ink)', marginBottom: 3 }}>{item.title}</div>
            <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 8.5, color: 'var(--ink4)' }}>{item.source} · {timeAgo(item.time)}</div>
          </div>
        </a>
      ))}
    </>
  )
}

function CyberTab({ threats, loading }: { threats: ThreatItem[]; loading: boolean }) {
  if (loading) return <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>{Array(5).fill(null).map((_, i) => <div key={i} className="shimmer" style={{ height: 60, borderRadius: 6 }} />)}</div>
  return (
    <>
      <div style={{ padding: '6px 14px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 7.5, color: 'var(--ink4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Threat Intelligence</span>
        <span style={{ background: 'rgba(0,105,92,0.1)', padding: '1px 7px', borderRadius: 8, fontFamily: 'var(--font-jetbrains)', fontSize: 8, color: '#00695C' }}>CISA + CVE</span>
      </div>
      {threats.slice(0, 12).map((t, i) => (
        <a key={i} href={t.url ?? '#'} target="_blank" rel="noopener noreferrer"
          className="hover-bg"
          style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 9, textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
          <div style={{ width: 3, borderRadius: 2, flexShrink: 0, alignSelf: 'stretch', background: SEV_COLORS[t.severity] }} />
          <div>
            {t.cve && <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 8, color: '#00695C', marginBottom: 3 }}>{t.cve}</div>}
            <div style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.4, color: 'var(--ink)', marginBottom: 3 }}>{t.title}</div>
            <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 8.5, color: 'var(--ink4)' }}>{t.severity.toUpperCase()} · {timeAgo(t.published)}</div>
          </div>
        </a>
      ))}
    </>
  )
}

function BriefTab() {
  return (
    <>
      <div style={{ padding: '6px 14px', background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 7.5, color: 'var(--ink4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>AI Situation Analysis</span>
      </div>
      {AI_BRIEFS.map((b, i) => (
        <div key={i} className="hover-bg" style={{ padding: '13px 14px', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
          <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12.5, fontWeight: 700, lineHeight: 1.4, marginBottom: 7 }}>&ldquo;{b.q}&rdquo;</div>
          <div style={{ fontSize: 11, color: 'var(--ink3)', lineHeight: 1.65, marginBottom: 9 }}>{b.a}</div>
          <div style={{ height: 2, background: 'var(--border)', borderRadius: 1, marginBottom: 4 }}>
            <div style={{ height: '100%', width: `${b.conf}%`, background: '#00695C', borderRadius: 1 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-jetbrains)', fontSize: 8, color: 'var(--ink4)' }}>
            <span>Confidence: {b.conf}%</span><span>{b.src} sources</span>
          </div>
        </div>
      ))}
    </>
  )
}
