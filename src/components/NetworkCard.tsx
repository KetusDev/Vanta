import { useNetworkMetrics } from "../hooks/useMetrics";
import { formatSpeed } from "../lib/format";
import { MetricCard } from "./ui/MetricCard";
import { StatRow } from "./ui/StatRow";

export function NetworkCard() {
  const network = useNetworkMetrics();

  return (
    <MetricCard
      title="Network"
      subtitle="Throughput"
      accent="network"
      delay={320}
      loading={!network}
    >
      {!network ? (
        <div className="metric-skeleton" />
      ) : (
        <>
          <div className="network-grid">
            <div className="network-stat network-stat--down">
              <span className="network-stat__label">Download</span>
              <span className="network-stat__value">
                {formatSpeed(network.download_kbps)}
              </span>
            </div>
            <div className="network-stat network-stat--up">
              <span className="network-stat__label">Upload</span>
              <span className="network-stat__value">
                {formatSpeed(network.upload_kbps)}
              </span>
            </div>
          </div>
          <StatRow label="Sample window" value="1 second" />
          <StatRow
            label="Combined"
            value={formatSpeed(network.download_kbps + network.upload_kbps)}
            emphasis
          />
        </>
      )}
    </MetricCard>
  );
}
