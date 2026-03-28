'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { DisasterEvent } from '@/lib/types'

export interface MapIncident {
  id: string
  type: 'geo' | 'fin' | 'cyber' | 'clim'
  lat: number
  lon: number
  title: string
  region: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  time: string
  description?: string
  url?: string
}

interface Popup {
  incident: MapIncident
  x: number
  y: number
}

interface Props {
  incidents: MapIncident[]
  disasters: DisasterEvent[]
  activeFilters: Set<string>
  onFilterToggle: (f: string) => void
  onCountryClick: (country: { name: string; code: string }) => void
}

const COLORS: Record<string, string> = {
  geo: '#C62828', fin: '#0D47A1', cyber: '#00695C', clim: '#6A1B9A',
}
const LABELS: Record<string, string> = {
  geo: 'Geopolitical', fin: 'Markets', cyber: 'Cyber', clim: 'Climate',
}
const SEV_BG: Record<string, string> = {
  critical: 'rgba(198,40,40,0.1)', high: 'rgba(199,107,0,0.1)', medium: 'rgba(13,71,161,0.1)', low: 'rgba(0,105,92,0.1)',
}
const SEV_COLOR: Record<string, string> = {
  critical: '#C62828', high: '#C76B00', medium: '#0D47A1', low: '#00695C',
}
const SEV_SIZE: Record<string, number> = { critical: 9, high: 7, medium: 5.5, low: 4 }
const FILTER_CHIPS = [
  { key: 'geo', label: 'Conflict' },
  { key: 'fin', label: 'Markets' },
  { key: 'cyber', label: 'Cyber' },
  { key: 'clim', label: 'Climate' },
]

