mod metrics;
use metrics::{CpuMetrics, DiskEntry, DiskMetrics, NetworkMetrics, RamMetrics};
use std::sync::Mutex;
use sysinfo::{Disks, Networks, System};
use tauri::Manager;

fn is_loopback_interface(name: &str) -> bool {
    let name = name.to_lowercase();
    name.contains("loopback") || name == "lo"
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            app.manage(Mutex::new(Networks::new_with_refreshed_list()));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_cpu, get_ram, get_disk, get_network])
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

#[tauri::command]
fn get_network(networks: tauri::State<'_, Mutex<Networks>>) -> NetworkMetrics {
    let mut networks = networks.lock().expect("network state poisoned");
    networks.refresh(true);

    let mut download_bytes = 0u64;
    let mut upload_bytes = 0u64;

    for (name, data) in networks.iter() {
        if is_loopback_interface(name) {
            continue;
        }
        download_bytes += data.received();
        upload_bytes += data.transmitted();
    }

    NetworkMetrics {
        download_kbps: download_bytes / 1024,
        upload_kbps: upload_bytes / 1024,
    }
}
