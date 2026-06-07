mod metrics;
use metrics::{CpuMetrics, DiskEntry, DiskMetrics, RamMetrics};
use sysinfo::{Disks, System};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_cpu, get_ram, get_disk])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn get_cpu() -> CpuMetrics {
    let mut sys = System::new_all();
    sys.refresh_all();
    CpuMetrics {
        overall: sys.global_cpu_usage(),
        cores: sys.cpus().iter().map(|cpu| cpu.cpu_usage()).collect(),
    }
}

#[tauri::command]
fn get_ram() -> RamMetrics {
    let mut sys = System::new_all();
    sys.refresh_all();
    RamMetrics {
        total_mb: sys.total_memory() / 1024 / 1024,
        used_mb: sys.used_memory() / 1024 / 1024,
        available_mb: sys.available_memory() / 1024 / 1024,
    }
}

#[tauri::command]
fn get_disk() -> DiskMetrics {
    let disks = Disks::new_with_refreshed_list();
    let mut entries = Vec::new();
    let mut total_gb = 0u64;
    let mut used_gb = 0u64;

    for disk in disks.list() {
        let total_bytes = disk.total_space();
        if total_bytes == 0 {
            continue;
        }

        let available_bytes = disk.available_space();
        let used_bytes = total_bytes.saturating_sub(available_bytes);
        let total = total_bytes / 1024 / 1024 / 1024;
        let used = used_bytes / 1024 / 1024 / 1024;

        let mount = disk.mount_point().to_string_lossy();
        let name = if mount.is_empty() {
            disk.name().to_string_lossy().to_string()
        } else {
            mount.trim_end_matches('\\').to_string()
        };

        total_gb += total;
        used_gb += used;
        entries.push(DiskEntry {
            name,
            total_gb: total,
            used_gb: used,
        });
    }

    DiskMetrics {
        disks: entries,
        total_gb,
        used_gb,
    }
}