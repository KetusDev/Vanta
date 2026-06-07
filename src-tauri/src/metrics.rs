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
pub struct NetworkMetrics {
    pub download_kbps: u64,
    pub upload_kbps: u64,
}
