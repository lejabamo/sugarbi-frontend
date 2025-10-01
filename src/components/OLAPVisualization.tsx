import React, { useState, useEffect, useRef } from 'react';

interface OLAPVisualizationProps {
  data: any[];
  selectedMetrics: string[];
  selectedDimensions: string[];
  selectedFunctions: string[];
  onDrillDown: (dimension: string, value: any) => void;
  onSlice: (dimension: string, value: any) => void;
  isLoading?: boolean;
}

const OLAPVisualization: React.FC<OLAPVisualizationProps> = ({
  data,
  selectedMetrics,
  selectedDimensions,
  selectedFunctions,
  onDrillDown,
  onSlice,
  isLoading = false
}) => {
  const [rotation, setRotation] = useState({ x: -15, y: 15 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredFace, setHoveredFace] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    setRotation(prev => ({
      x: prev.x + deltaY * 0.5,
      y: prev.y + deltaX * 0.5
    }));
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleFaceClick = (dimension: string, value: any) => {
    onDrillDown(dimension, value);
  };

  const handleFaceHover = (face: string) => {
    setHoveredFace(face);
  };

  const handleFaceLeave = () => {
    setHoveredFace(null);
  };

  // Generar colores para las caras del cubo basado en los datos
  const getFaceColor = (dimension: string, value: any) => {
    const colors = {
      tiempo: 'from-blue-400 to-blue-600',
      geografia: 'from-green-400 to-green-600',
      producto: 'from-purple-400 to-purple-600',
      default: 'from-gray-400 to-gray-600'
    };
    return colors[dimension as keyof typeof colors] || colors.default;
  };

  // Obtener datos para cada cara del cubo
  const getFaceData = (dimension: string) => {
    if (!data || data.length === 0) return [];
    
    const dimensionData = data.reduce((acc, record) => {
      // Buscar la columna de dimensión (puede ser tiempo_year, geografia_zone, etc.)
      const dimensionKey = Object.keys(record).find(key => 
        key.includes(dimension) && !key.includes('_')
      ) || Object.keys(record).find(key => key.includes(dimension));
      
      if (dimensionKey) {
        const key = record[dimensionKey];
        if (key) {
          if (!acc[key]) {
            acc[key] = { value: 0, count: 0, metricValues: {} };
          }
          // Sumar las métricas seleccionadas
          selectedMetrics.forEach(metric => {
            selectedFunctions.forEach(func => {
              const columnName = `${metric}_${func}`;
              if (record[columnName]) {
                acc[key].value += record[columnName];
                if (!acc[key].metricValues[metric]) {
                  acc[key].metricValues[metric] = 0;
                }
                acc[key].metricValues[metric] += record[columnName];
              }
            });
          });
          acc[key].count += 1;
        }
      }
      return acc;
    }, {});

    return Object.entries(dimensionData).map(([key, value]) => ({
      label: key,
      value: (value as any).value,
      count: (value as any).count,
      metricValues: (value as any).metricValues
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-xl">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-gray-600">Generando visualización multidimensional...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-xl">
        <div className="text-center">
          <i className="fas fa-cube text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-600">No hay datos para visualizar</p>
          <p className="text-sm text-gray-500">Ejecuta un análisis OLAP para ver la visualización</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">
          <i className="fas fa-cube mr-2 text-blue-600"></i>
          Visualización Multidimensional
        </h3>
        <div className="text-sm text-gray-500">
          {data.length} registros • {selectedDimensions.length} dimensión{selectedDimensions.length !== 1 ? 'es' : ''}
        </div>
      </div>

      {/* Cubo 3D interactivo */}
      <div className="relative">
        <div 
          className="relative w-96 h-96 mx-auto cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            className="absolute inset-0 transform-gpu"
            style={{
              transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Caras del cubo basadas en dimensiones seleccionadas */}
            {selectedDimensions.map((dimension, index) => {
              const faceData = getFaceData(dimension);
              const angle = (index * 360) / Math.max(selectedDimensions.length, 1);
              const isHovered = hoveredFace === dimension;
              const totalValue = faceData.reduce((sum, item) => sum + item.value, 0);
              
              return (
                <div
                  key={dimension}
                  className={`absolute w-32 h-32 rounded-lg shadow-lg transform transition-all duration-300 ${
                    isHovered ? 'scale-110 shadow-xl' : ''
                  }`}
                  style={{
                    transform: `rotateY(${angle}deg) translateZ(64px)`,
                    background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                    '--tw-gradient-from': isHovered ? '#3b82f6' : '#60a5fa',
                    '--tw-gradient-to': isHovered ? '#1d4ed8' : '#3b82f6',
                    '--tw-gradient-stops': 'var(--tw-gradient-from), var(--tw-gradient-to)'
                  } as any}
                  onClick={() => handleFaceClick(dimension, faceData[0]?.label)}
                  onMouseEnter={() => handleFaceHover(dimension)}
                  onMouseLeave={handleFaceLeave}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-2">
                    <i className="fas fa-cube text-2xl mb-1"></i>
                    <div className="text-sm font-bold text-center">
                      {dimension.charAt(0).toUpperCase() + dimension.slice(1)}
                    </div>
                    <div className="text-xs opacity-90 text-center">
                      {faceData.length} valores
                    </div>
                    <div className="text-xs font-semibold text-center mt-1">
                      {totalValue.toLocaleString()}
                    </div>
                    {faceData[0] && (
                      <div className="text-xs opacity-70 text-center mt-1">
                        {faceData[0].label}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {/* Caras adicionales para métricas si hay espacio */}
            {selectedMetrics.length > 0 && selectedDimensions.length < 6 && (
              <div
                className="absolute w-32 h-32 rounded-lg shadow-lg transform transition-all duration-300"
                style={{
                  transform: `rotateY(180deg) translateZ(64px)`,
                  background: 'linear-gradient(135deg, #8b5cf6, #a855f7)'
                }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-2">
                  <i className="fas fa-chart-pie text-2xl mb-1"></i>
                  <div className="text-sm font-bold text-center">Métricas</div>
                  <div className="text-xs opacity-90 text-center">
                    {selectedMetrics.length} seleccionadas
                  </div>
                  <div className="text-xs opacity-70 text-center mt-1">
                    {selectedMetrics.join(', ')}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instrucciones */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Arrastra para rotar • Haz clic en las caras para hacer drill-down
          </p>
        </div>
      </div>

      {/* Datos de las dimensiones */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {selectedDimensions.map(dimension => {
          const faceData = getFaceData(dimension);
          const totalValue = faceData.reduce((sum, item) => sum + item.value, 0);
          
          return (
            <div key={dimension} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-gray-800 text-lg capitalize">
                  <i className="fas fa-cube mr-2 text-blue-600"></i>
                  {dimension}
                </h4>
                <div className="text-sm text-gray-600">
                  Total: {totalValue.toLocaleString()}
                </div>
              </div>
              <div className="space-y-3 max-h-40 overflow-y-auto">
                {faceData.slice(0, 6).map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-white rounded-lg text-sm cursor-pointer hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md"
                    onClick={() => onSlice(dimension, item.label)}
                  >
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-800">
                        {item.value.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.count} registros
                      </div>
                    </div>
                  </div>
                ))}
                {faceData.length > 6 && (
                  <div className="text-center py-2">
                    <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full">
                      +{faceData.length - 6} más...
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {/* Resumen de métricas */}
        {selectedMetrics.length > 0 && (
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 shadow-sm">
            <h4 className="font-bold text-gray-800 text-lg mb-4">
              <i className="fas fa-chart-pie mr-2 text-purple-600"></i>
              Métricas Seleccionadas
            </h4>
            <div className="space-y-3">
              {selectedMetrics.map((metric, index) => (
                <div key={metric} className="flex items-center p-3 bg-white rounded-lg">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                  <span className="font-medium capitalize">{metric}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OLAPVisualization;
