use serde::Serialize;

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

#[derive(Serialize)]
pub struct DiskEntry {
    pub name: String,
    pub total_gb: u64,
    pub used_gb: u64,
}

#[derive(Serialize)]
pub struct DiskMetrics {
    pub disks: Vec<DiskEntry>,
    pub total_gb: u64,
    pub used_gb: u64,
}

#[derive(Serialize)]
pub struct NetworkInterface {
    pub name: String,
    pub download_kbps: u64,
    pub upload_kbps: u64,
}

#[derive(Serialize)]
pub struct NetworkMetrics {
    pub download_kbps: u64,
    pub upload_kbps: u64,
    pub interfaces: Vec<NetworkInterface>,
}

#[derive(Serialize)]
pub struct SystemMetrics {
    pub uptime_secs: u64,
    pub swap_total_mb: u64,
    pub swap_used_mb: u64,
}

#[derive(Serialize)]
pub struct TemperatureSensor {
    pub label: String,
    pub temp_c: f32,
    pub max_c: Option<f32>,
    pub critical_c: Option<f32>,
}

#[derive(Serialize)]
pub struct HardwareMetrics {
    pub sensors: Vec<TemperatureSensor>,
    pub max_temp_c: Option<f32>,
}

#[derive(Serialize)]
pub struct BatteryMetrics {
    pub present: bool,
    pub percent: Option<f32>,
    pub state: Option<String>,
    pub time_to_full_secs: Option<u64>,
    pub time_to_empty_secs: Option<u64>,
}

#[derive(Serialize)]
pub struct AllMetrics {
    pub cpu: CpuMetrics,
    pub ram: RamMetrics,
    pub disk: DiskMetrics,
    pub network: NetworkMetrics,
    pub system: SystemMetrics,
    pub hardware: HardwareMetrics,
    pub battery: BatteryMetrics,
}
