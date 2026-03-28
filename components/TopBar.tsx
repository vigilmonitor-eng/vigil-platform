'use client'
import { useEffect, useState } from 'react'

const NAV_ITEMS = ['Overview', 'Geopolitical', 'Markets', 'Cyber', 'Climate', 'Reports']

export default function TopBar() {
  const [time, setTime] = useState('')
  const [active, setActive] = useState('Overview')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      const p = (n: number) => String(n).padStart(2, '0')
      setTime(`UTC ${p(now.getUTCHours())}:${p(now.getUTCMinutes())}:${p(now.getUTCSeconds())}`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header
      style={{
        height: 50,
        background: 'var(--bg2)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 0 0 14px',
        flexShrink: 0,
        zIndex: 50,
      }}
    >
      {/* Brand */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          paddingRight: 16,
          borderRight: '1px solid var(--border)',
          height: '100%',
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            background: 'var(--geo)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <circle cx="7.5" cy="7.5" r="5.5" stroke="white" strokeWidth="1.4" />
            <path d="M7.5 2.5v5l2.5 2.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1 }}>
            VIGIL
          </div>
          <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 7.5, color: 'var(--ink4)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Global Intelligence
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', height: '100%', paddingLeft: 4 }}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item}
            onClick={() => setActive(item)}
            style={{
              padding: '0 14px',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.02em',
              color: active === item ? 'var(--ink)' : 'var(--ink3)',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              borderBottom: active === item ? '2px solid var(--geo)' : '2px solid transparent',
              marginBottom: -1,
              transition: 'color 0.15s, border-color 0.15s',
            }}
          >
            {item}
          </button>
        ))}
      </nav>

      {/* Right */}
      <div
        style={{
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 14px',
          borderLeft: '1px solid var(--border)',
          height: '100%',
        }}
      >
        {/* Search */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 18,
            padding: '5px 13px',
            fontSize: 11,
            color: 'var(--ink4)',
            cursor: 'text',
            minWidth: 170,
            transition: 'border-color 0.2s, background 0.2s',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="7" cy="7" r="4.5" />
            <path d="M10.5 10.5l3 3" strokeLinecap="round" />
          </svg>
          Search locations, events…
        </div>

        {/* Live badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            background: 'rgba(0,105,92,0.08)',
            border: '1px solid rgba(0,105,92,0.22)',
            borderRadius: 16,
            padding: '4px 11px',
            fontFamily: 'var(--font-jetbrains)',
            fontSize: 9,
            fontWeight: 500,
            color: 'var(--cyber)',
            letterSpacing: '0.06em',
          }}
        >
          <div
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: 'var(--cyber)',
              animation: 'pulseDot 1.4s ease-in-out infinite',
            }}
          />
          LIVE
        </div>

        {/* Clock */}
        <div
          style={{
            fontFamily: 'var(--font-jetbrains)',
            fontSize: 11,
            color: 'var(--ink3)',
            minWidth: 78,
          }}
        >
          {time}
        </div>
      </div>
    </header>
  )
}
