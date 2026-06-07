export interface CpuMetrics {
  overall: number;
  cores: number[];
}

export interface RamMetrics {
  total_mb: number;
  used_mb: number;
  available_mb: number;
}

export interface DiskEntry {
  name: string;
  total_gb: number;
  used_gb: number;
}

export interface DiskMetrics {
  disks: DiskEntry[];
  total_gb: number;
  used_gb: number;
}

export interface NetworkInterface {
  name: string;
  download_kbps: number;
  upload_kbps: number;
}

export interface NetworkMetrics {
  download_kbps: number;
  upload_kbps: number;
  interfaces: NetworkInterface[];
}

export interface SystemMetrics {
  uptime_secs: number;
  swap_total_mb: number;
  swap_used_mb: number;
}

export interface TemperatureSensor {
  label: string;
  temp_c: number;
  max_c: number | null;
  critical_c: number | null;
}

export interface HardwareMetrics {
  sensors: TemperatureSensor[];
  max_temp_c: number | null;
}

export interface BatteryMetrics {
  present: boolean;
  percent: number | null;
  state: string | null;
  time_to_full_secs: number | null;
  time_to_empty_secs: number | null;
}

export interface AllMetrics {
  cpu: CpuMetrics;
  ram: RamMetrics;
  disk: DiskMetrics;
  network: NetworkMetrics;
  system: SystemMetrics;
  hardware: HardwareMetrics;
  battery: BatteryMetrics;
}

export interface MetricsHistory {
  cpu: number[];
  ram: number[];
  disk: number[];
  download: number[];
  upload: number[];
  temperature: number[];
}

export const HISTORY_LENGTH = 60;

export type SpeedUnit = "kbps" | "mbps";

export interface AppSettings {
  pollIntervalMs: number;
  speedUnit: SpeedUnit;
  alertsEnabled: boolean;
  cpuAlertThreshold: number;
  ramAlertThreshold: number;
  diskAlertThreshold: number;
  alwaysOnTop: boolean;
  autostart: boolean;
  transparentWindow: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  pollIntervalMs: 1000,
  speedUnit: "kbps",
  alertsEnabled: true,
  cpuAlertThreshold: 90,
  ramAlertThreshold: 90,
  diskAlertThreshold: 90,
  alwaysOnTop: false,
  autostart: false,
  transparentWindow: false,
};
