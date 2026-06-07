# Vanta — Implementation Plan

Krok po kroku. Każdy etap jest niezależny — można commitować po każdym.

---

## Etap 0 — Scaffold projektu

```bash
pnpm create tauri-app vanta
# wybierz: React + TypeScript + Vite
```

Sprawdź że działa:
```bash
pnpm tauri dev
```

Dodaj Tailwind CSS:
```bash
pnpm add -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Docs:** https://tauri.app/start/

---

## Etap 1 — Rust: pierwszy odczyt metryk

### 1.1 Dodaj `sysinfo` do `Cargo.toml`

```toml
[dependencies]
sysinfo = "0.33"
serde = { version = "1", features = ["derive"] }
```

### 1.2 Stwórz `src-tauri/src/metrics.rs`

Zdefiniuj struktury danych z `#[derive(Serialize)]` i napisz funkcje czytające:
- `get_cpu_metrics()` — użyj `System::cpu_usage()` i `System::cpus()`
- `get_ram_metrics()` — `System::total_memory()`, `used_memory()`, `available_memory()`

```rust
use serde::Serialize;
use sysinfo::System;

#[derive(Serialize)]
pub struct CpuMetrics {
    pub overall: f32,
    pub cores: Vec<f32>,
}

#[derive(Serialize)]
pub struct RamMetrics {
    pub total_mb: u64,
    pub used_mb: u64,
    pub available_mb: u64,
}
```

**Docs:** https://docs.rs/sysinfo/latest/sysinfo/

### 1.3 Zarejestruj Tauri commands w `lib.rs`

```rust
#[tauri::command]
fn get_cpu() -> CpuMetrics { ... }

#[tauri::command]
fn get_ram() -> RamMetrics { ... }

// w builder:
.invoke_handler(tauri::generate_handler![get_cpu, get_ram])
```

**Docs:** https://tauri.app/develop/calling-rust/

### 1.4 Przetestuj z `println!`

Zanim podepniesz frontend, sprawdź że dane wychodzą:
```rust
fn main() {
    let mut sys = System::new_all();
    sys.refresh_all();
    println!("CPU: {}%", sys.global_cpu_usage());
    println!("RAM: {} MB used", sys.used_memory() / 1024 / 1024);
}
```

⚠️ `sysinfo` wymaga `refresh_all()` lub `refresh_cpu_usage()` przed odczytem — bez tego dostaniesz 0. Czytaj docs.

---

## Etap 2 — React: pierwsze wyświetlenie danych

### 2.1 Typy TS (`src/types/metrics.ts`)

```ts
export interface CpuMetrics {
  overall: number;
  cores: number[];
}

export interface RamMetrics {
  total_mb: number;
  used_mb: number;
  available_mb: number;
}
```

### 2.2 Hook `useMetrics.ts`

Użyj `@tauri-apps/api/core` do wywołania Tauri commands:

```ts
import { invoke } from '@tauri-apps/api/core';
import { useEffect, useState } from 'react';

export function useCpuMetrics() {
  const [data, setData] = useState<CpuMetrics | null>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      const metrics = await invoke<CpuMetrics>('get_cpu');
      setData(metrics);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return data;
}
```

**Docs:** https://tauri.app/develop/calling-rust/#invoking-commands

### 2.3 Prosty `CpuCard.tsx`

Na start — zwykły `<div>` z procentami. Design later:

```tsx
export function CpuCard() {
  const cpu = useCpuMetrics();
  if (!cpu) return <div>Loading...</div>;
  return (
    <div>
      <h2>CPU</h2>
      <p>{cpu.overall.toFixed(1)}%</p>
    </div>
  );
}
```

---

## Etap 3 — Dyski i sieć

Tak samo jak Etap 1+2 ale dla:
- **Dyski:** `sysinfo::Disks` — `disk.total_space()`, `disk.available_space()`, `disk.name()`
- **Sieć:** `sysinfo::Networks` — `network.received()`, `network.transmitted()` (bajty od ostatniego refresh — podziel przez interval żeby dostać prędkość)

⚠️ Prędkość sieci: `received()` zwraca bajty **od ostatniego `refresh_networks()`** — musisz liczyć różnicę sam lub używać `refresh_networks()` co sekundę.

---

## Etap 4 — Wykres historyczny (Sparkline)

Zainstaluj Recharts:
```bash
pnpm add recharts
```

W hooku trzymaj historię jako `number[]` max 60 elementów:

```ts
const [history, setHistory] = useState<number[]>([]);

setHistory(prev => [...prev.slice(-59), newValue]);
```

W komponencie użyj `<LineChart>` z Recharts z ukrytymi osiami — to da czysty sparkline.

**Docs:** https://recharts.org/en-US/api/LineChart

---

## Etap 5 — Design

Dopiero tutaj zacznij stylować. Tailwind + ciemne tło, karty z `rounded-xl`, progress bary dla RAM/dysku.

Sugestia layoutu:
```
┌─────────────┬─────────────┐
│     CPU     │     RAM     │
├─────────────┼─────────────┤
│    Dyski    │   Sieć      │
└─────────────┴─────────────┘
```

---

## Kolejność commitów (sugestia)

```
chore: scaffold Tauri + React + TS + Tailwind
feat(rust): add sysinfo, CpuMetrics and RamMetrics structs
feat(rust): register get_cpu and get_ram Tauri commands
feat(web): add useMetrics hook with 1s polling
feat(web): add CpuCard and RamCard components
feat(rust): add disk and network metrics
feat(web): add DiskCard and NetworkCard
feat(web): add sparkline history charts
feat(web): apply dark theme and layout
```

---

## Przydatne linki

- [Tauri 2 docs](https://tauri.app/)
- [sysinfo crate docs](https://docs.rs/sysinfo/latest/sysinfo/)
- [Tauri: Calling Rust from JS](https://tauri.app/develop/calling-rust/)
- [Recharts](https://recharts.org/en-US/)
- [Tailwind CSS](https://tailwindcss.com/docs/)
