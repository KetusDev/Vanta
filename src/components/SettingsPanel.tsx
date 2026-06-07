import { useState } from "react";
import { useMetrics } from "../hooks/useMetrics";
import { useSettings } from "../hooks/useSettings";
import { exportHistoryCsv, exportHistoryJson } from "../lib/exportHistory";

const POLL_OPTIONS = [
  { value: 500, label: "0.5 s" },
  { value: 1000, label: "1 s" },
  { value: 2000, label: "2 s" },
  { value: 5000, label: "5 s" },
];

export function SettingsPanel() {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { history } = useMetrics();
  const [open, setOpen] = useState(false);

  return (
    <div className="settings">
      <button
        type="button"
        className="settings__toggle"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        Settings
      </button>

      {open ? (
        <div className="settings__panel">
          <div className="settings__header">
            <h2>Preferences</h2>
            <button type="button" className="settings__close" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>

          <label className="settings__field">
            <span>Refresh interval</span>
            <select
              value={settings.pollIntervalMs}
              onChange={(event) =>
                updateSettings({ pollIntervalMs: Number(event.target.value) })
              }
            >
              {POLL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="settings__field">
            <span>Network speed unit</span>
            <select
              value={settings.speedUnit}
              onChange={(event) =>
                updateSettings({
                  speedUnit: event.target.value as "kbps" | "mbps",
                })
              }
            >
              <option value="kbps">KB/s</option>
              <option value="mbps">Mbps</option>
            </select>
          </label>

          <label className="settings__field settings__field--checkbox">
            <span>Launch at startup</span>
            <input
              type="checkbox"
              checked={settings.autostart}
              onChange={(event) =>
                updateSettings({ autostart: event.target.checked })
              }
            />
          </label>

          <label className="settings__field settings__field--checkbox">
            <span>Always on top</span>
            <input
              type="checkbox"
              checked={settings.alwaysOnTop}
              onChange={(event) =>
                updateSettings({ alwaysOnTop: event.target.checked })
              }
            />
          </label>

          <label className="settings__field settings__field--checkbox">
            <span>Transparent window</span>
            <input
              type="checkbox"
              checked={settings.transparentWindow}
              onChange={(event) =>
                updateSettings({ transparentWindow: event.target.checked })
              }
            />
          </label>

          <label className="settings__field settings__field--checkbox">
            <span>High usage alerts</span>
            <input
              type="checkbox"
              checked={settings.alertsEnabled}
              onChange={(event) =>
                updateSettings({ alertsEnabled: event.target.checked })
              }
            />
          </label>

          <label className="settings__field">
            <span>CPU alert threshold</span>
            <input
              type="range"
              min={70}
              max={99}
              step={1}
              value={settings.cpuAlertThreshold}
              disabled={!settings.alertsEnabled}
              onChange={(event) =>
                updateSettings({ cpuAlertThreshold: Number(event.target.value) })
              }
            />
            <strong>{settings.cpuAlertThreshold}%</strong>
          </label>

          <label className="settings__field">
            <span>RAM alert threshold</span>
            <input
              type="range"
              min={70}
              max={99}
              step={1}
              value={settings.ramAlertThreshold}
              disabled={!settings.alertsEnabled}
              onChange={(event) =>
                updateSettings({ ramAlertThreshold: Number(event.target.value) })
              }
            />
            <strong>{settings.ramAlertThreshold}%</strong>
          </label>

          <label className="settings__field">
            <span>Disk alert threshold</span>
            <input
              type="range"
              min={70}
              max={99}
              step={1}
              value={settings.diskAlertThreshold}
              disabled={!settings.alertsEnabled}
              onChange={(event) =>
                updateSettings({ diskAlertThreshold: Number(event.target.value) })
              }
            />
            <strong>{settings.diskAlertThreshold}% used</strong>
          </label>

          <div className="settings__actions">
            <button type="button" className="settings__action" onClick={() => exportHistoryCsv(history)}>
              Export CSV
            </button>
            <button type="button" className="settings__action" onClick={() => exportHistoryJson(history)}>
              Export JSON
            </button>
          </div>

          <p className="settings__hint">
            Closing the window hides Vanta to the tray. Use Quit in the tray menu to exit.
          </p>

          <button type="button" className="settings__reset" onClick={resetSettings}>
            Reset defaults
          </button>
        </div>
      ) : null}
    </div>
  );
}
