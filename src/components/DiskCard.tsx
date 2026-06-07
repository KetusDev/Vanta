import { useDiskMetrics } from "../hooks/useMetrics";

export function DiskCard(){
    const disk = useDiskMetrics();
    if (!disk) return <div>Loading...</div>;
    return (
        <div>
            <h2>Disk</h2>
            {disk.disks.map((entry) => (
                <p key={entry.name}>
                    {entry.name}: {entry.used_gb.toFixed(1)} / {entry.total_gb.toFixed(1)} GB
                </p>
            ))}
            <p>Total: {disk.total_gb.toFixed(1)} GB</p>
            <p>Used: {disk.used_gb.toFixed(1)} GB</p>
        </div>
    );
}
