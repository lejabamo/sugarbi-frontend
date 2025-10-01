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
  viewMode?: 'values' | 'percentage';
}

const Chart: React.FC<ChartProps> = ({ 
  type, 
  data, 
  options, 
  height = 300, 
  title,
  subtitle,
  viewMode = 'values'
}) => {
  // Paleta de colores equilibrada y profesional para SugarBI
  const colorPalette = [
    '#3b82f6', // Azul profesional - Producción principal
    '#10b981', // Verde esmeralda - Crecimiento/Éxito
    '#f59e0b', // Ámbar elegante - Energía/Actividad
    '#8b5cf6', // Púrpura sofisticado - Calidad
    '#06b6d4', // Cian profesional - Datos/Análisis
    '#ef4444', // Rojo corporativo - Alertas/Importante
    '#84cc16', // Verde lima suave - Frescura/Nuevo
    '#f97316', // Naranja cálido - Destacado
    '#6366f1', // Índigo moderno - Innovación
    '#14b8a6', // Teal elegante - Estabilidad
    '#ec4899', // Rosa corporativo - Especial/Único
    '#64748b', // Gris profesional - Neutral/Base
  ];

  // Paleta específica para métricas de calidad
  const qualityPalette = {
    tch: '#10b981',      // Verde esmeralda para TCH (productividad)
    brix: '#3b82f6',     // Azul profesional para Brix (calidad)
    sacarosa: '#f59e0b', // Ámbar elegante para Sacarosa (refinamiento)
    area: '#f97316',     // Naranja cálido para Área (cobertura)
    toneladas: '#06b6d4' // Cian profesional para Toneladas (volumen)
  };

  // Paleta para estados/estatus
  const statusPalette = {
    success: '#10b981',  // Verde claro para éxito
    warning: '#f59e0b',  // Amarillo para advertencia
    error: '#ef4444',    // Rojo claro para error
    info: '#3b82f6',     // Azul claro para información
    neutral: '#64748b'   // Gris claro para neutral
  };

  // Paleta para valores estadísticos (como en el chatbot)
  const statisticalPalette = {
    max: '#10b981',      // Verde esmeralda para máximo
    average: '#f59e0b',  // Ámbar elegante para promedio
    min: '#ef4444',      // Rojo corporativo para mínimo
    normal: '#3b82f6'    // Azul profesional para valores normales
  };

  // Convertir a porcentajes si es necesario
  const processDataForViewMode = (data: any) => {
    if (viewMode === 'percentage' && (type === 'doughnut' || type === 'pie')) {
      const total = data.datasets?.[0]?.data?.reduce((sum: number, value: number) => sum + value, 0) || 1;
      return {
        ...data,
        datasets: data.datasets?.map((dataset: any) => ({
          ...dataset,
          data: dataset.data?.map((value: number) => ((value / total) * 100).toFixed(1))
        }))
      };
    }
    return data;
  };

  const processedData = processDataForViewMode(data);

  // Función para obtener colores inteligentes basados en el contexto
  const getSmartColors = (data: any, datasetIndex: number) => {
    const labels = data.labels || [];
    const dataset = data.datasets?.[datasetIndex];
    const values = dataset?.data || [];
    
    // Para gráficos de calidad (donut/pie), usar paleta específica
    if ((type === 'doughnut' || type === 'pie') && labels.length <= 5) {
      const qualityColors = labels.map((label: string) => {
        const lowerLabel = label.toLowerCase();
        if (lowerLabel.includes('tch')) return qualityPalette.tch;
        if (lowerLabel.includes('brix')) return qualityPalette.brix;
        if (lowerLabel.includes('sacarosa')) return qualityPalette.sacarosa;
        if (lowerLabel.includes('área') || lowerLabel.includes('area')) return qualityPalette.area;
        if (lowerLabel.includes('tonelada')) return qualityPalette.toneladas;
        return colorPalette[labels.indexOf(label) % colorPalette.length];
      });
      
      return {
        backgroundColor: qualityColors,
        borderColor: qualityColors,
        borderWidth: 3,
        hoverBackgroundColor: qualityColors.map(color => color + 'CC'),
        hoverBorderColor: qualityColors,
        hoverBorderWidth: 4,
      };
    }
    
    // Para gráficos de barras, aplicar patrón estadístico (verde max, naranja prom, rojo min)
    if (type === 'bar' && values.length > 0) {
      const numericValues = values.filter((v: any) => typeof v === 'number' && !isNaN(v));
      if (numericValues.length > 0) {
        const maxValue = Math.max(...numericValues);
        const minValue = Math.min(...numericValues);
        const avgValue = numericValues.reduce((sum: number, val: number) => sum + val, 0) / numericValues.length;
        
        const statisticalColors = values.map((value: any) => {
          if (typeof value !== 'number' || isNaN(value)) return statisticalPalette.normal;
          
          if (value === maxValue) return statisticalPalette.max;      // Verde para máximo
          if (value === minValue) return statisticalPalette.min;      // Rojo para mínimo
          if (Math.abs(value - avgValue) < (maxValue - minValue) * 0.1) return statisticalPalette.average; // Naranja para promedio
          return statisticalPalette.normal; // Azul para valores normales
        });
        
        return {
          backgroundColor: statisticalColors,
          borderColor: statisticalColors,
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false,
          hoverBackgroundColor: statisticalColors.map(color => color + 'CC'),
          hoverBorderColor: statisticalColors,
          hoverBorderWidth: 3,
        };
      }
    }
    
    // Para líneas, usar colores sólidos con puntos destacados
    if (type === 'line') {
      const baseColor = colorPalette[datasetIndex % colorPalette.length];
      return {
        backgroundColor: baseColor + '20',
        borderColor: baseColor,
        borderWidth: 3,
        pointBackgroundColor: baseColor,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        fill: true,
        tension: 0.4,
      };
    }
    
    // Default: usar paleta general
    return {
      backgroundColor: colorPalette[datasetIndex % colorPalette.length] + '80',
      borderColor: colorPalette[datasetIndex % colorPalette.length],
      borderWidth: 2,
    };
  };

  // Aplicar paleta de colores inteligente a los datos
  const enhancedData = {
    ...processedData,
    datasets: processedData.datasets?.map((dataset: any, index: number) => ({
      ...dataset,
      ...getSmartColors(processedData, index),
    }))
  };

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart' as const,
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 13,
            family: 'Inter, sans-serif',
            weight: '500' as const,
          },
          color: '#374151',
          generateLabels: function(chart: any) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, index: number) => {
                const dataset = data.datasets[0];
                const value = dataset.data[index];
                const color = dataset.backgroundColor[index] || dataset.backgroundColor;
                
                return {
                  text: `${label}: ${typeof value === 'number' ? value.toLocaleString() : value}`,
                  fillStyle: color,
                  strokeStyle: color,
                  lineWidth: 2,
                  pointStyle: 'circle',
                  hidden: false,
                  index: index
                };
              });
            }
            return [];
          }
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
            
            // Formatear según el modo de vista
            if (viewMode === 'percentage' && (type === 'doughnut' || type === 'pie')) {
              return `${label}: ${value}%`;
            }
            
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
              return value.toLocaleString('es-CO');
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
        borderRadius: 6,
        borderSkipped: false,
      },
      line: {
        tension: 0.4,
        fill: false,
        borderCapStyle: 'round' as const,
        borderJoinStyle: 'round' as const,
      },
      point: {
        radius: 6,
        hoverRadius: 8,
        borderWidth: 2,
        hoverBorderWidth: 3,
      },
      arc: {
        borderWidth: 3,
        borderAlign: 'center' as const,
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
