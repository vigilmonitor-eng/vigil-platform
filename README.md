# VIGIL — Global Intelligence Platform

A real-time global intelligence dashboard covering geopolitical events, financial markets, cybersecurity threats, and climate/disaster events. Built with Next.js 14, D3.js, and 100% free open data sources.

---

## Live Data Sources (All Free, No Trial)

| Domain | Source | Auth Required | Rate Limit |
|--------|--------|--------------|------------|
| News / Geopolitical | [GDELT Project](https://gdeltproject.org) | None | None |
| Stock Markets | Yahoo Finance (unofficial) | None | None |
| Crypto | [CoinGecko](https://coingecko.com/api) | None | 30 req/min |
| Cybersecurity | [CISA RSS](https://cisa.gov) | None | None |
| CVE Vulnerabilities | [CircL CVE](https://cve.circl.lu) | None | None |
| Earthquakes | [USGS](https://earthquake.usgs.gov/earthquakes/feed/) | None | None |
| Disasters | [GDACS / UN](https://gdacs.org) | None | None |
| Weather / Storms | [Open-Meteo](https://open-meteo.com) | None | None (commercial OK) |
| Wildfire Hotspots | [NASA FIRMS](https://firms.modaps.eosdis.nasa.gov) | Free key | 2k req/day |
| Cyber IOCs | [AlienVault OTX](https://otx.alienvault.com) | Free key | 10k req/hr |

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Map**: D3.js v7 + Natural Earth (world-atlas)
- **Styling**: Tailwind CSS + CSS Variables
- **Data fetching**: Native fetch with Next.js ISR caching
- **Hosting**: Cloudflare Pages or Vercel (both free)
- **Language**: TypeScript

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/yourname/vigil-platform.git
cd vigil-platform
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` — most sources need no key at all. Optionally add:
- `OTX_API_KEY` — free at [otx.alienvault.com](https://otx.alienvault.com/api)
- `NASA_FIRMS_KEY` — free at [firms.modaps.eosdis.nasa.gov](https://firms.modaps.eosdis.nasa.gov/api/)

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Cloudflare Pages (Free, Unlimited Bandwidth)

1. Push your repo to GitHub
2. Go to [Cloudflare Pages](https://pages.cloudflare.com)
3. Click **Create a project** → Connect GitHub → Select repo
4. Set build settings:
   - **Build command**: `npm run build`
   - **Build output**: `.next`
   - **Node version**: `20`
5. Add environment variables (Settings → Environment Variables)
6. Click **Save and Deploy**

✅ Done — your platform is live on a `.pages.dev` domain, free forever.

---

## Deploy to Vercel (Alternative Free Option)

```bash
npm i -g vercel
vercel
```

Follow prompts. Add env vars in the Vercel dashboard.

---

## Project Structure

```
vigil-platform/
├── app/
│   ├── api/
│   │   ├── news/route.ts          # GDELT news feed
│   │   ├── markets/route.ts       # Yahoo Finance + CoinGecko
│   │   ├── threats/route.ts       # CISA + CVE CircL
│   │   └── disasters/route.ts     # USGS + GDACS
│   ├── globals.css                # Design system + animations
│   ├── layout.tsx
│   └── page.tsx                   # Main dashboard page
├── components/
│   ├── TopBar.tsx                 # Header with clock + search
│   ├── Sidebar.tsx                # Icon navigation
│   ├── WorldMap.tsx               # D3 interactive world map
│   ├── MetricsBar.tsx             # Live market metrics
│   └── RightPanel.tsx             # Situation/Feed/Cyber/AI tabs
├── lib/
│   ├── types.ts                   # TypeScript interfaces
│   └── utils.ts                   # Colors, helpers
├── .env.example                   # Environment variable template
├── vercel.json                    # Vercel config
├── wrangler.toml                  # Cloudflare config
└── package.json
```

---

## API Endpoints

All endpoints are cached with ISR (60s fresh, 120s stale):

| Endpoint | Source | Returns |
|----------|--------|---------|
| `GET /api/news` | GDELT | Latest articles by domain |
| `GET /api/markets` | Yahoo Finance + CoinGecko | Stock, forex, crypto prices |
| `GET /api/threats` | CISA + CVE CircL | Cyber advisories + CVEs |
| `GET /api/disasters` | USGS + GDACS | Earthquakes + disaster events |

---

## Customisation

**Change color theme** — edit CSS variables in `app/globals.css`:
```css
:root {
  --geo: #C62828;   /* Geopolitical — red */
  --fin: #0D47A1;   /* Markets — navy */
  --cyber: #00695C; /* Cyber — teal */
  --clim: #6A1B9A;  /* Climate — purple */
}
```

**Add static incidents** — edit `STATIC_INCIDENTS` array in `app/page.tsx`

**Change map projection** — edit `d3.geoNaturalEarth1()` in `components/WorldMap.tsx` to any D3 projection

**Adjust refresh interval** — set `NEXT_PUBLIC_REFRESH_INTERVAL` in `.env.local` (milliseconds, default 120000)

---

## Legal & Licensing

- **Code**: MIT License — free to use commercially
- **Data sources**: All public domain, government data, or commercially-permissive open APIs
- **Map data**: Natural Earth — public domain
- **Fonts**: Google Fonts (Outfit, JetBrains Mono) — SIL Open Font License

---

## Roadmap

- [ ] AlienVault OTX live IOC map overlay
- [ ] NASA FIRMS wildfire hotspot layer
- [ ] Open-Meteo storm track visualization
- [ ] GDELT event heatmap timeline slider
- [ ] Country click → detail drill-down panel
- [ ] Email/webhook alert subscriptions
- [ ] Export to PDF report

---

Built with ❤️ using open data from GDELT, USGS, GDACS, CISA, and Yahoo Finance.
