import type { SpeedUnit } from "../types/metrics";

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

export function formatMegabytes(mb: number): string {
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(1)} GB`;
  }
  return `${mb.toFixed(0)} MB`;
}

export function formatGigabytes(gb: number, digits = 1): string {
  return `${gb.toFixed(digits)} GB`;
}

export function formatSpeed(kbps: number, unit: SpeedUnit = "kbps"): string {
  if (unit === "mbps") {
    const mbps = (kbps * 8) / 1000;
    if (mbps >= 1) {
      return `${mbps.toFixed(1)} Mbps`;
    }
    return `${(mbps * 1000).toFixed(0)} Kbps`;
  }

  if (kbps >= 1024) {
    return `${(kbps / 1024).toFixed(1)} MB/s`;
  }
  if (kbps >= 1) {
    return `${kbps.toFixed(1)} KB/s`;
  }
  return `${(kbps * 1024).toFixed(0)} B/s`;
}

export function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}

export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3_600);
  const minutes = Math.floor((seconds % 3_600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function formatTemperature(celsius: number, digits = 1): string {
  return `${celsius.toFixed(digits)}°C`;
}

export function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null || seconds <= 0) {
    return "—";
  }

  const hours = Math.floor(seconds / 3_600);
  const minutes = Math.floor((seconds % 3_600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m`;
  }
  return `${seconds}s`;
}

export function formatBatteryState(state: string | null | undefined): string {
  if (!state) {
    return "Unknown";
  }

  return state.charAt(0).toUpperCase() + state.slice(1);
}

export function truncateName(name: string, max = 28): string {
  if (name.length <= max) {
    return name;
  }
  return `${name.slice(0, max - 1)}…`;
}
