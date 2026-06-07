import { useNetworkMetrics } from "../hooks/useMetrics";

export function NetworkCard(){
    const network = useNetworkMetrics();
    if (!network) return <div>Loading...</div>;
    return (
        <div>
            <h2>Network</h2>
            <p>Download: {network.download_kbps.toFixed(1)} KB/s</p>
            <p>Upload: {network.upload_kbps.toFixed(1)} KB/s</p>
        </div>
    );
}
