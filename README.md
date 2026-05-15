# 🌙 Sleep Tracker

A mobile-first PWA for tracking sleep patterns. Record bedtime, sleep onset, wake times, and get up time with a single tap each.

## Features

- **One-tap recording** — 上床, 尝试入睡, 入睡, 醒来 (multiple), 起床
- **Multiple wake support** — record each wake-up separately, edit/delete individually
- **Time editing** — tap recorded time → ActionSheet (update to now / pick time)
- **Date + Time picker** — TimeInput + DateInput, auto-saves on modal close
- **Editable history** — tap any record to edit all fields, add/delete wakes, delete record
- **Statistics** — 7-night rolling averages (sleep duration, onset latency, snooze time)
- **Trend chart** — 30-night line chart (Chart.js)
- **Data export** — CSV and JSON download
- **PWA** — installable, works offline
- **Dark theme** — Mantine dark color scheme

## Tech Stack

- React 19 + TypeScript
- Vite 8
- Mantine (Tabs, Card, Button, Modal, TimeInput, DateInput, Notifications, ActionIcon, etc.)
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
- `sleep_tonight` — current night's record (with `wakes: number[]`)
- `sleep_history` — up to 90 archived records

No server, no account needed. Data migration auto-converts old `wake:number` format to `wakes:[]`.
