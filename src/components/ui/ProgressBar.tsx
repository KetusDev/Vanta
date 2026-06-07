type ProgressBarProps = {
  value: number;
  label?: string;
  tone?: "cpu" | "ram" | "disk" | "network" | "hardware";
};

const toneClass = {
  cpu: "progress--cpu",
  ram: "progress--ram",
  disk: "progress--disk",
  network: "progress--network",
  hardware: "progress--hardware",
} as const;

export function ProgressBar({
  value,
  label,
  tone = "cpu",
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className="progress">
      {label ? (
        <div className="progress__meta">
          <span>{label}</span>
          <span>{clamped.toFixed(0)}%</span>
        </div>
      ) : null}
      <div className="progress__track">
        <div
          className={`progress__fill ${toneClass[tone]}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
