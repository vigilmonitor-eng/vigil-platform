import { NextResponse } from 'next/server'
import { XMLParser } from 'fast-xml-parser'
import { DisasterEvent } from '@/lib/types'

async function fetchUSGS(): Promise<DisasterEvent[]> {
  try {
    const res = await fetch(
      'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_30days.geojson',
      { next: { revalidate: 300 } },
    )
    if (!res.ok) return []
    const json = await res.json()
    const features = json?.features ?? []

    return features.slice(0, 15).map((f: Record<string, unknown>) => {
      const props = f.properties as Record<string, unknown>
      const geo = f.geometry as { coordinates: number[] }
      return {
        id: f.id as string,
        type: 'earthquake' as const,
        lat: geo.coordinates[1],
        lon: geo.coordinates[0],
        title: (props.title as string) ?? 'Earthquake',
        magnitude: props.mag as number,
        time: new Date(props.time as number).toISOString(),
        region: (props.place as string) ?? 'Unknown',
      }
    })
  } catch {
    return []
  }
}

async function fetchGDACS(): Promise<DisasterEvent[]> {
  try {
    const res = await fetch('https://www.gdacs.org/xml/rss.xml', {
      next: { revalidate: 300 },
      headers: { 'User-Agent': 'VIGILPlatform/1.0' },
    })
    if (!res.ok) return []
    const xml = await res.text()
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' })
    const parsed = parser.parse(xml)
    const items = parsed?.rss?.channel?.item ?? []
    const arr = (Array.isArray(items) ? items : [items]).slice(0, 10)

    return arr.map((item: Record<string, unknown>, i: number) => {
      const title = (item.title as string) ?? ''
      const type = title.toLowerCase().includes('cyclone')
        ? 'cyclone'
        : title.toLowerCase().includes('flood')
        ? 'flood'
        : title.toLowerCase().includes('fire')
        ? 'fire'
        : title.toLowerCase().includes('volcano')
        ? 'volcano'
        : 'flood'

      const lat = parseFloat((item['geo:lat'] as string) ?? '0') || 0
      const lon = parseFloat((item['geo:long'] as string) ?? '0') || 0

      return {
        id: `gdacs-${i}`,
        type: type as DisasterEvent['type'],
        lat,
        lon,
        title: title.slice(0, 120),
        time: (item.pubDate as string) ?? new Date().toISOString(),
        region: (item['gdacs:country'] as string) ?? 'Global',
      }
    })
  } catch {
    return []
  }
}

export async function GET() {
  const [usgs, gdacs] = await Promise.all([fetchUSGS(), fetchGDACS()])

  return NextResponse.json({
    data: { earthquakes: usgs, events: gdacs },
    timestamp: Date.now(),
    source: 'USGS + GDACS (UN)',
  })
}
