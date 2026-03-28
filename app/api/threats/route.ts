import { NextResponse } from 'next/server'
import { XMLParser } from 'fast-xml-parser'
import { ThreatItem, Severity } from '@/lib/types'

async function fetchCISA(): Promise<ThreatItem[]> {
  try {
    const res = await fetch('https://www.cisa.gov/cybersecurity-advisories/all.xml', {
      next: { revalidate: 300 },
      headers: { 'User-Agent': 'VIGILPlatform/1.0' },
    })
    if (!res.ok) return []
    const xml = await res.text()
    const parser = new XMLParser({ ignoreAttributes: false })
    const parsed = parser.parse(xml)
    const items = parsed?.rss?.channel?.item ?? []
    const arr = Array.isArray(items) ? items : [items]

    return arr.slice(0, 12).map((item: Record<string, string>, i: number) => {
      const title: string = item.title ?? ''
      const sev: Severity =
        title.toLowerCase().includes('critical')
          ? 'critical'
          : title.toLowerCase().includes('high')
          ? 'high'
          : title.toLowerCase().includes('medium')
          ? 'medium'
          : 'low'

      return {
        id: `cisa-${i}`,
        title: title.slice(0, 100),
        severity: sev,
        published: item.pubDate ?? new Date().toISOString(),
        summary: (item.description ?? '').replace(/<[^>]+>/g, '').slice(0, 200),
        url: item.link ?? '#',
      }
    })
  } catch {
    return []
  }
}

async function fetchCVE(): Promise<ThreatItem[]> {
  try {
    const res = await fetch('https://cve.circl.lu/api/last/10', {
      next: { revalidate: 300 },
    })
    if (!res.ok) return []
    const json = await res.json()
    const items = Array.isArray(json) ? json : []

    return items.map((c: Record<string, unknown>, i: number) => {
      const cvss = (c.cvss as number | undefined) ?? 0
      const sev: Severity =
        cvss >= 9 ? 'critical' : cvss >= 7 ? 'high' : cvss >= 4 ? 'medium' : 'low'

      return {
        id: `cve-${i}`,
        title: (c.id as string) ?? `CVE-${i}`,
        severity: sev,
        cve: c.id as string,
        published: (c.Published as string) ?? new Date().toISOString(),
        summary: ((c.summary as string) ?? '').slice(0, 200),
        url: `https://nvd.nist.gov/vuln/detail/${c.id ?? ''}`,
      }
    })
  } catch {
    return []
  }
}

export async function GET() {
  const [cisa, cve] = await Promise.all([fetchCISA(), fetchCVE()])

  const combined = [...cisa, ...cve].sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 }
    return order[a.severity] - order[b.severity]
  })

  return NextResponse.json({
    data: combined,
    timestamp: Date.now(),
    source: 'CISA + CVE CircL',
  })
}
