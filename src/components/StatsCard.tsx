import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info';
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  format?: 'number' | 'currency' | 'percentage';
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon, 
  color, 
  subtitle,
  trend,
  format = 'number'
}) => {
  const colorClasses = {
    primary: {
      bg: 'bg-primary-50',
      text: 'text-primary-600',
      border: 'border-primary-200',
      icon: 'bg-primary-100'
    },
    secondary: {
      bg: 'bg-secondary-50',
      text: 'text-secondary-600',
      border: 'border-secondary-200',
      icon: 'bg-secondary-100'
    },
    accent: {
      bg: 'bg-accent-50',
      text: 'text-accent-600',
      border: 'border-accent-200',
      icon: 'bg-accent-100'
    },
    success: {
      bg: 'bg-success-50',
      text: 'text-success-600',
      border: 'border-success-200',
      icon: 'bg-success-100'
    },
    warning: {
      bg: 'bg-warning-50',
      text: 'text-warning-600',
      border: 'border-warning-200',
      icon: 'bg-warning-100'
    },
    error: {
      bg: 'bg-error-50',
      text: 'text-error-600',
      border: 'border-error-200',
      icon: 'bg-error-100'
    },
    info: {
      bg: 'bg-info-50',
      text: 'text-info-600',
      border: 'border-info-200',
      icon: 'bg-info-100'
    }
  };

  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(val);
      case 'percentage':
        return `${val}%`;
      case 'number':
      default:
        return new Intl.NumberFormat('es-CO').format(val);
    }
  };

  const colors = colorClasses[color];

  return (
    <div className={`bg-white rounded-lg border-l-4 ${colors.border} hover:shadow-sm transition-all duration-200`}>
      <div className="p-3">
        <div className="flex items-center">
          <div className={`p-1.5 rounded ${colors.icon} mr-2`}>
            <span className={`text-sm ${colors.text}`}>{icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-600 truncate">{title}</p>
            <p className={`text-lg font-bold ${colors.text}`}>
              {formatValue(value)}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-500 truncate">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center mt-1">
                <span className={`text-xs font-medium ${
                  trend.isPositive ? 'text-success-600' : 'text-error-600'
                }`}>
                  {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
