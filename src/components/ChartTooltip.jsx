export function PieChartTooltip({ active, payload }) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0];

  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{item.name}</p>
      <p className="chart-tooltip-value">{item.value} emails</p>
    </div>
  );
}
