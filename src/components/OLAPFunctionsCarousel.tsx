import React, { useState, useEffect } from 'react';

interface AggregationFunction {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  formula: string;
}

interface OLAPFunctionsCarouselProps {
  selectedFunctions: string[];
  onFunctionsChange: (functions: string[]) => void;
  availableFunctions: AggregationFunction[];
}

const OLAPFunctionsCarousel: React.FC<OLAPFunctionsCarouselProps> = ({
  selectedFunctions,
  onFunctionsChange,
  availableFunctions
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  // Auto-play del carrusel
  useEffect(() => {
    if (isAutoPlaying) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % availableFunctions.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlaying, availableFunctions.length]);

  const handleFunctionClick = (functionId: string) => {
    const newSelected = selectedFunctions.includes(functionId)
      ? selectedFunctions.filter(id => id !== functionId)
      : [...selectedFunctions, functionId];
    
    onFunctionsChange(newSelected);
  };

  const nextSlide = () => {
    setCurrentIndex(prev => (prev + 1) % availableFunctions.length);
  };

  const prevSlide = () => {
    setCurrentIndex(prev => (prev - 1 + availableFunctions.length) % availableFunctions.length);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(prev => !prev);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Controles del carrusel */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={prevSlide}
          className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
        >
          <i className="fas fa-chevron-left text-blue-600"></i>
        </button>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleAutoPlay}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              isAutoPlaying 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'bg-green-100 text-green-600 hover:bg-green-200'
            }`}
          >
            <i className={`fas ${isAutoPlaying ? 'fa-pause' : 'fa-play'} mr-2`}></i>
            {isAutoPlaying ? 'Pausar' : 'Reproducir'}
          </button>
          
          <div className="text-sm text-gray-600">
            {currentIndex + 1} de {availableFunctions.length}
          </div>
        </div>
        
        <button
          onClick={nextSlide}
          className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
        >
          <i className="fas fa-chevron-right text-blue-600"></i>
        </button>
      </div>

      {/* Carrusel principal */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-100 p-8">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {availableFunctions.map((func, index) => (
            <div key={func.id} className="w-full flex-shrink-0">
              <div className="text-center">
                {/* Icono y nombre */}
                <div className="mb-6">
                  <div className={`w-20 h-20 mx-auto rounded-full ${func.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <i className={`${func.icon} text-3xl text-white`}></i>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{func.name}</h3>
                  <p className="text-gray-600 mb-4">{func.description}</p>
                </div>

                {/* Fórmula */}
                <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
                  <div className="text-sm text-gray-500 mb-2">Fórmula:</div>
                  <div className="font-mono text-lg text-gray-800 bg-gray-50 rounded px-4 py-2">
                    {func.formula}
                  </div>
                </div>

                {/* Botón de selección */}
                <button
                  onClick={() => handleFunctionClick(func.id)}
                  className={`px-8 py-3 rounded-full font-medium transition-all duration-300 ${
                    selectedFunctions.includes(func.id)
                      ? `${func.color} text-white shadow-lg transform scale-105`
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400 hover:shadow-md'
                  }`}
                >
                  {selectedFunctions.includes(func.id) ? (
                    <>
                      <i className="fas fa-check mr-2"></i>
                      Seleccionado
                    </>
                  ) : (
                    <>
                      <i className="fas fa-plus mr-2"></i>
                      Seleccionar
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Indicadores de posición */}
      <div className="flex justify-center mt-6 space-x-2">
        {availableFunctions.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Funciones seleccionadas */}
      {selectedFunctions.length > 0 && (
        <div className="mt-6 text-center">
          <div className="text-sm text-gray-600 mb-2">
            {selectedFunctions.length} función{selectedFunctions.length !== 1 ? 'es' : ''} seleccionada{selectedFunctions.length !== 1 ? 's' : ''}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {selectedFunctions.map(functionId => {
              const func = availableFunctions.find(f => f.id === functionId);
              return func ? (
                <span
                  key={functionId}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${func.color} text-white`}
                >
                  {func.name}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default OLAPFunctionsCarousel;
