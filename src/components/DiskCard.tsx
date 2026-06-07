import { useDiskMetrics } from "../hooks/useMetrics";
import { clampPercent, formatGigabytes } from "../lib/format";
import { MetricCard } from "./ui/MetricCard";
import { ProgressBar } from "./ui/ProgressBar";
import { StatRow } from "./ui/StatRow";

export function DiskCard() {
  const disk = useDiskMetrics();

  return (
    <MetricCard
      title="Storage"
      subtitle="Mounted volumes"
      accent="disk"
      delay={240}
      loading={!disk}
    >
      {!disk ? (
        <div className="metric-skeleton" />
      ) : (
        <>
          <div className="metric-hero">
            <span className="metric-hero__value">{formatGigabytes(disk.used_gb, 0)}</span>
            <span className="metric-hero__unit">used across drives</span>
          </div>

          <div className="disk-list">
            {disk.disks.map((entry) => {
              const usage = clampPercent((entry.used_gb / entry.total_gb) * 100);
              return (
                <div className="disk-list__item" key={entry.name}>
                  <div className="disk-list__meta">
                    <span className="disk-list__name">{entry.name || "Drive"}</span>
                    <span className="disk-list__value">
                      {formatGigabytes(entry.used_gb)} / {formatGigabytes(entry.total_gb)}
                    </span>
                  </div>
                  <ProgressBar value={usage} tone="disk" />
                </div>
              );
            })}
          </div>

          <StatRow
            label="Combined total"
            value={formatGigabytes(disk.total_gb)}
            emphasis
          />
        </>
      )}
    </MetricCard>
  );
}
