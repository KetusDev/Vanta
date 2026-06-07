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

export function formatSpeed(kbps: number): string {
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
