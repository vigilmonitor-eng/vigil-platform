import { NextResponse } from 'next/server'
import { NewsItem, Domain } from '@/lib/types'

const QUERIES: { q: string; domain: Domain }[] = [
  { q: 'military conflict war geopolitical', domain: 'geo' },
  { q: 'cyberattack hacker ransomware breach', domain: 'cyber' },
  { q: 'cyclone flood wildfire disaster climate', domain: 'clim' },
  { q: 'stock market oil economy sanctions', domain: 'fin' },
]

async function fetchGdeltArticles(query: string, domain: Domain): Promise<NewsItem[]> {
  const params = new URLSearchParams({
    query,
    mode: 'artlist',
    format: 'json',
    maxrecords: '8',
    sort: 'hybridrel',
    timespan: '24h',
  })
  const url = `https://api.gdeltproject.org/api/v2/doc/doc?${params}`

  try {
    const res = await fetch(url, {
      next: { revalidate: 120 },
      headers: { 'User-Agent': 'VIGILPlatform/1.0' },
    })
    if (!res.ok) return []
    const json = await res.json()
    const articles = json?.articles ?? []

    return articles.map((a: Record<string, string>, i: number) => ({
      id: `${domain}-${i}-${Date.now()}`,
      title: a.title ?? 'Untitled',
      url: a.url ?? '#',
      source: a.domain ?? 'Unknown',
      domain,
      time: a.seendate
        ? new Date(
            a.seendate.replace(
              /(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/,
              '$1-$2-$3T$4:$5:$6Z',
            ),
          ).toISOString()
        : new Date().toISOString(),
      region: a.sourcecountry ?? 'Global',
    }))
  } catch {
    return []
  }
}

export async function GET() {
  const results = await Promise.allSettled(
    QUERIES.map(({ q, domain }) => fetchGdeltArticles(q, domain)),
  )

  const all: NewsItem[] = results
    .flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

  return NextResponse.json({
    data: all,
    timestamp: Date.now(),
    source: 'GDELT Project',
  })
}
