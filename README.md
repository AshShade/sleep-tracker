# 🌙 Sleep Tracker

A mobile-first PWA for tracking sleep patterns. Record bedtime, sleep onset, wake time, and get up time with a single tap each.

## Features

- **One-tap recording** — 5 steps: 上床 → 尝试入睡 → 入睡 → 醒来 → 起床
- **No ordering constraint** — tap any step in any order
- **Time editing** — tap recorded time to adjust via DatePicker
- **Submit when ready** — review and edit all times before archiving
- **Statistics** — 7-night rolling averages (sleep duration, onset latency, snooze time)
- **Trend chart** — 30-night line chart (Chart.js)
- **Data export** — CSV and JSON download
- **PWA** — installable, works offline
- **Dark theme** — antd-mobile components with custom dark palette

## Tech Stack

- React 19 + TypeScript
- Vite 8
- antd-mobile (TabBar, Card, Button, Dialog, DatePicker, Toast, List, Grid, Empty)
- Chart.js + react-chartjs-2
- Tailwind CSS
- Vitest + @testing-library/react (100% coverage threshold)
- GitHub Actions → GitHub Pages

## Development

```bash
npm install
npm run dev      # Vite dev server (mock data auto-loads)
npm test         # Run tests with coverage
npm run build    # Production build → dist/
```

## Deploy

Push to `main` → GitHub Actions runs tests + deploys `dist/` to GitHub Pages.

Settings → Pages → Source: **GitHub Actions**

## Data Storage

All data stored in browser `localStorage`:
- `sleep_tonight` — current night's record
- `sleep_history` — up to 90 archived records

No server, no account needed.
