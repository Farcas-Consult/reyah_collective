'use client';

import { ChartData } from '@/types/analytics';

interface LineChartProps {
  data: ChartData;
  height?: number;
  showGrid?: boolean;
}

export default function LineChart({ data, height = 300, showGrid = true }: LineChartProps) {
  if (!data.datasets.length || !data.labels.length) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.datasets.flatMap(d => d.data));
  const minValue = Math.min(...data.datasets.flatMap(d => d.data));
  const valueRange = maxValue - minValue;
  const padding = valueRange * 0.1;

  const chartHeight = height - 60; // Reserve space for labels
  const chartWidth = 100; // percentage

  const getYPosition = (value: number): number => {
    const range = maxValue + padding - (minValue - padding);
    const normalized = (value - (minValue - padding)) / range;
    return chartHeight - (normalized * chartHeight);
  };

  const formatValue = (value: number): string => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toFixed(0);
  };

  // Calculate Y-axis labels
  const yAxisSteps = 5;
  const yAxisLabels = Array.from({ length: yAxisSteps }, (_, i) => {
    const value = minValue + (valueRange / (yAxisSteps - 1)) * i;
    return { value, label: formatValue(value) };
  }).reverse();

  return (
    <div className="w-full">
      <div className="flex" style={{ height: height + 40 }}>
        {/* Y-axis labels */}
        <div className="flex flex-col justify-between pr-2 text-xs text-gray-600 w-12">
          {yAxisLabels.map((label, i) => (
            <span key={i}>{label.label}</span>
          ))}
        </div>

        {/* Chart area */}
        <div className="flex-1 relative">
          <svg
            width="100%"
            height={height}
            className="overflow-visible"
            viewBox={`0 0 ${chartWidth} ${height}`}
            preserveAspectRatio="none"
          >
            {/* Grid lines */}
            {showGrid && yAxisLabels.map((label, i) => (
              <line
                key={`grid-${i}`}
                x1="0"
                y1={getYPosition(label.value)}
                x2={chartWidth}
                y2={getYPosition(label.value)}
                stroke="#e5e7eb"
                strokeWidth="0.2"
              />
            ))}

            {/* Data lines */}
            {data.datasets.map((dataset, datasetIndex) => {
              const points = dataset.data.map((value, i) => {
                const x = (i / (data.labels.length - 1)) * chartWidth;
                const y = getYPosition(value);
                return `${x},${y}`;
              }).join(' ');

              const pathD = `M ${points.split(' ').join(' L ')}`;
              
              // Area fill
              const areaD = dataset.fill
                ? `${pathD} L ${chartWidth},${chartHeight} L 0,${chartHeight} Z`
                : '';

              return (
                <g key={datasetIndex}>
                  {dataset.fill && areaD && (
                    <path
                      d={areaD}
                      fill={
                        Array.isArray(dataset.backgroundColor)
                          ? dataset.backgroundColor[0]
                          : dataset.backgroundColor || 'rgba(59, 130, 246, 0.1)'
                      }
                      stroke="none"
                    />
                  )}
                  <polyline
                    points={points}
                    fill="none"
                    stroke={dataset.borderColor || '#3b82f6'}
                    strokeWidth={dataset.borderWidth || 2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Data points */}
                  {dataset.data.map((value, i) => {
                    const x = (i / (data.labels.length - 1)) * chartWidth;
                    const y = getYPosition(value);
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="0.8"
                        fill={dataset.borderColor || '#3b82f6'}
                      />
                    );
                  })}
                </g>
              );
            })}
          </svg>

          {/* X-axis labels */}
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            {data.labels.map((label, i) => (
              <span key={i} className="text-center" style={{ width: `${100 / data.labels.length}%` }}>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 justify-center">
        {data.datasets.map((dataset, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: dataset.borderColor || '#3b82f6' }}
            />
            <span className="text-sm text-gray-700">{dataset.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
