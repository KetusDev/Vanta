type StatRowProps = {
  label: string;
  value: string;
  emphasis?: boolean;
};

export function StatRow({ label, value, emphasis = false }: StatRowProps) {
  return (
    <div className={`stat-row ${emphasis ? "stat-row--emphasis" : ""}`}>
      <span className="stat-row__label">{label}</span>
      <span className="stat-row__value">{value}</span>
    </div>
  );
}
