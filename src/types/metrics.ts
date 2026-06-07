export interface CpuMetrics{
    overall: number;
    cores: number[];
}

export interface RamMetrics{
    total_mb: number;
    used_mb: number;
    available_mb: number;
}

export interface DiskEntry {
    name: string;
    total_gb: number;
    used_gb: number;
}

export interface DiskMetrics{
    disks: DiskEntry[];
    total_gb: number;
    used_gb: number;
}
