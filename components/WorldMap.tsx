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

export default function WorldMap({ incidents, disasters, activeFilters, onFilterToggle, onCountryClick }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const gRef = useRef<SVGGElement | null>(null)
  const [popup, setPopup] = useState<Popup | null>(null)
  const transformRef = useRef({ x: 0, y: 0, k: 1 })

  useEffect(() => {
    async function init() {
      const wrap = wrapRef.current
      const svg = svgRef.current
      if (!wrap || !svg) return

      const [d3mod, topomod] = await Promise.all([
        import('d3'),
        import('topojson-client'),
      ])

      const W = wrap.clientWidth
      const H = wrap.clientHeight
      svg.setAttribute('width', String(W))
      svg.setAttribute('height', String(H))

      const proj = d3mod.geoNaturalEarth1().scale(W / 6.2).translate([W / 2, H / 2])
      const geoPath = d3mod.geoPath().projection(proj)

      const svgSel = d3mod.select(svg)
      svgSel.selectAll('g').remove()
      const g = svgSel.append('g')
      gRef.current = g.node()

      try {
        const world = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then(r => r.json())

        const countries = topomod.feature(world, world.objects.countries)

        const countryFeatures =
          countries && 'features' in countries
            ? (countries as GeoJSON.FeatureCollection).features
            : []

        g.append('g')
          .selectAll('path')
          .data(countryFeatures)
          .join('path')
          .attr('class', 'land-path')
          .attr('d', geoPath as (d: GeoJSON.Feature) => string)
          .on('click', function (e: MouseEvent, d: GeoJSON.Feature) {
            e.stopPropagation()
            const name = (d.properties as Record<string, string>)?.name ?? 'Unknown'
            const code = String((d.properties as Record<string, unknown>)?.id ?? '')
            onCountryClick({ name, code })
          })

      } catch {
        console.error('Map load failed')
      }
    }

    init()
  }, [])

  const closePopup = useCallback(() => setPopup(null), [])

  return (
    <div ref={wrapRef} style={{ width: '100%', height: '100%' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }} onClick={closePopup} />
    </div>
  )
}
