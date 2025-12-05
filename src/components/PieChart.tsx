'use client';

import { ChartData } from '@/types/analytics';

interface PieChartProps {
  data: ChartData;
  size?: number;
  showLabels?: boolean;
  showPercentages?: boolean;
}

export default function PieChart({ data, size = 200, showLabels = true, showPercentages = true }: PieChartProps) {
  if (!data.datasets.length || !data.labels.length) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const values = data.datasets[0].data;
  const total = values.reduce((sum, val) => sum + val, 0);
  const colors = Array.isArray(data.datasets[0].backgroundColor)
    ? data.datasets[0].backgroundColor
    : [
        'rgba(59, 130, 246, 0.7)',
        'rgba(16, 185, 129, 0.7)',
        'rgba(245, 158, 11, 0.7)',
        'rgba(239, 68, 68, 0.7)',
        'rgba(139, 92, 246, 0.7)',
      ];

  let currentAngle = -90; // Start from top

  const slices = values.map((value, i) => {
    const percentage = (value / total) * 100;
    const angle = (value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    
    currentAngle = endAngle;

    // Calculate path for the slice
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const radius = size / 2;
    const centerX = size / 2;
    const centerY = size / 2;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z',
    ].join(' ');

    // Calculate label position
    const labelAngle = startAngle + angle / 2;
    const labelRad = (labelAngle * Math.PI) / 180;
    const labelDistance = radius * 0.7;
    const labelX = centerX + labelDistance * Math.cos(labelRad);
    const labelY = centerY + labelDistance * Math.sin(labelRad);

    return {
      path: pathData,
      color: colors[i % colors.length],
      percentage,
      labelX,
      labelY,
      label: data.labels[i],
      value,
    };
  });

  const formatValue = (value: number): string => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toFixed(0);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <svg width={size} height={size} className="transform hover:scale-105 transition-transform">
          {slices.map((slice, i) => (
            <g key={i}>
              <path
                d={slice.path}
                fill={slice.color}
                stroke="white"
                strokeWidth="2"
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
              {showPercentages && slice.percentage > 5 && (
                <text
                  x={slice.labelX}
                  y={slice.labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs font-semibold fill-white pointer-events-none"
                >
                  {slice.percentage.toFixed(1)}%
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>

      {showLabels && (
        <div className="grid grid-cols-2 gap-3 w-full max-w-md">
          {slices.map((slice, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded flex-shrink-0"
                style={{ backgroundColor: slice.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">{slice.label}</p>
                <p className="text-xs text-gray-500">
                  {formatValue(slice.value)} ({slice.percentage.toFixed(1)}%)
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
