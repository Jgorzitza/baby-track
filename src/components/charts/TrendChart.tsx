import type { TrendSeries } from '../../lib/trends';

const toneColors: Record<TrendSeries['tone'], { stroke: string; fill: string; accent: string }> = {
  primary: { stroke: '#4263eb', fill: 'rgba(66, 99, 235, 0.18)', accent: '#eef2ff' },
  success: { stroke: '#2f9e44', fill: 'rgba(47, 158, 68, 0.18)', accent: '#ebfbee' },
  warning: { stroke: '#f08c00', fill: 'rgba(240, 140, 0, 0.18)', accent: '#fff4e6' },
  danger: { stroke: '#e03131', fill: 'rgba(224, 49, 49, 0.18)', accent: '#fff5f5' },
};

const formatMetricValue = (value: number, unitLabel: string): string =>
  unitLabel === 'sessions' || unitLabel === 'feeds' || unitLabel === 'changes' || unitLabel === 'doses' || unitLabel === 'symptoms' || unitLabel === 'events'
    ? `${Math.round(value)}`
    : `${Number.isInteger(value) ? value : value.toFixed(1)} ${unitLabel}`;

export const TrendChart = ({ series }: { series: TrendSeries }) => {
  if (series.points.length === 0 || series.totalValue === 0 && series.kind === 'bar') {
    return (
      <div className="card" style={{ marginBottom: 0 }}>
        <div className="font-bold">{series.title}</div>
        <p className="text-xs text-muted" style={{ marginTop: '0.5rem', marginBottom: 0 }}>
          {series.emptyMessage}
        </p>
      </div>
    );
  }

  const colors = toneColors[series.tone];
  const width = 320;
  const height = 132;
  const paddingX = 14;
  const paddingTop = 16;
  const paddingBottom = 28;
  const graphHeight = height - paddingTop - paddingBottom;
  const graphWidth = width - paddingX * 2;
  const maxValue = Math.max(...series.points.map((point) => point.value), 1);

  const pathPoints = series.points.map((point, index) => {
    const x = paddingX + (graphWidth / Math.max(series.points.length - 1, 1)) * index;
    const y = paddingTop + graphHeight - (point.value / maxValue) * graphHeight;
    return { x, y, point };
  });

  const linePath = pathPoints.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  const areaPath = `${linePath} L ${pathPoints[pathPoints.length - 1]?.x ?? paddingX} ${paddingTop + graphHeight} L ${pathPoints[0]?.x ?? paddingX} ${paddingTop + graphHeight} Z`;
  const barWidth = graphWidth / Math.max(series.points.length, 1) - 8;

  return (
    <div className="card" style={{ marginBottom: 0 }}>
      <div className="flex-row space-between" style={{ alignItems: 'flex-start', gap: '0.75rem' }}>
        <div>
          <div className="font-bold">{series.title}</div>
          <div className="text-xs text-muted">{series.subtitle}</div>
        </div>
        <div
          className="text-xs font-bold"
          style={{
            backgroundColor: colors.accent,
            color: colors.stroke,
            borderRadius: '999px',
            padding: '0.375rem 0.625rem',
          }}
        >
          Peak {formatMetricValue(series.peakValue, series.unitLabel)}
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 164, marginTop: '0.875rem', display: 'block' }} aria-label={series.title}>
        <line x1={paddingX} y1={paddingTop + graphHeight} x2={width - paddingX} y2={paddingTop + graphHeight} stroke="var(--border)" strokeWidth="1" />
        {series.kind === 'line' ? (
          <>
            <path d={areaPath} fill={colors.fill} />
            <path d={linePath} fill="none" stroke={colors.stroke} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
            {pathPoints.map(({ x, y, point }) => (
              <g key={point.isoDate}>
                <circle cx={x} cy={y} r="4" fill={colors.stroke} />
                <text x={x} y={height - 8} textAnchor="middle" fontSize="10" fill="var(--text-muted)">
                  {point.shortLabel}
                </text>
              </g>
            ))}
          </>
        ) : (
          series.points.map((point, index) => {
            const x = paddingX + index * (graphWidth / Math.max(series.points.length, 1)) + 4;
            const barHeight = (point.value / maxValue) * graphHeight;
            const y = paddingTop + graphHeight - barHeight;
            return (
              <g key={point.isoDate}>
                <rect x={x} y={y} width={Math.max(barWidth, 10)} height={Math.max(barHeight, 2)} rx="6" fill={colors.stroke} opacity={point.value === 0 ? 0.2 : 0.9} />
                <text x={x + Math.max(barWidth, 10) / 2} y={height - 8} textAnchor="middle" fontSize="10" fill="var(--text-muted)">
                  {point.shortLabel}
                </text>
              </g>
            );
          })
        )}
      </svg>

      <div className="grid-2" style={{ marginTop: '0.75rem' }}>
        <div className="card" style={{ marginBottom: 0, backgroundColor: 'var(--bg-secondary)', padding: '0.875rem' }}>
          <div className="text-xs text-muted">Latest</div>
          <div className="font-bold">{series.latestValue === null ? '--' : formatMetricValue(series.latestValue, series.unitLabel)}</div>
        </div>
        <div className="card" style={{ marginBottom: 0, backgroundColor: 'var(--bg-secondary)', padding: '0.875rem' }}>
          <div className="text-xs text-muted">Average</div>
          <div className="font-bold">{formatMetricValue(series.averageValue, series.unitLabel)}</div>
        </div>
      </div>
    </div>
  );
};
