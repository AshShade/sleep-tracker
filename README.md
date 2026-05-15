# 🌙 Sleep Tracker

A mobile-first PWA for tracking sleep patterns — both overnight sleep and daytime naps.

## Features

- **Night mode** — 上床, 尝试入睡, 入睡, 醒来 (multiple), 起床
- **Nap mode** — quick start/end recording for daytime naps
- **Mode switch** — SegmentedControl toggles 🌙 夜间 / ☀️ 小觉
- **Multiple wake support** — record each wake-up separately, edit/delete individually
- **Time editing** — tap recorded time → ActionSheet (update to now / pick time), confirm to save
- **Editable history** — tap any record to edit all fields, add/delete wakes, delete record
- **Unified timeline** — night (🌙) and nap (☀️) records in one history list
- **Statistics** — 7-night rolling averages (sleep duration, onset latency, snooze time)
- **Trend charts** — 4 separate charts: sleep duration, onset latency, snooze time, total in-bed
- **Data export** — CSV and JSON download
- **PWA** — installable, works offline
- **Dark theme** — Mantine dark color scheme

## Tech Stack

- React 19 + TypeScript
- Vite 8
- Mantine (Tabs, Card, Button, Modal, SegmentedControl, TextInput, Notifications, etc.)
- Chart.js + react-chartjs-2
- Vitest + @testing-library/react (store.ts 100% coverage enforced)
- ESLint (typescript-eslint + react-hooks + react-refresh)
- GitHub Actions → GitHub Pages

## Development

```bash
npm install
npm run dev      # Vite dev server (mock data auto-seeds in dev mode)
npm run lint     # ESLint
npm test         # Run tests with coverage
npm run check    # tsc + lint + test (full CI check locally)
npm run build    # Production build → dist/
```

## Deploy

Push to `main` → GitHub Actions runs lint + tests + deploys `dist/` to GitHub Pages.

Settings → Pages → Source: **GitHub Actions**

## Data Storage

All data stored in browser `localStorage`:
- `sleep_tonight` — current night's record (`NightRecord` with `wakes: number[]`)
- `sleep_nap` — current in-progress nap (`NapRecord`)
- `sleep_history` — up to 120 archived entries (nights + naps)

No server, no account needed. Data migration auto-converts old `wake:number` format to `wakes:[]`.
