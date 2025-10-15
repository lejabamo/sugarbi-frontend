import React, { useState } from 'react';
import type { ChatMessage as ChatMessageType } from '../types';
import Chart from './Chart';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.type === 'user';
  const [showSQL, setShowSQL] = useState(false);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-2xl px-4 py-2 rounded-lg ${
        isUser 
          ? 'bg-primary-600 text-white' 
          : 'bg-gray-100 text-gray-900'
      }`}>
        {/* Contenido del mensaje */}
        {isUser ? (
          <p className="text-sm">{message.content}</p>
        ) : (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg mb-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-800 font-medium leading-relaxed">
                  {message.content}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Error message */}
        {message.error && (
          <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-xs">
            <strong>Error:</strong> {message.error}
          </div>
        )}
        
        {/* Visualización */}
        {message.visualization && message.raw_data && (
          <div className="mt-6">
            <div className="bg-white rounded-xl border shadow-lg overflow-hidden">
              {/* Título de la gráfica separado */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  {message.visualization.title || 'Análisis de Datos'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {message.raw_data.length} {message.raw_data.length === 1 ? 'resultado' : 'resultados'} encontrados
                </p>
              </div>
              
              {/* Contenedor de la gráfica con mejor aprovechamiento del espacio */}
              <div className="p-6">
                <div className="h-[500px] w-full">
                  <Chart
                    type={message.visualization.type || 'bar'}
                    data={transformDataForChart(message.raw_data, message.visualization)}
                    options={getChartOptions(message.visualization)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* SQL Query */}
        {message.sql && (
          <div className="mt-3">
            <button
              onClick={() => setShowSQL(!showSQL)}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              {showSQL ? 'Ocultar' : 'Ver'} SQL
            </button>
            {showSQL && (
              <div className="mt-2 p-2 bg-gray-800 text-green-400 rounded text-xs font-mono overflow-x-auto">
                <pre>{message.sql}</pre>
              </div>
            )}
          </div>
        )}
        
        {/* Timestamp */}
        <p className={`text-xs mt-1 ${
          isUser ? 'text-primary-100' : 'text-gray-500'
        }`}>
          {message.timestamp.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

// Función para transformar datos del chatbot a formato de Chart.js
const transformDataForChart = (rawData: any[], visualization: any) => {
  if (!rawData || rawData.length === 0) {
    return {
      labels: ['Sin datos'],
      datasets: [{
        label: 'Datos',
        data: [0],
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
        borderWidth: 1
      }]
    };
  }

  // Determinar las columnas para labels y datos
  const labelColumn = getLabelColumn(rawData[0], visualization);
  const dataColumn = getDataColumn(rawData[0], visualization);

  // Formatear labels de manera más descriptiva
  const labels = rawData.map(item => formatLabel(labelColumn, item[labelColumn] || 'N/A'));
  const data = rawData.map(item => parseFloat(item[dataColumn]) || 0);

  // Crear un label más descriptivo para el dataset
  const datasetLabel = getDatasetLabel(dataColumn, visualization);

  return {
    labels,
    datasets: [{
      label: datasetLabel,
      data,
      backgroundColor: getBackgroundColors(data.length),
      borderColor: '#3B82F6',
      borderWidth: 1
    }]
  };
};

// Función para crear labels descriptivos para los datasets
const getDatasetLabel = (dataColumn: string, _visualization: any) => {
  const columnLabels: { [key: string]: string } = {
    'promedio_tch': 'TCH Promedio',
    'tch': 'TCH',
    'promedio_brix': 'Brix Promedio',
    'brix': 'Brix',
    'promedio_sacarosa': 'Sacarosa Promedio',
    'sacarosa': 'Sacarosa',
    'total_toneladas': 'Toneladas Totales',
    'promedio_toneladas': 'Toneladas Promedio',
    'toneladas_cana_molida': 'Toneladas de Caña Molida',
    'rendimiento_teorico': 'Rendimiento Teórico'
  };
  
  return columnLabels[dataColumn] || dataColumn;
};

// Función para obtener opciones del gráfico
const getChartOptions = (visualization: any) => {
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
      plugins: {
        title: {
          display: false, // Ya no mostramos el título aquí porque lo pusimos arriba
        },
        legend: {
          position: 'top' as const,
          labels: {
            padding: 25,
            font: {
              size: 13,
              weight: '500' as const
            },
            usePointStyle: true,
            pointStyle: 'circle',
            boxWidth: 12,
            boxHeight: 12
          }
        },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    }
  };

  // Configuraciones específicas por tipo de gráfico
  if (visualization.type === 'pie') {
    return {
      ...baseOptions,
      plugins: {
        ...baseOptions.plugins,
        legend: {
          ...baseOptions.plugins.legend,
          position: 'right' as const,
          labels: {
            ...baseOptions.plugins.legend.labels,
            padding: 15,
            font: {
              size: 12,
              weight: '500' as const
            },
            generateLabels: function(chart: any) {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                const dataset = data.datasets[0];
                const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
                return data.labels.map((label: string, index: number) => {
                  const value = dataset.data[index];
                  const percentage = ((value / total) * 100).toFixed(1);
                  return {
                    text: `${label}: ${value.toLocaleString()} (${percentage}%)`,
                    fillStyle: dataset.backgroundColor[index],
                    strokeStyle: dataset.borderColor,
                    lineWidth: dataset.borderWidth,
                    hidden: false,
                    index: index
                  };
                });
              }
              return [];
            }
          }
        }
      },
      layout: {
        padding: {
          top: 20,
          bottom: 20,
          left: 20,
          right: 20
        }
      }
    };
  }

  if (visualization.type === 'bar') {
    return {
      ...baseOptions,
      scales: {
        x: {
          beginAtZero: true,
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 12,
              weight: '500' as const
            },
            maxRotation: 45,
            minRotation: 0,
            padding: 10
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
            drawBorder: false
          },
          ticks: {
            font: {
              size: 12,
              weight: '500' as const
            },
            padding: 10,
            callback: function(value: any) {
              return value.toLocaleString();
            }
          }
        }
      },
      layout: {
        padding: {
          top: 20,
          bottom: 20,
          left: 20,
          right: 20
        }
      }
    };
  }

  if (visualization.type === 'line') {
    return {
      ...baseOptions,
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 12,
              weight: '500' as const
            },
            padding: 10
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
            drawBorder: false
          },
          ticks: {
            font: {
              size: 12,
              weight: '500' as const
            },
            padding: 10,
            callback: function(value: any) {
              return value.toLocaleString();
            }
          }
        }
      },
      layout: {
        padding: {
          top: 20,
          bottom: 20,
          left: 20,
          right: 20
        }
      }
    };
  }

  return baseOptions;
};

// Función para determinar la columna de labels
const getLabelColumn = (firstItem: any, _visualization: any) => {
  // Priorizar columnas temporales para consultas de tiempo
  const temporalLabels = ['mes', 'anio', 'nombre_mes', 'trimestre'];
  for (const col of temporalLabels) {
    if (firstItem[col] !== undefined) {
      return col;
    }
  }
  
  // Luego otras columnas descriptivas
  const possibleLabels = ['nombre_finca', 'nombre_variedad', 'nombre_zona'];
  for (const col of possibleLabels) {
    if (firstItem[col] !== undefined) {
      return col;
    }
  }
  return Object.keys(firstItem)[0];
};

// Función para formatear labels de manera más descriptiva
const formatLabel = (label: string, value: any) => {
  // Formatear nombres de fincas
  if (label.includes('finca')) {
    return `Finca ${value}`;
  }
  
  // Formatear nombres de variedades
  if (label.includes('variedad')) {
    return `Variedad ${value}`;
  }
  
  // Formatear nombres de zonas
  if (label.includes('zona')) {
    return `Zona ${value}`;
  }
  
  // Formatear meses
  if (label === 'mes') {
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return monthNames[value - 1] || `Mes ${value}`;
  }
  
  // Formatear años
  if (label === 'anio') {
    return `Año ${value}`;
  }
  
  // Formatear trimestres
  if (label === 'trimestre') {
    return `Q${value}`;
  }
  
  return value;
};

// Función para determinar la columna de datos
const getDataColumn = (firstItem: any, _visualization: any) => {
  // Priorizar sacarosa si está disponible
  const sacarosaFields = ['promedio_sacarosa', 'sacarosa'];
  for (const col of sacarosaFields) {
    if (firstItem[col] !== undefined) {
      return col;
    }
  }
  
  // Luego TCH
  const tchFields = ['promedio_tch', 'tch'];
  for (const col of tchFields) {
    if (firstItem[col] !== undefined) {
      return col;
    }
  }
  
  // Luego Brix
  const brixFields = ['promedio_brix', 'brix'];
  for (const col of brixFields) {
    if (firstItem[col] !== undefined) {
      return col;
    }
  }
  
  // Luego otras métricas
  const possibleData = ['total_toneladas', 'total_produccion', 'toneladas_cana_molida', 'rendimiento_teorico'];
  for (const col of possibleData) {
    if (firstItem[col] !== undefined) {
      return col;
    }
  }
  return Object.keys(firstItem)[1] || Object.keys(firstItem)[0];
};

// Función para generar colores de fondo
const getBackgroundColors = (count: number) => {
  const colors = [
    '#3B82F6', '#F59E0B', '#8B5CF6', '#10B981', '#EF4444',
    '#6B7280', '#EC4899', '#14B8A6', '#F97316', '#6366F1'
  ];
  return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
};

export default ChatMessage;