export default function WorldMap({ incidents, disasters, activeFilters, onFilterToggle, onCountryClick }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const gRef = useRef<SVGGElement | null>(null)
  const [popup, setPopup] = useState<Popup | null>(null)
  const [coords, setCoords] = useState('0.00°N  0.00°E')
  const [scale, setScale] = useState('1000 km')
  const transformRef = useRef({ x: 0, y: 0, k: 1 })
  const [, forceUpdate] = useState(0)

  // Load D3 dynamically
  useEffect(() => {
    let d3: typeof import('d3') | null = null
    let topo: typeof import('topojson-client') | null = null

    async function init() {
      const wrap = wrapRef.current
      const svg = svgRef.current
      if (!wrap || !svg) return

      const [d3mod, topomod] = await Promise.all([
        import('d3'),
        import('topojson-client'),
      ])
      d3 = d3mod
      topo = topomod

      const W = wrap.clientWidth
      const H = wrap.clientHeight
      svg.setAttribute('width', String(W))
      svg.setAttribute('height', String(H))

      const proj = d3mod.geoNaturalEarth1().scale(W / 6.2).translate([W / 2, H / 2])
      const geoPath = d3mod.geoPath().projection(proj)
      const graticule = d3mod.geoGraticule()()
      const sphere = { type: 'Sphere' as const }

      // Create root group
      const svgSel = d3mod.select(svg)
      svgSel.selectAll('g').remove()
      const g = svgSel.append('g')
      gRef.current = g.node()

      // Sphere (ocean)
      g.append('path').datum(sphere).attr('class', 'sphere-path').attr('d', geoPath)

      // Graticule
      g.append('path').datum(graticule).attr('class', 'graticule-path').attr('d', geoPath)

      // Load world map
      try {
        const world = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then(r => r.json())
        const countries = topomod.feature(world, world.objects.countries)
        const borders = topomod.mesh(world, world.objects.countries, (a: unknown, b: unknown) => a !== b)

        g.append('g')
          .selectAll('path')
          .data((countries as GeoJSON.FeatureCollection).features)
          .join('path')
          .attr('class', 'land-path')
          .attr('d', geoPath as (d: GeoJSON.Feature) => string)
          .on('click', function(e: MouseEvent, d: GeoJSON.Feature) {
            e.stopPropagation()
            const name = (d.properties as Record<string, string>)?.name ?? 'Unknown'
            const code = String((d.properties as Record<string, unknown>)?.id ?? '')
            onCountryClick({ name, code })
          })

        g.append('path').datum(borders).attr('class', 'border-path').attr('d', geoPath)
      } catch {
        g.append('path').datum(sphere).attr('fill', '#EDE8E0').attr('d', geoPath)
      }

      // Zoom
      const zoom = d3mod.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.7, 16])
        .on('zoom', (e) => {
          g.attr('transform', e.transform)
          transformRef.current = { x: e.transform.x, y: e.transform.y, k: e.transform.k }
          const km = Math.round(1000 / e.transform.k)
          setScale(km > 500 ? `${Math.round(km / 100) * 100} km` : `${km} km`)
          forceUpdate(n => n + 1)
        })

      svgSel.call(zoom)

      // Zoom buttons
      ;(window as unknown as Record<string, unknown>).__vigl_zoomin = () =>
        svgSel.transition().duration(320).call(zoom.scaleBy, 1.65)
      ;(window as unknown as Record<string, unknown>).__vigl_zoomout = () =>
        svgSel.transition().duration(320).call(zoom.scaleBy, 0.62)
      ;(window as unknown as Record<string, unknown>).__vigl_reset = () =>
        svgSel.transition().duration(500).call(zoom.transform, d3mod.zoomIdentity)

      // Mouse coords
      svg.addEventListener('mousemove', (e) => {
        const rect = svg.getBoundingClientRect()
        const t = transformRef.current
        const px = (e.clientX - rect.left - t.x) / t.k
        const py = (e.clientY - rect.top - t.y) / t.k
        const lonlat = proj.invert ? proj.invert([px, py]) : null
        if (lonlat) {
          const lat = lonlat[1].toFixed(2)
          const lon = lonlat[0].toFixed(2)
          setCoords(`${Math.abs(Number(lat))}°${Number(lat) >= 0 ? 'N' : 'S'}  ${Math.abs(Number(lon))}°${Number(lon) >= 0 ? 'E' : 'W'}`)
        }
      })

      // Render markers
      renderMarkers(g, proj, incidents, disasters, activeFilters, setPopup, svg)

      // Store for re-renders
      ;(window as unknown as Record<string, unknown>).__vigl_g = g
      ;(window as unknown as Record<string, unknown>).__vigl_proj = proj
    }

    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-render markers when data or filters change
  useEffect(() => {
    const g = (window as unknown as Record<string, unknown>).__vigl_g as d3.Selection<SVGGElement, unknown, null, undefined> | undefined
    const proj = (window as unknown as Record<string, unknown>).__vigl_proj as d3.GeoProjection | undefined
    const svg = svgRef.current
    if (!g || !proj || !svg) return
    renderMarkers(g, proj, incidents, disasters, activeFilters, setPopup, svg)
  }, [incidents, disasters, activeFilters])

  const closePopup = useCallback(() => setPopup(null), [])

  return (
    <div ref={wrapRef} style={{ flex: 1, position: 'relative', overflow: 'hidden', background: 'var(--ocean)', cursor: 'grab' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%', display: 'block' }}
        onClick={() => setPopup(null)} />

      {/* Filter chips */}
      <div style={{ position: 'absolute', top: 11, left: 12, display: 'flex', gap: 6, zIndex: 20 }}>
        {FILTER_CHIPS.map(({ key, label }) => {
          const on = activeFilters.has(key)
          return (
            <button
              key={key}
              onClick={(e) => { e.stopPropagation(); onFilterToggle(key) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: on ? `rgba(${key === 'geo' ? '198,40,40' : key === 'fin' ? '13,71,161' : key === 'cyber' ? '0,105,92' : '106,27,154'},0.09)` : '#fff',
                border: `1.5px solid ${on ? COLORS[key] : 'var(--border)'}`,
                borderRadius: 16, padding: '5px 12px',
                fontSize: 10.5, fontWeight: 600,
                color: on ? COLORS[key] : 'var(--ink3)',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS[key] }} />
              {label}
            </button>
          )
        })}
      </div>

      {/* Zoom controls */}
      <div style={{ position: 'absolute', right: 14, bottom: 70, display: 'flex', flexDirection: 'column', gap: 3, zIndex: 20 }}>
        {[
          { id: 'zin', label: '+', fn: '__vigl_zoomin' },
          { id: 'zout', label: '−', fn: '__vigl_zoomout' },
          { id: 'zreset', label: '⌖', fn: '__vigl_reset', small: true },
        ].map(({ id, label, fn, small }) => (
          <button
            key={id}
            onClick={() => (window as unknown as Record<string, () => void>)[fn]?.()}
            style={{
              width: 34, height: 34, background: '#fff',
              border: '1px solid var(--border)', borderRadius: 7,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: small ? 13 : 19,
              fontWeight: 300, color: 'var(--ink2)',
              boxShadow: 'var(--shadow-sm)', transition: 'all 0.15s',
              lineHeight: 1,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Scale bar */}
      <div style={{ position: 'absolute', bottom: 70, left: 14, display: 'flex', alignItems: 'flex-end', gap: 5, zIndex: 20 }}>
        <div style={{ width: 60, height: 3, background: 'var(--ink3)', position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: -3, width: 2, height: 9, background: 'var(--ink3)' }} />
          <div style={{ position: 'absolute', right: 0, top: -3, width: 2, height: 9, background: 'var(--ink3)' }} />
        </div>
        <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 8.5, color: 'var(--ink3)' }}>{scale}</span>
      </div>

      {/* Coords */}
      <div style={{ position: 'absolute', bottom: 70, right: 60, fontFamily: 'var(--font-jetbrains)', fontSize: 9, color: 'var(--ink3)', background: 'rgba(255,255,255,0.8)', padding: '3px 8px', borderRadius: 4, border: '1px solid var(--border)', zIndex: 20 }}>
        {coords}
      </div>

      {/* Incident Popup */}
      {popup && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            left: Math.min(popup.x + 18, (wrapRef.current?.clientWidth ?? 800) - 260),
            top: Math.max(popup.y - 100, 10),
            width: 240,
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: 12,
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border)',
            padding: '14px 15px 13px',
            zIndex: 200,
            animation: 'slideUp 0.22s ease-out',
          }}
        >
          <button
            onClick={closePopup}
            style={{
              position: 'absolute', top: 9, right: 9,
              width: 21, height: 21, borderRadius: '50%',
              background: 'var(--bg)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 13, color: 'var(--ink3)',
              transition: 'all 0.15s', lineHeight: 1,
            }}
          >×</button>
          <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS[popup.incident.type], fontWeight: 500, marginBottom: 5 }}>
            {LABELS[popup.incident.type]}
          </div>
          <div style={{ fontWeight: 700, fontSize: 12.5, lineHeight: 1.4, marginBottom: 5, paddingRight: 18 }}>
            {popup.incident.title}
          </div>
          <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 9, color: 'var(--ink4)', marginBottom: 10 }}>
            {popup.incident.region} · {popup.incident.time}
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: SEV_BG[popup.incident.severity],
            padding: '3px 8px', borderRadius: 5,
            fontFamily: 'var(--font-jetbrains)', fontSize: 8, fontWeight: 500,
            color: SEV_COLOR[popup.incident.severity], textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            {popup.incident.severity}
          </div>
          {popup.incident.url && popup.incident.url !== '#' && (
            <a
              href={popup.incident.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'block', marginTop: 10, fontSize: 10, color: COLORS[popup.incident.type], textDecoration: 'underline' }}
            >
              Read more →
            </a>
          )}
        </div>
      )}
    </div>
  )
}

