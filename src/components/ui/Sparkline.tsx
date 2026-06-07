import { historyMax } from "../../lib/history";

type SparklineProps = {
  values: number[];
  tone?: "cpu" | "ram" | "disk" | "network" | "network-up" | "hardware";
  label?: string;
  height?: number;
};

const toneClass = {
  cpu: "sparkline--cpu",
  ram: "sparkline--ram",
  disk: "sparkline--disk",
  network: "sparkline--network",
  "network-up": "sparkline--network-up",
  hardware: "sparkline--hardware",
} as const;

function buildPath(values: number[], width: number, height: number): string {
  if (values.length === 0) {
    return "";
  }

  const max = historyMax(values);
  const step = values.length > 1 ? width / (values.length - 1) : width;

  return values
    .map((value, index) => {
      const x = index * step;
      const normalized = value / max;
      const y = height - normalized * (height - 4) - 2;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function buildAreaPath(values: number[], width: number, height: number): string {
  const line = buildPath(values, width, height);
  if (!line) {
    return "";
  }
  return `${line} L ${width} ${height} L 0 ${height} Z`;
}

export function Sparkline({
  values,
  tone = "cpu",
  label = "Last 60 seconds",
  height = 56,
}: SparklineProps) {
  const width = 280;
  const path = buildPath(values, width, height);
  const area = buildAreaPath(values, width, height);

  return (
    <div className="sparkline">
      <div className="sparkline__meta">
        <span>{label}</span>
        <span>{values.length}s</span>
      </div>
      <svg
        className={`sparkline__chart ${toneClass[tone]}`}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {area ? <path className="sparkline__area" d={area} /> : null}
        {path ? <path className="sparkline__line" d={path} /> : null}
      </svg>
    </div>
  );
}
