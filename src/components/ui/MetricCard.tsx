import type { ReactNode } from "react";

type MetricCardProps = {
  title: string;
  subtitle?: string;
  accent: "cpu" | "ram" | "disk" | "network";
  delay?: number;
  loading?: boolean;
  children: ReactNode;
};

const accentStyles = {
  cpu: "metric-card--cpu",
  ram: "metric-card--ram",
  disk: "metric-card--disk",
  network: "metric-card--network",
} as const;

export function MetricCard({
  title,
  subtitle,
  accent,
  delay = 0,
  loading = false,
  children,
}: MetricCardProps) {
  return (
    <article
      className={`metric-card ${accentStyles[accent]}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="metric-card__glow" aria-hidden="true" />
      <header className="metric-card__header">
        <div>
          <p className="metric-card__eyebrow">{subtitle ?? "Live monitor"}</p>
          <h2 className="metric-card__title">{title}</h2>
        </div>
        <div className="metric-card__status">
          <span className={loading ? "metric-card__dot metric-card__dot--loading" : "metric-card__dot"} />
          {loading ? "Syncing" : "Active"}
        </div>
      </header>
      <div className="metric-card__body">{children}</div>
    </article>
  );
}
