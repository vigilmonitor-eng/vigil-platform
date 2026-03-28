'use client'
import { MarketMetric } from '@/lib/types'

interface Props {
  metrics: MarketMetric[]
  loading: boolean
}

function MetricCell({ m }: { m: MarketMetric }) {
  const color = m.direction === 'up' ? '#1B7A45' : m.direction === 'down' ? '#C62828' : 'var(--ink4)'
  const arrow = m.direction === 'up' ? '▲' : m.direction === 'down' ? '▼' : '●'
  return (
    <div
      className="hover-bg"
      style={{
        padding: '9px 14px',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 1,
        cursor: 'pointer',
        minWidth: 0,
      }}
    >
      <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 7.5, color: 'var(--ink4)', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {m.label}
      </div>
      <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 13, fontWeight: 500, color, lineHeight: 1.2 }}>
        {m.value}
      </div>
      <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 8.5, color, display: 'flex', gap: 3 }}>
        <span>{arrow}</span>
        <span>{m.change}</span>
      </div>
    </div>
  )
}

function ShimmerCell() {
  return (
    <div style={{ padding: '9px 14px', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div className="shimmer" style={{ height: 9, width: 50, borderRadius: 3 }} />
      <div className="shimmer" style={{ height: 13, width: 65, borderRadius: 3 }} />
      <div className="shimmer" style={{ height: 8, width: 40, borderRadius: 3 }} />
    </div>
  )
}

export default function MetricsBar({ metrics, loading }: Props) {
  const display = loading
    ? Array(8).fill(null)
    : metrics.slice(0, 10)

  return (
    <div
      style={{
        height: 58,
        background: 'var(--bg2)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Ticker label */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          background: 'var(--ink)',
          color: '#fff',
          fontFamily: 'var(--font-jetbrains)',
          fontSize: 8,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          borderRight: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        Markets
      </div>

      {/* Scrollable metrics */}
      <div style={{ display: 'flex', overflowX: 'auto', flex: 1 }}>
        {loading
          ? display.map((_, i) => <ShimmerCell key={i} />)
          : display.map((m, i) => <MetricCell key={i} m={m as MarketMetric} />)
        }
      </div>
    </div>
  )
}
