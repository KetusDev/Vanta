import { CpuCard } from "./components/CpuCard";
import { RamCard } from "./components/RamCard";
import { DiskCard } from "./components/DiskCard";


function App() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <CpuCard />
      <RamCard />
      <DiskCard />
    </div>
  );
}

export default App;
