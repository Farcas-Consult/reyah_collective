'use client';

import { ChartData } from '@/types/analytics';

interface BarChartProps {
  data: ChartData;
  height?: number;
  showValues?: boolean;
  horizontal?: boolean;
}

export default function BarChart({ data, height = 300, showValues = false, horizontal = false }: BarChartProps) {
  if (!data.datasets.length || !data.labels.length) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.datasets.flatMap(d => d.data));
  const formatValue = (value: number): string => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toFixed(0);
  };

  if (horizontal) {
    return (
      <div className="w-full">
        <div className="space-y-4">
          {data.labels.map((label, i) => {
            const value = data.datasets[0].data[i];
            const percentage = (value / maxValue) * 100;
            const bgColor = Array.isArray(data.datasets[0].backgroundColor)
              ? data.datasets[0].backgroundColor[i]
              : data.datasets[0].backgroundColor || 'rgba(59, 130, 246, 0.7)';

            return (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                  {showValues && (
                    <span className="text-sm text-gray-600">{formatValue(value)}</span>
                  )}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                  <div
                    className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: bgColor,
                    }}
                  >
                    {percentage > 15 && (
                      <span className="text-xs font-semibold text-white">
                        {percentage.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-end justify-between gap-2" style={{ height }}>
        {data.labels.map((label, i) => {
          const value = data.datasets[0].data[i];
          const percentage = (value / maxValue) * 100;
          const bgColor = Array.isArray(data.datasets[0].backgroundColor)
            ? data.datasets[0].backgroundColor[i]
            : data.datasets[0].backgroundColor || 'rgba(59, 130, 246, 0.7)';

          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full relative flex items-end justify-center" style={{ height: height - 40 }}>
                {showValues && value > 0 && (
                  <span className="absolute -top-6 text-xs font-semibold text-gray-700">
                    {formatValue(value)}
                  </span>
                )}
                <div
                  className="w-full rounded-t-lg transition-all duration-500 hover:opacity-80"
                  style={{
                    height: `${percentage}%`,
                    backgroundColor: bgColor,
                    minHeight: value > 0 ? '2px' : '0',
                  }}
                />
              </div>
              <span className="text-xs text-gray-600 text-center">{label}</span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      {data.datasets.length > 0 && data.datasets[0].label && (
        <div className="flex justify-center mt-4">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{
                backgroundColor: Array.isArray(data.datasets[0].backgroundColor)
                  ? data.datasets[0].backgroundColor[0]
                  : data.datasets[0].backgroundColor || 'rgba(59, 130, 246, 0.7)',
              }}
            />
            <span className="text-sm text-gray-700">{data.datasets[0].label}</span>
          </div>
        </div>
      )}
    </div>
  );
}
