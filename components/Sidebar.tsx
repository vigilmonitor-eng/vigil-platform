'use client'

const ITEMS = [
  { icon: '🌍', label: 'All Domains', d: 'all', color: '#C62828' },
  { icon: '🛡️', label: 'Geopolitical', d: 'geo', color: '#C62828' },
  { icon: '📈', label: 'Markets', d: 'fin', color: '#0D47A1' },
  { icon: '🔐', label: 'Cyber', d: 'cyber', color: '#00695C' },
  { icon: '🌊', label: 'Climate', d: 'clim', color: '#6A1B9A' },
  { icon: '⚔️', label: 'War Room', d: 'war', color: '#B71C1C' },
]

const BOTTOM = [
  { icon: '🔔', label: 'Alerts', d: 'alert', color: '#C62828' },
  { icon: '📋', label: 'Reports', d: 'report', color: '#0D47A1' },
  { icon: '⚙️', label: 'Settings', d: 'settings', color: '#555' },
]

interface Props {
  active: string
  onChange: (d: string) => void
}

export default function Sidebar({ active, onChange }: Props) {
  const renderBtn = (icon: string, label: string, d: string, color: string) => {
    const on = active === d
    return (
      <div key={d} style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}
        onMouseEnter={e => {
          const tip = (e.currentTarget as HTMLElement).querySelector('.tip') as HTMLElement
          if (tip) tip.style.opacity = '1'
        }}
        onMouseLeave={e => {
          const tip = (e.currentTarget as HTMLElement).querySelector('.tip') as HTMLElement
          if (tip) tip.style.opacity = '0'
        }}
      >
        <button onClick={() => onChange(d)} title={label} style={{
          width: 38, height: 38, borderRadius: 9,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', background: on ? `${color}18` : 'transparent',
          border: 'none', fontSize: 17, transition: 'all 0.18s ease', position: 'relative',
        }}>
          {on && <div style={{
            position: 'absolute', left: -7, top: '50%', transform: 'translateY(-50%)',
            width: 3, height: 18, borderRadius: '0 2px 2px 0', background: color,
          }} />}
          {icon}
        </button>
        <div className="tip" style={{
          position: 'absolute', left: 46, top: '50%', transform: 'translateY(-50%)',
          background: '#1A1410', color: '#fff', fontSize: 10, padding: '4px 9px',
          borderRadius: 5, whiteSpace: 'nowrap', pointerEvents: 'none',
          opacity: 0, transition: 'opacity 0.15s', zIndex: 999,
        }}>{label}</div>
      </div>
    )
  }

  return (
    <nav style={{
      width: 52, background: 'var(--bg2)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '10px 0', gap: 3, flexShrink: 0, zIndex: 10,
    }}>
      {ITEMS.map(({ icon, label, d, color }) => renderBtn(icon, label, d, color))}
      <div style={{ width: 26, height: 1, background: 'var(--border)', margin: '5px 0' }} />
      {BOTTOM.slice(0, 2).map(({ icon, label, d, color }) => renderBtn(icon, label, d, color))}
      <div style={{ flex: 1 }} />
      {BOTTOM.slice(2).map(({ icon, label, d, color }) => renderBtn(icon, label, d, color))}
    </nav>
  )
}
