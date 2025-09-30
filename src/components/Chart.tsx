import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

interface ChartProps {
  type: 'bar' | 'line' | 'pie' | 'doughnut';
  data: any;
  options?: any;
  height?: number;
  title?: string;
  subtitle?: string;
}

const Chart: React.FC<ChartProps> = ({ 
  type, 
  data, 
  options, 
  height = 300, 
  title,
  subtitle 
}) => {
  // Paleta de colores profesional y accesible
  const colorPalette = [
    '#3b82f6', // Blue
    '#22c55e', // Green
    '#f97316', // Orange
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#eab308', // Yellow
    '#ef4444', // Red
    '#6366f1', // Indigo
    '#10b981', // Emerald
  ];

  // Aplicar paleta de colores a los datos
  const enhancedData = {
    ...data,
    datasets: data.datasets?.map((dataset: any, index: number) => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || (
        type === 'doughnut' || type === 'pie' 
          ? colorPalette.slice(0, data.labels?.length || 1)
          : colorPalette[index % colorPalette.length] + '80' // 50% opacity
      ),
      borderColor: dataset.borderColor || (
        type === 'doughnut' || type === 'pie'
          ? colorPalette.slice(0, data.labels?.length || 1)
          : colorPalette[index % colorPalette.length]
      ),
      borderWidth: dataset.borderWidth || 2,
      borderRadius: dataset.borderRadius || (type === 'bar' ? 4 : 0),
      borderSkipped: false,
    }))
  };

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            family: 'Inter, sans-serif',
          },
          color: '#374151',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#f9fafb',
        bodyColor: '#f9fafb',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        titleFont: {
          size: 13,
          weight: '600' as const,
          family: 'Inter, sans-serif',
        },
        bodyFont: {
          size: 12,
          family: 'Inter, sans-serif',
        },
        padding: 12,
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y || context.parsed;
            
            // Formatear números grandes
            if (typeof value === 'number') {
              if (value >= 1000000) {
                return `${label}: ${(value / 1000000).toFixed(1)}M`;
              } else if (value >= 1000) {
                return `${label}: ${(value / 1000).toFixed(1)}K`;
              }
              return `${label}: ${value.toLocaleString('es-CO')}`;
            }
            return `${label}: ${value}`;
          }
        }
      },
    },
    scales: type === 'bar' || type === 'line' ? {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
            family: 'Inter, sans-serif',
          },
          color: '#6b7280',
          maxRotation: 45,
        },
        border: {
          display: false,
        },
      },
      y: {
        grid: {
          color: '#f3f4f6',
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 11,
            family: 'Inter, sans-serif',
          },
          color: '#6b7280',
          callback: function(value: any) {
            if (typeof value === 'number') {
              if (value >= 1000000) {
                return (value / 1000000).toFixed(1) + 'M';
              } else if (value >= 1000) {
                return (value / 1000).toFixed(1) + 'K';
              }
            }
            return value;
          }
        },
        border: {
          display: false,
        },
      },
    } : {},
    elements: {
      bar: {
        borderRadius: 4,
      },
      line: {
        tension: 0.4,
        fill: false,
      },
      point: {
        radius: 4,
        hoverRadius: 6,
        borderWidth: 2,
      },
    },
    ...options,
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return <Bar data={enhancedData} options={defaultOptions} />;
      case 'line':
        return <Line data={enhancedData} options={defaultOptions} />;
      case 'pie':
        return <Pie data={enhancedData} options={defaultOptions} />;
      case 'doughnut':
        return <Doughnut data={enhancedData} options={defaultOptions} />;
      default:
        return <Bar data={enhancedData} options={defaultOptions} />;
    }
  };

  return (
    <div className="w-full">
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-h5 text-gray-900 mb-1">{title}</h3>
          )}
          {subtitle && (
            <p className="text-body-sm text-gray-600">{subtitle}</p>
          )}
        </div>
      )}
      <div style={{ height: `${height}px` }} className="relative">
        {renderChart()}
      </div>
    </div>
  );
};

export default Chart;