function renderMarkers(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  proj: d3.GeoProjection,
  incidents: MapIncident[],
  disasters: DisasterEvent[],
  activeFilters: Set<string>,
  setPopup: (p: Popup | null) => void,
  svg: SVGSVGElement,
) {
  g.selectAll('.marker-group').remove()

  const allPoints: Array<{ id: string; lat: number; lon: number; type: string; severity: 'critical' | 'high' | 'medium' | 'low'; title: string; region: string; time: string; url?: string }> = [
    ...incidents.filter(i => activeFilters.has(i.type)),
    ...disasters.filter(d => activeFilters.has('clim')).map(d => ({ ...d, type: 'clim', severity: 'high' as const, url: undefined })),
  ]

  allPoints.forEach((inc) => {
    const coords = proj([inc.lon, inc.lat])
    if (!coords) return
    const [x, y] = coords
    const W = parseInt(svg.getAttribute('width') ?? '800')
    const H = parseInt(svg.getAttribute('height') ?? '600')
    if (x < 0 || y < 0 || x > W || y > H) return

    const col = COLORS[inc.type] ?? '#999'
    const r = SEV_SIZE[inc.severity] ?? 5

    const mg = g.append('g').attr('class', 'marker-group').attr('transform', `translate(${x},${y})`).attr('cursor', 'pointer')

    // Animated pulse ring using SMIL animation (works correctly in SVG without transform issues)
    const ring = mg.append('circle')
      .attr('r', r)
      .attr('fill', 'none')
      .attr('stroke', col)
      .attr('stroke-width', 1.2)
      .attr('opacity', 0.6)

    ring.append('animate')
      .attr('attributeName', 'r')
      .attr('from', r)
      .attr('to', r * 3)
      .attr('dur', '2s')
      .attr('repeatCount', 'indefinite')
      .attr('begin', '0s')

    ring.append('animate')
      .attr('attributeName', 'opacity')
      .attr('from', 0.6)
      .attr('to', 0)
      .attr('dur', '2s')
      .attr('repeatCount', 'indefinite')
      .attr('begin', '0s')

    // Core
    mg.append('circle').attr('r', r).attr('fill', col).attr('opacity', 0.88)
    mg.append('circle').attr('r', r * 0.35).attr('fill', '#fff').attr('opacity', 0.9)

    // Hover + click
    mg.on('mouseenter', function () {
      mg.selectAll('circle').filter((_: unknown, i: number) => i === 2).attr('r', r * 1.4).attr('opacity', 1)
    }).on('mouseleave', function () {
      mg.selectAll('circle').filter((_: unknown, i: number) => i === 2).attr('r', r).attr('opacity', 0.88)
    }).on('click', function (e: MouseEvent) {
      e.stopPropagation()
      const rect = svg.getBoundingClientRect()
      setPopup({
        incident: { id: inc.id, type: inc.type as MapIncident['type'], lat: inc.lat, lon: inc.lon, title: inc.title, region: inc.region, severity: inc.severity, time: inc.time, url: inc.url },
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    })
  })
}

