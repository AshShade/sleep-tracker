# 🌙 睡眠记录

[English](./README.md)

一款移动优先的 PWA，用于记录睡眠模式——包括夜间睡眠和日间小觉。

## 功能

- **夜间模式** — 上床、尝试入睡、入睡、醒来（支持多次）、起床
- **小觉模式** — 快速记录日间小觉的入睡和醒来时间
- **模式切换** — 分段控件切换 🌙 夜间 / ☀️ 小觉
- **多次醒来** — 分别记录每次醒来，可单独编辑/删除
- **时间编辑** — 点击已记录时间 → ActionSheet（更新为此刻 / 选择时间）
- **历史可编辑** — 点击任何记录编辑所有字段，增删醒来，删除记录
- **统一时间线** — 夜间（🌙）和小觉（☀️）记录在同一历史列表中
- **统计** — 近 7 晚平均（睡眠时长、入睡耗时、赖床时间）
- **趋势图** — 4 张独立图表：睡眠时长、入睡耗时、赖床时间、在床总时长
- **数据导出** — CSV 和 JSON 下载
- **PWA** — 可安装，离线可用
- **暗色主题** — Mantine 暗色方案
- **国际化** — 中文/英文，自动检测浏览器语言

## 技术栈

- React 19 + TypeScript
- Vite 8
- Mantine（Tabs、Card、Button、Modal、SegmentedControl、TextInput、Notifications 等）
- Chart.js + react-chartjs-2
- react-i18next（中文/英文）
- Vitest + @testing-library/react（store.ts 100% 覆盖率）
- ESLint（typescript-eslint + react-hooks + react-refresh）
- GitHub Actions → GitHub Pages

## 开发

```bash
npm install
npm run dev      # Vite 开发服务器（开发模式自动加载模拟数据）
npm run lint     # ESLint
npm test         # 运行测试和覆盖率
npm run check    # tsc + lint + test（本地完整检查）
npm run build    # 生产构建 → dist/
```

开发时访问 `/en` 或 `/zh` 可强制切换语言。

## 部署

Push 到 `main` → GitHub Actions 运行 lint + 测试 + 部署 `dist/` 到 GitHub Pages。

Settings → Pages → Source: **GitHub Actions**

## 数据存储

所有数据存储在浏览器 `localStorage`：
- `sleep_tonight` — 当晚记录（`NightRecord`，含 `wakes: number[]`）
- `sleep_nap` — 当前进行中的小觉（`NapRecord`）
- `sleep_history` — 最多 120 条归档记录（夜间 + 小觉）

无服务器，无账号。数据迁移自动将旧 `wake:number` 格式转换为 `wakes:[]`。
