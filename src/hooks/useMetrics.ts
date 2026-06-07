import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { CpuMetrics, DiskMetrics, NetworkMetrics, RamMetrics} from "../types/metrics";

export function useCpuMetrics(){
    const [data, setData] = useState<CpuMetrics | null>(null);

    useEffect(()=>{
        const interval = setInterval(async ()=>{
            const metrics = await invoke<CpuMetrics>("get_cpu");
            setData(metrics);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return data;
}

export function useRamMetrics(){
    const [data, setData] = useState<RamMetrics | null>(null);

    useEffect(()=>{
        const interval = setInterval(async()=>{
            const metrics = await invoke<RamMetrics>("get_ram");
            setData(metrics);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return data;
}

export function useDiskMetrics(){
    const [data, setData] = useState<DiskMetrics | null>(null);
    useEffect(()=>{
        const interval = setInterval(async()=>{
            const metrics = await invoke<DiskMetrics>("get_disk");
            setData(metrics);
        }, 1000);
        return () => clearInterval(interval);
    }, []);
    return data;
}

export function useNetworkMetrics(){
    const [data, setData] = useState<NetworkMetrics | null>(null);
    useEffect(()=>{
        const interval = setInterval(async()=>{
            const metrics = await invoke<NetworkMetrics>("get_network");
            setData(metrics);
        }, 1000);
        return () => clearInterval(interval);
    }, []);
    return data;
}