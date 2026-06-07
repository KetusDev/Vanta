<div align="center">

# Vanta

### Lightweight system monitor built with Tauri 2 + Rust + React

[![Status](https://img.shields.io/badge/Status-In%20Development-orange?style=for-the-badge)](https://github.com/KetusDev/vanta)
[![Tauri](https://img.shields.io/badge/Tauri-2-24C8D8?style=for-the-badge&logo=tauri&logoColor=white)](https://tauri.app)
[![Rust](https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white)](https://www.rust-lang.org)
[![React](https://img.shields.io/badge/React-20232a?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

</div>

---

## What is Vanta?

Vanta is a minimal, dark-themed system monitor for Windows. It reads real-time hardware metrics via Rust on the backend and displays them in a clean React UI through Tauri — no Electron, no Node.js runtime, native performance.

## Features

- **CPU** — overall usage + per-core breakdown
- **RAM** — used / total / available, swap
- **Disk** — usage per drive
- **Network** — upload / download speed per interface
- Real-time updates every 1s
- Historical sparkline charts (last 60s)
- Dark theme

## Tech Stack

| Layer | Technology |
|-------|------------|
| Desktop shell | Tauri 2 |
| Backend / system reads | Rust + `sysinfo` crate |
| Frontend | React 19 + TypeScript |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Build tool | Vite |

## Getting Started

### Prerequisites

- [Rust](https://rustup.rs/) (stable)
- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/)
- Tauri prerequisites: [tauri.app/start/prerequisites](https://tauri.app/start/prerequisites/)

### Run locally

```bash
git clone https://github.com/KetusDev/vanta.git
cd vanta
pnpm install
pnpm tauri dev
```

### Build

```bash
pnpm tauri build
```

## Project Structure

```
vanta/
├── src/                  # React frontend
│   ├── components/
│   │   ├── CpuCard.tsx
│   │   ├── RamCard.tsx
│   │   ├── DiskCard.tsx
│   │   ├── NetworkCard.tsx
│   │   └── SparklineChart.tsx
│   ├── hooks/
│   │   └── useMetrics.ts
│   ├── types/
│   │   └── metrics.ts
│   └── App.tsx
└── src-tauri/
    ├── src/
    │   ├── main.rs
    │   ├── lib.rs
    │   └── metrics.rs
    └── Cargo.toml
```

## Implementation Plan

See [`docs/PLAN.md`](./docs/PLAN.md) for the full step-by-step guide.

## License

MIT

---

<div align="center">
Built by <a href="https://github.com/KetusDev">KetusDev</a>
</div>
