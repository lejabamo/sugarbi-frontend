import React, { useState, useEffect } from 'react';

interface Dimension {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  levels: string[];
}

interface OLAPDimensionsCubeProps {
  selectedDimensions: string[];
  onDimensionsChange: (dimensions: string[]) => void;
  availableDimensions: Dimension[];
}

const OLAPDimensionsCube: React.FC<OLAPDimensionsCubeProps> = ({
  selectedDimensions,
  onDimensionsChange,
  availableDimensions
}) => {
  const [rotation, setRotation] = useState({ x: -15, y: 15 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

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

  const handleDimensionClick = (dimensionId: string) => {
    const newSelected = selectedDimensions.includes(dimensionId)
      ? selectedDimensions.filter(id => id !== dimensionId)
      : [...selectedDimensions, dimensionId];
    
    onDimensionsChange(newSelected);
  };

  // Caras del cubo con dimensiones
  const cubeFaces = [
    { id: 'front', dimensions: [0, 1, 2, 3] },
    { id: 'back', dimensions: [4, 5, 6, 7] },
    { id: 'left', dimensions: [8, 9, 10, 11] },
    { id: 'right', dimensions: [12, 13, 14, 15] },
    { id: 'top', dimensions: [16, 17, 18, 19] },
    { id: 'bottom', dimensions: [20, 21, 22, 23] }
  ];

  return (
    <div className="relative w-80 h-80 mx-auto">
      {/* Instrucciones */}
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600">
          Arrastra para rotar el cubo • Haz clic en las caras para seleccionar dimensiones
        </p>
      </div>
      
      {/* Cubo 3D */}
      <div 
        className="relative w-64 h-64 mx-auto"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div
          className="absolute inset-0 transform-gpu"
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Cara frontal */}
          <div className="absolute w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-lg transform translateZ(64px) flex items-center justify-center">
            <div className="text-center text-white">
              <i className="fas fa-clock text-2xl mb-2"></i>
              <div className="text-sm font-medium">Tiempo</div>
              <div className="text-xs opacity-80">Año, Mes, Trimestre</div>
            </div>
          </div>
          
          {/* Cara trasera */}
          <div className="absolute w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-lg shadow-lg transform translateZ(-64px) rotateY(180deg) flex items-center justify-center">
            <div className="text-center text-white">
              <i className="fas fa-globe text-2xl mb-2"></i>
              <div className="text-sm font-medium">Geografía</div>
              <div className="text-xs opacity-80">Zona, Finca</div>
            </div>
          </div>
          
          {/* Cara izquierda */}
          <div className="absolute w-32 h-32 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg shadow-lg transform rotateY(-90deg) translateZ(64px) flex items-center justify-center">
            <div className="text-center text-white">
              <i className="fas fa-seedling text-2xl mb-2"></i>
              <div className="text-sm font-medium">Producto</div>
              <div className="text-xs opacity-80">Variedad</div>
            </div>
          </div>
          
          {/* Cara derecha */}
          <div className="absolute w-32 h-32 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg shadow-lg transform rotateY(90deg) translateZ(64px) flex items-center justify-center">
            <div className="text-center text-white">
              <i className="fas fa-chart-bar text-2xl mb-2"></i>
              <div className="text-sm font-medium">Rendimiento</div>
              <div className="text-xs opacity-80">TCH, Brix</div>
            </div>
          </div>
          
          {/* Cara superior */}
          <div className="absolute w-32 h-32 bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg shadow-lg transform rotateX(90deg) translateZ(64px) flex items-center justify-center">
            <div className="text-center text-white">
              <i className="fas fa-cube text-2xl mb-2"></i>
              <div className="text-sm font-medium">Calidad</div>
              <div className="text-xs opacity-80">Sacarosa, Pureza</div>
            </div>
          </div>
          
          {/* Cara inferior */}
          <div className="absolute w-32 h-32 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg shadow-lg transform rotateX(-90deg) translateZ(64px) flex items-center justify-center">
            <div className="text-center text-white">
              <i className="fas fa-weight text-2xl mb-2"></i>
              <div className="text-sm font-medium">Producción</div>
              <div className="text-xs opacity-80">Toneladas, Área</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Dimensiones seleccionadas */}
      <div className="mt-6 text-center">
        <div className="text-sm text-gray-600 mb-2">
          {selectedDimensions.length} dimensión{selectedDimensions.length !== 1 ? 'es' : ''} seleccionada{selectedDimensions.length !== 1 ? 's' : ''}
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {selectedDimensions.map(dimensionId => {
            const dimension = availableDimensions.find(d => d.id === dimensionId);
            return dimension ? (
              <span
                key={dimensionId}
                className={`px-3 py-1 rounded-full text-xs font-medium ${dimension.color} text-white`}
              >
                {dimension.name}
              </span>
            ) : null;
          })}
        </div>
      </div>
    </div>
  );
};

export default OLAPDimensionsCube;
