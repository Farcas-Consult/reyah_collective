'use client';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: string;
  subtitle?: string;
  colorScheme?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

export default function MetricCard({
  title,
  value,
  change,
  trend,
  icon,
  subtitle,
  colorScheme = 'blue',
}: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend === 'up') return '↗';
    if (trend === 'down') return '↘';
    return '→';
  };

  const getTrendColor = () => {
    if (!trend || !change) return 'text-gray-500';
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-500';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
          
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-sm font-semibold ${getTrendColor()}`}>
                {getTrendIcon()} {change > 0 ? '+' : ''}{change.toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500">vs last period</span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl border ${colorClasses[colorScheme]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
