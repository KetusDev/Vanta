import { CpuCard } from "./components/CpuCard";
import { RamCard } from "./components/RamCard";
import { DiskCard } from "./components/DiskCard";
import { NetworkCard } from "./components/NetworkCard";


function App() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <CpuCard />
      <RamCard />
      <DiskCard />
      <NetworkCard />
    </div>
  );
}

export default App;
