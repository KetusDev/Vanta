import { invoke } from "@tauri-apps/api/core";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { checkMetricAlerts } from "../lib/alerts";
import { appendHistory } from "../lib/history";
import { useSettings } from "./useSettings";
import type { AllMetrics, MetricsHistory } from "../types/metrics";

type MetricsContextValue = {
  metrics: AllMetrics | null;
  history: MetricsHistory;
  loading: boolean;
};

const emptyHistory: MetricsHistory = {
  cpu: [],
  ram: [],
  disk: [],
  download: [],
  upload: [],
};

const MetricsContext = createContext<MetricsContextValue>({
  metrics: null,
  history: emptyHistory,
  loading: true,
});

export function MetricsProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const [metrics, setMetrics] = useState<AllMetrics | null>(null);
  const [history, setHistory] = useState<MetricsHistory>(emptyHistory);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const tick = async () => {
      try {
        const next = await invoke<AllMetrics>("get_all_metrics");
        if (!active) {
          return;
        }

        setMetrics(next);
        setHistory((prev) => ({
          cpu: appendHistory(prev.cpu, next.cpu.overall),
          ram: appendHistory(
            prev.ram,
            next.ram.total_mb > 0
              ? (next.ram.used_mb / next.ram.total_mb) * 100
              : 0,
          ),
          disk: appendHistory(
            prev.disk,
            next.disk.total_gb > 0
              ? (next.disk.used_gb / next.disk.total_gb) * 100
              : 0,
          ),
          download: appendHistory(prev.download, next.network.download_kbps),
          upload: appendHistory(prev.upload, next.network.upload_kbps),
        }));
        setLoading(false);

        void checkMetricAlerts(next, {
          enabled: settings.alertsEnabled,
          cpuThreshold: settings.cpuAlertThreshold,
          ramThreshold: settings.ramAlertThreshold,
          diskThreshold: settings.diskAlertThreshold,
        });
      } catch (error) {
        console.error("Failed to fetch metrics", error);
      }
    };

    tick();
    const interval = setInterval(tick, settings.pollIntervalMs);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [
    settings.pollIntervalMs,
    settings.alertsEnabled,
    settings.cpuAlertThreshold,
    settings.ramAlertThreshold,
    settings.diskAlertThreshold,
  ]);

  return (
    <MetricsContext.Provider value={{ metrics, history, loading }}>
      {children}
    </MetricsContext.Provider>
  );
}

export function useMetrics() {
  return useContext(MetricsContext);
}

export function useCpuMetrics() {
  const { metrics, history, loading } = useMetrics();
  return {
    data: metrics?.cpu ?? null,
    history: history.cpu,
    loading,
  };
}

export function useRamMetrics() {
  const { metrics, history, loading } = useMetrics();
  return {
    data: metrics?.ram ?? null,
    history: history.ram,
    loading,
  };
}

export function useDiskMetrics() {
  const { metrics, history, loading } = useMetrics();
  return {
    data: metrics?.disk ?? null,
    history: history.disk,
    loading,
  };
}

export function useNetworkMetrics() {
  const { metrics, history, loading } = useMetrics();
  return {
    data: metrics?.network ?? null,
    history: history,
    loading,
  };
}
