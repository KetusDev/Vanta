import { useHardwareMetrics } from "../hooks/useMetrics";
import {
  clampPercent,
  formatBatteryState,
  formatDuration,
  formatTemperature,
  truncateName,
} from "../lib/format";
import { MetricCard } from "./ui/MetricCard";
import { ProgressBar } from "./ui/ProgressBar";
import { Sparkline } from "./ui/Sparkline";
import { StatRow } from "./ui/StatRow";

function batteryTimeLabel(
  state: string | null | undefined,
  timeToFullSecs: number | null,
  timeToEmptySecs: number | null,
): string {
  if (state === "charging") {
    return formatDuration(timeToFullSecs);
  }
  if (state === "discharging") {
    return formatDuration(timeToEmptySecs);
  }
  return "—";
}

export function HardwareCard() {
  const { hardware, battery, history, loading } = useHardwareMetrics();
  const hasSensors = (hardware?.sensors.length ?? 0) > 0;
  const maxTemp = hardware?.max_temp_c ?? null;

  return (
    <MetricCard
      title="Hardware"
      subtitle="Thermal & power"
      accent="hardware"
      delay={400}
      loading={loading && !hardware}
      wide
    >
      {!hardware ? (
        <div className="metric-skeleton" />
      ) : (
        <div className="hardware-grid">
          <section className="hardware-panel">
            <div className="metric-hero">
              <span className="metric-hero__value">
                {maxTemp != null ? formatTemperature(maxTemp, 0) : "—"}
              </span>
              <span className="metric-hero__unit">
                {hasSensors ? "peak sensor temperature" : "No temperature sensors"}
              </span>
            </div>

            {hasSensors ? (
              <>
                <Sparkline values={history} tone="hardware" label="Temperature trend" />
                <div className="sensor-list">
                  {hardware.sensors.slice(0, 6).map((sensor) => (
                    <div className="sensor-list__item" key={sensor.label}>
                      <span className="sensor-list__name">{truncateName(sensor.label, 24)}</span>
                      <span className="sensor-list__value">
                        {formatTemperature(sensor.temp_c)}
                        {sensor.critical_c != null
                          ? ` · crit ${formatTemperature(sensor.critical_c, 0)}`
                          : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <StatRow
                label="Sensors"
                value="Unavailable on this system"
              />
            )}
          </section>

          <section className="hardware-panel hardware-panel--battery">
            {battery?.present && battery.percent != null ? (
              <>
                <div className="metric-hero">
                  <span className="metric-hero__value">
                    {battery.percent.toFixed(0)}%
                  </span>
                  <span className="metric-hero__unit">
                    {formatBatteryState(battery.state)}
                  </span>
                </div>
                <ProgressBar
                  value={clampPercent(battery.percent)}
                  tone="hardware"
                />
                <StatRow
                  label="Time remaining"
                  value={batteryTimeLabel(
                    battery.state,
                    battery.time_to_full_secs,
                    battery.time_to_empty_secs,
                  )}
                />
                <StatRow
                  label="Health"
                  value={
                    battery.state === "full"
                      ? "Fully charged"
                      : battery.state === "empty"
                        ? "Empty"
                        : "Monitoring"
                  }
                />
              </>
            ) : (
              <>
                <div className="metric-hero">
                  <span className="metric-hero__value">N/A</span>
                  <span className="metric-hero__unit">No battery detected</span>
                </div>
                <StatRow label="Power source" value="Desktop / AC only" />
              </>
            )}
          </section>
        </div>
      )}
    </MetricCard>
  );
}
