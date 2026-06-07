mod metrics;

use battery::State as BatteryState;
use metrics::{
    AllMetrics, BatteryMetrics, CpuMetrics, DiskEntry, DiskMetrics, HardwareMetrics,
    NetworkInterface, NetworkMetrics, RamMetrics, SystemMetrics, TemperatureSensor,
};
use std::sync::Mutex;
use std::time::Duration;
use sysinfo::{Components, Disks, Networks, System};
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager, WindowEvent,
};

const TRAY_ID: &str = "vanta-tray";

struct MetricsState {
    system: System,
    networks: Networks,
    disks: Disks,
    components: Components,
}

fn is_loopback_interface(name: &str) -> bool {
    let name = name.to_lowercase();
    name.contains("loopback") || name == "lo"
}

fn read_cpu(system: &System) -> CpuMetrics {
    CpuMetrics {
        overall: system.global_cpu_usage(),
        cores: system.cpus().iter().map(|cpu| cpu.cpu_usage()).collect(),
    }
}

fn read_ram(system: &System) -> RamMetrics {
    RamMetrics {
        total_mb: system.total_memory() / 1024 / 1024,
        used_mb: system.used_memory() / 1024 / 1024,
        available_mb: system.available_memory() / 1024 / 1024,
    }
}

fn read_system(system: &System) -> SystemMetrics {
    SystemMetrics {
        uptime_secs: System::uptime(),
        swap_total_mb: system.total_swap() / 1024 / 1024,
        swap_used_mb: system.used_swap() / 1024 / 1024,
    }
}

fn read_disk(disks: &Disks) -> DiskMetrics {
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

fn read_hardware(components: &Components) -> HardwareMetrics {
    let mut sensors = Vec::new();
    let mut max_temp_c = None;

    for component in components.iter() {
        let Some(temp_c) = component.temperature() else {
            continue;
        };

        if !temp_c.is_finite() {
            continue;
        }

        max_temp_c = Some(max_temp_c.map_or(temp_c, |current: f32| current.max(temp_c)));
        sensors.push(TemperatureSensor {
            label: component.label().to_string(),
            temp_c,
            max_c: component.max(),
            critical_c: component.critical(),
        });
    }

    sensors.sort_by(|left, right| {
        right
            .temp_c
            .partial_cmp(&left.temp_c)
            .unwrap_or(std::cmp::Ordering::Equal)
    });

    HardwareMetrics {
        sensors,
        max_temp_c,
    }
}

fn battery_state_label(state: BatteryState) -> &'static str {
    match state {
        BatteryState::Unknown | BatteryState::__Nonexhaustive => "unknown",
        BatteryState::Charging => "charging",
        BatteryState::Discharging => "discharging",
        BatteryState::Empty => "empty",
        BatteryState::Full => "full",
    }
}

fn read_battery() -> BatteryMetrics {
    let manager = match battery::Manager::new() {
        Ok(manager) => manager,
        Err(_) => {
            return BatteryMetrics {
                present: false,
                percent: None,
                state: None,
                time_to_full_secs: None,
                time_to_empty_secs: None,
            };
        }
    };

    let mut batteries = match manager.batteries() {
        Ok(batteries) => batteries,
        Err(_) => {
            return BatteryMetrics {
                present: false,
                percent: None,
                state: None,
                time_to_full_secs: None,
                time_to_empty_secs: None,
            };
        }
    };

    let mut battery = match batteries.next() {
        Some(Ok(battery)) => battery,
        _ => {
            return BatteryMetrics {
                present: false,
                percent: None,
                state: None,
                time_to_full_secs: None,
                time_to_empty_secs: None,
            };
        }
    };

    let _ = manager.refresh(&mut battery);

    use battery::units::ratio::percent;
    use battery::units::time::second;

    BatteryMetrics {
        present: true,
        percent: Some(battery.state_of_charge().get::<percent>()),
        state: Some(battery_state_label(battery.state()).to_string()),
        time_to_full_secs: battery
            .time_to_full()
            .map(|time| time.get::<second>() as u64),
        time_to_empty_secs: battery
            .time_to_empty()
            .map(|time| time.get::<second>() as u64),
    }
}

