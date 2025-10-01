import React, { useState } from 'react';
import type { ChatMessage as ChatMessageType } from '../types';
import Chart from './Chart';
import ChartControls from './ChartControls';
import type { ChartType, ViewMode } from './ChartControls';
import ChatAvatar from './ChatAvatar';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.type === 'user';
  const [showSQL, setShowSQL] = useState(false);
  
  // Detectar el mejor tipo de gráfica inicial basado en el contexto
  const getInitialChartType = (): ChartType => {
    if (!message.visualization?.data?.labels) return 'bar';
    
    const labels = message.visualization.data.labels;
    const dataPoints = message.visualization.data.datasets?.[0]?.data?.length || 0;
    
    // Si hay pocos puntos (≤6) y parece ser temporal, usar barras
    if (dataPoints <= 6 && labels.some((label: string) => 
      /^\d{4}$/.test(label) || /ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic/i.test(label)
    )) {
      return 'bar';
    }
    
    // Si hay muchos puntos o es claramente temporal, usar línea
    if (dataPoints > 6 || message.visualization.type === 'line') {
      return 'line';
    }
    
    return 'bar';
  };
  
  const [chartType, setChartType] = useState<ChartType>(getInitialChartType());
  const [viewMode, setViewMode] = useState<ViewMode>('values');

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-start gap-2`}>
      {/* Avatar para mensajes del bot */}
      {!isUser && (
        <div className="flex-shrink-0 mt-1">
          <ChatAvatar size="sm" />
        </div>
      )}
      
      <div className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl px-3 sm:px-4 py-2 sm:py-3 rounded-lg ${
        isUser 
          ? 'bg-primary-600 text-white' 
          : 'bg-green-100 text-green-900'
      }`}>
        {/* Contenido del mensaje */}
        <p className={`text-xs sm:text-sm ${isUser ? '' : 'font-semibold'}`}>{message.content}</p>
        
        {/* Error message */}
        {message.error && (
          <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-xs">
            <strong>Error:</strong> {message.error}
          </div>
        )}
        
        {/* Visualización */}
        {message.visualization && (
          <div className="mt-3">
            <div className="bg-white p-2 sm:p-3 rounded border">
              {/* Controles de gráfica */}
              <ChartControls
                chartType={chartType}
                viewMode={viewMode}
                onChartTypeChange={setChartType}
                onViewModeChange={setViewMode}
                showViewModeToggle={chartType === 'doughnut'}
              />
              
              {/* Gráfica */}
              <div className="mt-2">
                <Chart
                  type={chartType}
                  data={message.visualization.data}
                  viewMode={viewMode}
                  options={{
                    ...message.visualization.options,
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      ...message.visualization.options?.plugins,
                      legend: {
                        ...message.visualization.options?.plugins?.legend,
                        labels: {
                          ...message.visualization.options?.plugins?.legend?.labels,
                          font: {
                            size: 10
                          }
                        }
                      }
                    }
                  }}
                />
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
                <pre className="whitespace-pre-wrap break-words">{message.sql}</pre>
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

export default ChatMessage;
