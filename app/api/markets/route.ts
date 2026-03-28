import { NextResponse } from 'next/server'
import { MarketMetric } from '@/lib/types'

const YAHOO_SYMBOLS: { sym: string; label: string }[] = [
  { sym: '%5EGSPC', label: 'S&P 500' },
  { sym: '%5EDJI', label: 'Dow Jones' },
  { sym: '%5EVIX', label: 'VIX' },
  { sym: 'GC%3DF', label: 'Gold' },
  { sym: 'BZ%3DF', label: 'Brent Oil' },
  { sym: 'EURUSD%3DX', label: 'EUR/USD' },
  { sym: 'JPY%3DX', label: 'USD/JPY' },
  { sym: 'DX-Y.NYB', label: 'DXY' },
  { sym: '%5ETNX', label: '10Y UST' },
]

async function fetchYahoo(sym: string, label: string): Promise<MarketMetric | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=2d`
    const res = await fetch(url, {
      next: { revalidate: 60 },
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Accept: 'application/json',
      },
    })
    if (!res.ok) return null
    const json = await res.json()
    const meta = json?.chart?.result?.[0]?.meta
    if (!meta) return null

    const price = meta.regularMarketPrice ?? 0
    const prev = meta.previousClose ?? meta.chartPreviousClose ?? price
    const change = price - prev
    const pct = prev !== 0 ? (change / prev) * 100 : 0

    const fmt = (n: number) =>
      n >= 1000
        ? n.toLocaleString('en-US', { maximumFractionDigits: 0 })
        : n.toFixed(2)

    return {
      symbol: sym,
      label,
      value: fmt(price),
      change: `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`,
      direction: pct > 0.05 ? 'up' : pct < -0.05 ? 'down' : 'flat',
    }
  } catch {
    return null
  }
}

async function fetchCrypto(): Promise<MarketMetric[]> {
  try {
    const url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true'
    const res = await fetch(url, { next: { revalidate: 60 } })
    if (!res.ok) return []
    const json = await res.json()

    return [
      {
        symbol: 'BTC',
        label: 'Bitcoin',
        value: `$${(json.bitcoin?.usd ?? 0).toLocaleString()}`,
        change: `${(json.bitcoin?.usd_24h_change ?? 0).toFixed(2)}%`,
        direction: (json.bitcoin?.usd_24h_change ?? 0) >= 0 ? 'up' : 'down',
      },
      {
        symbol: 'ETH',
        label: 'Ethereum',
        value: `$${(json.ethereum?.usd ?? 0).toLocaleString()}`,
        change: `${(json.ethereum?.usd_24h_change ?? 0).toFixed(2)}%`,
        direction: (json.ethereum?.usd_24h_change ?? 0) >= 0 ? 'up' : 'down',
      },
    ]
  } catch {
    return []
  }
}

export async function GET() {
  const [yahooResults, crypto] = await Promise.all([
    Promise.allSettled(YAHOO_SYMBOLS.map(({ sym, label }) => fetchYahoo(sym, label))),
    fetchCrypto(),
  ])

  const yahoo = yahooResults
    .map((r) => (r.status === 'fulfilled' ? r.value : null))
    .filter(Boolean) as MarketMetric[]

  return NextResponse.json({
    data: [...yahoo, ...crypto],
    timestamp: Date.now(),
    source: 'Yahoo Finance + CoinGecko',
  })
}
