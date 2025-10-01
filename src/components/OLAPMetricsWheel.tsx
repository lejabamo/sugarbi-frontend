import React, { useState, useEffect } from 'react';

interface Metric {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

interface OLAPMetricsWheelProps {
  selectedMetrics: string[];
  onMetricsChange: (metrics: string[]) => void;
  availableMetrics: Metric[];
}

const OLAPMetricsWheel: React.FC<OLAPMetricsWheelProps> = ({
  selectedMetrics,
  onMetricsChange,
  availableMetrics
}) => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  const handleMetricClick = (metricId: string) => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    
    // Rotar la rueda hacia la métrica seleccionada
    const metricIndex = availableMetrics.findIndex(m => m.id === metricId);
    const targetRotation = -(metricIndex * (360 / availableMetrics.length));
    
    setRotation(prev => prev + (targetRotation - prev));
    
    // Toggle selección
    const newSelected = selectedMetrics.includes(metricId)
      ? selectedMetrics.filter(id => id !== metricId)
      : [...selectedMetrics, metricId];
    
    onMetricsChange(newSelected);
    
    setTimeout(() => setIsSpinning(false), 1000);
  };

  const getMetricPosition = (index: number) => {
    const angle = (index * 360) / availableMetrics.length;
    const radius = 120;
    const x = Math.cos((angle * Math.PI) / 180) * radius;
    const y = Math.sin((angle * Math.PI) / 180) * radius;
    return { x, y };
  };

  return (
    <div className="relative w-80 h-80 mx-auto">
      {/* Rueda central */}
      <div 
        className="absolute inset-0 rounded-full border-4 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-100 shadow-lg transition-transform duration-1000 ease-out"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {/* Centro de la rueda */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <i className="fas fa-chart-pie text-white text-xl"></i>
          </div>
        </div>
        
        {/* Métricas alrededor de la rueda */}
        {availableMetrics.map((metric, index) => {
          const position = getMetricPosition(index);
          const isSelected = selectedMetrics.includes(metric.id);
          
          return (
            <div
              key={metric.id}
              className={`absolute w-20 h-20 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 transform hover:scale-110 ${
                isSelected 
                  ? `${metric.color} shadow-lg scale-110` 
                  : 'bg-white border-2 border-gray-300 hover:border-blue-400'
              }`}
              style={{
                left: `calc(50% + ${position.x}px - 40px)`,
                top: `calc(50% + ${position.y}px - 40px)`,
                transform: `rotate(${-rotation}deg)`,
              }}
              onClick={() => handleMetricClick(metric.id)}
              title={metric.description}
            >
              <div className="text-center">
                <i className={`${metric.icon} text-lg ${isSelected ? 'text-white' : 'text-gray-600'}`}></i>
                <div className={`text-xs font-medium mt-1 ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                  {metric.name}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Indicador de selección */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
        <div className="w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-blue-600"></div>
      </div>
      
      {/* Información de métricas seleccionadas */}
      <div className="mt-4 text-center">
        <div className="text-sm text-gray-600 mb-2">
          {selectedMetrics.length} métrica{selectedMetrics.length !== 1 ? 's' : ''} seleccionada{selectedMetrics.length !== 1 ? 's' : ''}
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {selectedMetrics.map(metricId => {
            const metric = availableMetrics.find(m => m.id === metricId);
            return metric ? (
              <span
                key={metricId}
                className={`px-3 py-1 rounded-full text-xs font-medium ${metric.color} text-white`}
              >
                {metric.name}
              </span>
            ) : null;
          })}
        </div>
      </div>
    </div>
  );
};

export default OLAPMetricsWheel;
