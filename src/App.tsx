import { CpuCard } from "./components/CpuCard";
import { RamCard } from "./components/RamCard";
import { DiskCard } from "./components/DiskCard";
import { NetworkCard } from "./components/NetworkCard";
import { HardwareCard } from "./components/HardwareCard";
import { SettingsPanel } from "./components/SettingsPanel";
import { SystemStats } from "./components/SystemStats";
import { MetricsProvider } from "./hooks/useMetrics";
import { SettingsProvider } from "./hooks/useSettings";

function App() {
  return (
    <SettingsProvider>
      <MetricsProvider>
        <div className="app-shell">
          <div className="ambient ambient--one" aria-hidden="true" />
          <div className="ambient ambient--two" aria-hidden="true" />
          <div className="ambient ambient--three" aria-hidden="true" />
          <div className="noise-overlay" aria-hidden="true" />

          <main className="dashboard">
            <header className="dashboard__header">
              <div>
                <p className="dashboard__eyebrow">System observatory</p>
                <h1 className="dashboard__title">Vanta</h1>
              </div>
              <div className="dashboard__meta">
                <p className="dashboard__caption">
                  Real-time hardware telemetry with 60-second rolling history.
                </p>
                <SystemStats />
                <SettingsPanel />
              </div>
            </header>

            <section className="metrics-grid">
              <CpuCard />
              <RamCard />
              <DiskCard />
              <NetworkCard />
            </section>

            <section className="metrics-grid metrics-grid--wide">
              <HardwareCard />
            </section>
          </main>
        </div>
      </MetricsProvider>
    </SettingsProvider>
  );
}

export default App;
