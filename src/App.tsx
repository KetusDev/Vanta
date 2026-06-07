import { CpuCard } from "./components/CpuCard";
import { RamCard } from "./components/RamCard";
import { DiskCard } from "./components/DiskCard";
import { NetworkCard } from "./components/NetworkCard";

function App() {
  return (
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
          <p className="dashboard__caption">
            Real-time hardware telemetry in a compact desktop surface.
          </p>
        </header>

        <section className="metrics-grid">
          <CpuCard />
          <RamCard />
          <DiskCard />
          <NetworkCard />
        </section>
      </main>
    </div>
  );
}

export default App;