fn read_network(networks: &Networks) -> NetworkMetrics {
    let mut download_bytes = 0u64;
    let mut upload_bytes = 0u64;
    let mut interfaces = Vec::new();

    for (name, data) in networks.iter() {
        if is_loopback_interface(name) {
            continue;
        }

        let received = data.received();
        let transmitted = data.transmitted();
        download_bytes += received;
        upload_bytes += transmitted;

        if received > 0 || transmitted > 0 {
            interfaces.push(NetworkInterface {
                name: name.to_string(),
                download_kbps: received / 1024,
                upload_kbps: transmitted / 1024,
            });
        }
    }

    interfaces.sort_by(|a, b| {
        b.download_kbps
            .cmp(&a.download_kbps)
            .then_with(|| b.upload_kbps.cmp(&a.upload_kbps))
    });

    NetworkMetrics {
        download_kbps: download_bytes / 1024,
        upload_kbps: upload_bytes / 1024,
        interfaces,
    }
}

fn refresh_metrics(state: &mut MetricsState) {
    state.system.refresh_cpu_usage();
    state.system.refresh_memory();
    state.disks.refresh(true);
    state.networks.refresh(true);
    state.components.refresh(false);
}

fn collect_metrics(state: &mut MetricsState) -> AllMetrics {
    refresh_metrics(state);
    AllMetrics {
        cpu: read_cpu(&state.system),
        ram: read_ram(&state.system),
        disk: read_disk(&state.disks),
        network: read_network(&state.networks),
        system: read_system(&state.system),
        hardware: read_hardware(&state.components),
        battery: read_battery(),
    }
}

fn tray_tooltip_from_metrics(metrics: &AllMetrics) -> String {
    let ram_pct = if metrics.ram.total_mb > 0 {
        (metrics.ram.used_mb as f64 / metrics.ram.total_mb as f64) * 100.0
    } else {
        0.0
    };

    format!(
        "CPU {:.0}% | RAM {:.0}% | ↓ {} KB/s | ↑ {} KB/s",
        metrics.cpu.overall, ram_pct, metrics.network.download_kbps, metrics.network.upload_kbps
    )
}

fn show_main_window(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.unminimize();
        let _ = window.set_focus();
    }
}

fn spawn_tray_updater(app: &tauri::AppHandle) {
    let handle = app.clone();

    std::thread::spawn(move || loop {
        std::thread::sleep(Duration::from_secs(2));

        let tooltip = {
            let state = handle.state::<Mutex<MetricsState>>();
            let mut guard = state.lock().expect("metrics state poisoned");
            let metrics = collect_metrics(&mut guard);
            tray_tooltip_from_metrics(&metrics)
        };

        let handle_for_main = handle.clone();
        let _ = handle.run_on_main_thread(move || {
            if let Some(tray) = handle_for_main.tray_by_id(TRAY_ID) {
                let _ = tray.set_tooltip(Some(&tooltip));
            }
        });
    });
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec![]),
        ))
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                let _ = window.hide();
                api.prevent_close();
            }
        })
        .setup(|app| {
            let mut system = System::new_all();
            system.refresh_all();

            app.manage(Mutex::new(MetricsState {
                system,
                networks: Networks::new_with_refreshed_list(),
                disks: Disks::new_with_refreshed_list(),
                components: Components::new_with_refreshed_list(),
            }));

            let show_item = MenuItem::with_id(app, "show", "Show Vanta", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_item, &quit_item])?;

            TrayIconBuilder::with_id(TRAY_ID)
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .tooltip("Vanta")
                .show_menu_on_left_click(false)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => show_main_window(app),
                    "quit" => app.exit(0),
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        show_main_window(tray.app_handle());
                    }
                })
                .build(app)?;

            spawn_tray_updater(app.handle());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_all_metrics])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn get_all_metrics(state: tauri::State<'_, Mutex<MetricsState>>) -> AllMetrics {
    let mut state = state.lock().expect("metrics state poisoned");
    collect_metrics(&mut state)
}
