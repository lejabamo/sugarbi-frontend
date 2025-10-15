import React from 'react';
import { colors } from '../styles/colors';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon, 
  color, 
  subtitle,
  trend
}) => {
  const colorConfig = {
    blue: {
      bg: colors.qualitative.primary,
      bgLight: colors.sequential.blue[50],
      text: colors.sequential.blue[700],
      icon: colors.sequential.blue[600],
    },
    green: {
      bg: colors.qualitative.success,
      bgLight: colors.sequential.green[50],
      text: colors.sequential.green[700],
      icon: colors.sequential.green[600],
    },
    purple: {
      bg: colors.qualitative.purple,
      bgLight: colors.sequential.purple[50],
      text: colors.sequential.purple[700],
      icon: colors.sequential.purple[600],
    },
    orange: {
      bg: colors.qualitative.warning,
      bgLight: colors.sequential.orange[50],
      text: colors.sequential.orange[700],
      icon: colors.sequential.orange[600],
    },
    red: {
      bg: colors.qualitative.danger,
      bgLight: '#fef2f2',
      text: '#991b1b',
      icon: colors.qualitative.danger,
    },
  };

  const config = colorConfig[color];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div 
            className="p-3 rounded-xl"
            style={{ backgroundColor: config.bgLight }}
          >
            <div style={{ color: config.icon }}>
              {icon}
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p 
              className="text-2xl font-bold"
              style={{ color: config.text }}
            >
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        {trend && (
          <div className="text-right">
            <div className={`flex items-center text-sm font-medium ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              <span className="mr-1">
                {trend.isPositive ? '↗' : '↘'}
              </span>
              {Math.abs(trend.value)}%
            </div>
            <p className="text-xs text-gray-500">vs anterior</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
