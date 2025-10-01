import React, { useState } from 'react';
import type { Metric, Dimension, AggregationFunction } from '../types/olap';

interface OLAPWizardProps {
  selectedMetrics: string[];
  selectedDimensions: string[];
  selectedFunctions: string[];
  onMetricsChange: (metrics: string[]) => void;
  onDimensionsChange: (dimensions: string[]) => void;
  onFunctionsChange: (functions: string[]) => void;
  onExecute: () => void;
  isExecuting: boolean;
  availableMetrics: Metric[];
  availableDimensions: Dimension[];
  availableFunctions: AggregationFunction[];
  currentStep?: number;
  onStepChange?: (step: number) => void;
  onNewAnalysis?: () => void;
}

const OLAPWizard: React.FC<OLAPWizardProps> = ({
  selectedMetrics,
  selectedDimensions,
  selectedFunctions,
  onMetricsChange,
  onDimensionsChange,
  onFunctionsChange,
  onExecute,
  isExecuting,
  availableMetrics,
  availableDimensions,
  availableFunctions,
  currentStep: externalCurrentStep,
  onStepChange,
  onNewAnalysis
}) => {
  const [internalCurrentStep, setInternalCurrentStep] = useState(1);
  const currentStep = externalCurrentStep ?? internalCurrentStep;

  const canExecute = selectedMetrics.length > 0 && selectedDimensions.length > 0 && selectedFunctions.length > 0;

  const handleStepChange = (step: number) => {
    if (onStepChange) {
      onStepChange(step);
    } else {
      setInternalCurrentStep(step);
    }
  };

  const handleMetricToggle = (metricId: string) => {
    const newMetrics = selectedMetrics.includes(metricId)
      ? selectedMetrics.filter(id => id !== metricId)
      : [...selectedMetrics, metricId];
    onMetricsChange(newMetrics);
  };

  const handleDimensionToggle = (dimensionId: string) => {
    const newDimensions = selectedDimensions.includes(dimensionId)
      ? selectedDimensions.filter(id => id !== dimensionId)
      : [...selectedDimensions, dimensionId];
    onDimensionsChange(newDimensions);
  };

  const handleFunctionToggle = (functionId: string) => {
    const newFunctions = selectedFunctions.includes(functionId)
      ? selectedFunctions.filter(id => id !== functionId)
      : [...selectedFunctions, functionId];
    onFunctionsChange(newFunctions);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          <i className="fas fa-magic mr-2 text-blue-600"></i>
          Análisis OLAP
        </h2>
        <p className="text-gray-600">
          Configura tu análisis multidimensional paso a paso
        </p>
      </div>

      {/* Indicador de pasos */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep >= step
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step}
              </div>
              {step < 4 && (
                <div
                  className={`w-16 h-1 mx-2 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Métricas</span>
          <span>Dimensiones</span>
          <span>Funciones</span>
          <span>Ejecutar</span>
        </div>
      </div>

      {/* Paso 1: Selección de Métricas */}
      {currentStep === 1 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            <i className="fas fa-chart-pie mr-2 text-blue-600"></i>
            Paso 1: Selecciona las Métricas
          </h3>
          <p className="text-gray-600 mb-6">Elige qué métricas quieres analizar</p>
          
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {availableMetrics.map((metric) => (
               <div
                 key={metric.id}
                 className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                   selectedMetrics.includes(metric.id)
                     ? 'border-blue-500 bg-blue-50 shadow-lg'
                     : 'border-gray-200 hover:border-gray-300 bg-white'
                 }`}
                 onClick={() => handleMetricToggle(metric.id)}
               >
                 <div className="flex flex-col items-center text-center">
                   <div className={`w-16 h-16 rounded-xl ${metric.color} flex items-center justify-center mb-4 shadow-lg`}>
                     <i className={`${metric.icon} text-white text-2xl`}></i>
                   </div>
                   <h4 className="font-bold text-gray-800 text-lg mb-2">{metric.name}</h4>
                   <p className="text-sm text-gray-600 mb-3 leading-relaxed">{metric.description}</p>
                   {selectedMetrics.includes(metric.id) && (
                     <div className="flex items-center text-blue-600 font-semibold">
                       <i className="fas fa-check-circle mr-2"></i>
                       Seleccionada
                     </div>
                   )}
                 </div>
               </div>
             ))}
           </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => handleStepChange(2)}
              disabled={selectedMetrics.length === 0}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                selectedMetrics.length > 0
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continuar a Dimensiones
              <i className="fas fa-arrow-right ml-2"></i>
            </button>
          </div>
        </div>
      )}

      {/* Paso 2: Selección de Dimensiones */}
      {currentStep === 2 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            <i className="fas fa-cube mr-2 text-green-600"></i>
            Paso 2: Selecciona las Dimensiones
          </h3>
          <p className="text-gray-600 mb-6">Elige las dimensiones para tu análisis multidimensional</p>
          
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {availableDimensions.map((dimension) => (
               <div
                 key={dimension.id}
                 className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                   selectedDimensions.includes(dimension.id)
                     ? 'border-green-500 bg-green-50 shadow-lg'
                     : 'border-gray-200 hover:border-gray-300 bg-white'
                 }`}
                 onClick={() => handleDimensionToggle(dimension.id)}
               >
                 <div className="flex flex-col items-center text-center">
                   <div className={`w-16 h-16 rounded-xl ${dimension.color} flex items-center justify-center mb-4 shadow-lg`}>
                     <i className={`${dimension.icon} text-white text-2xl`}></i>
                   </div>
                   <h4 className="font-bold text-gray-800 text-lg mb-2">{dimension.name}</h4>
                   <p className="text-sm text-gray-600 mb-2 leading-relaxed">{dimension.description}</p>
                   <p className="text-xs text-gray-500 mb-3 font-medium">
                     Niveles: {dimension.levels.join(', ')}
                   </p>
                   {selectedDimensions.includes(dimension.id) && (
                     <div className="flex items-center text-green-600 font-semibold">
                       <i className="fas fa-check-circle mr-2"></i>
                       Seleccionada
                     </div>
                   )}
                 </div>
               </div>
             ))}
           </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => handleStepChange(1)}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400 transition-colors"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Anterior
            </button>
            <button
              onClick={() => handleStepChange(3)}
              disabled={selectedDimensions.length === 0}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                selectedDimensions.length > 0
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continuar a Funciones
              <i className="fas fa-arrow-right ml-2"></i>
            </button>
          </div>
        </div>
      )}

      {/* Paso 3: Selección de Funciones */}
      {currentStep === 3 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            <i className="fas fa-cogs mr-2 text-purple-600"></i>
            Paso 3: Selecciona las Funciones de Agregación
          </h3>
          <p className="text-gray-600 mb-6">Elige cómo quieres agregar los datos</p>
          
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {availableFunctions.map((func) => (
               <div
                 key={func.id}
                 className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                   selectedFunctions.includes(func.id)
                     ? 'border-purple-500 bg-purple-50 shadow-lg'
                     : 'border-gray-200 hover:border-gray-300 bg-white'
                 }`}
                 onClick={() => handleFunctionToggle(func.id)}
               >
                 <div className="flex flex-col items-center text-center">
                   <div className={`w-16 h-16 rounded-xl ${func.color} flex items-center justify-center mb-4 shadow-lg`}>
                     <i className={`${func.icon} text-white text-2xl`}></i>
                   </div>
                   <h4 className="font-bold text-gray-800 text-lg mb-2">{func.name}</h4>
                   <p className="text-sm text-gray-600 mb-2 leading-relaxed">{func.description}</p>
                   <p className="text-xs text-gray-500 mb-3 font-mono bg-gray-100 px-2 py-1 rounded">
                     {func.formula}
                   </p>
                   {selectedFunctions.includes(func.id) && (
                     <div className="flex items-center text-purple-600 font-semibold">
                       <i className="fas fa-check-circle mr-2"></i>
                       Seleccionada
                     </div>
                   )}
                 </div>
               </div>
             ))}
           </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => handleStepChange(2)}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400 transition-colors"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Anterior
            </button>
            <button
              onClick={() => handleStepChange(4)}
              disabled={selectedFunctions.length === 0}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                selectedFunctions.length > 0
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continuar a Ejecutar
              <i className="fas fa-arrow-right ml-2"></i>
            </button>
          </div>
        </div>
      )}

      {/* Paso 4: Ejecutar Análisis */}
      {currentStep === 4 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            <i className="fas fa-play mr-2 text-green-600"></i>
            Paso 4: Ejecutar Análisis OLAP
          </h3>
          <p className="text-gray-600 mb-8">Revisa tu configuración y ejecuta el análisis</p>
          
          {/* Resumen de configuración */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h4 className="font-semibold text-gray-800 mb-6">Configuración seleccionada:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
              <div className="space-y-3">
                <div className="font-semibold text-blue-600 text-base mb-3">📊 Métricas:</div>
                <div className="space-y-2">
                  {selectedMetrics.map(metricId => {
                    const metric = availableMetrics.find(m => m.id === metricId);
                    return metric ? (
                      <div key={metricId} className="flex items-center p-2 bg-white rounded-lg shadow-sm">
                        <i className={`${metric.icon} mr-3 text-blue-500`}></i>
                        <span className="font-medium">{metric.name}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
              <div className="space-y-3">
                <div className="font-semibold text-green-600 text-base mb-3">🧊 Dimensiones:</div>
                <div className="space-y-2">
                  {selectedDimensions.map(dimId => {
                    const dimension = availableDimensions.find(d => d.id === dimId);
                    return dimension ? (
                      <div key={dimId} className="flex items-center p-2 bg-white rounded-lg shadow-sm">
                        <i className={`${dimension.icon} mr-3 text-green-500`}></i>
                        <span className="font-medium">{dimension.name}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
              <div className="space-y-3">
                <div className="font-semibold text-purple-600 text-base mb-3">⚙️ Funciones:</div>
                <div className="space-y-2">
                  {selectedFunctions.map(funcId => {
                    const func = availableFunctions.find(f => f.id === funcId);
                    return func ? (
                      <div key={funcId} className="flex items-center p-2 bg-white rounded-lg shadow-sm">
                        <i className={`${func.icon} mr-3 text-purple-500`}></i>
                        <span className="font-medium">{func.name}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4">
            {onNewAnalysis && (
              <button
                onClick={onNewAnalysis}
                className="px-6 py-3 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors"
              >
                <i className="fas fa-redo mr-2"></i> Nuevo Análisis
              </button>
            )}
            <button
              onClick={() => handleStepChange(3)}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400 transition-colors"
            >
              <i className="fas fa-arrow-left mr-2"></i> Anterior
            </button>
            <button
              onClick={onExecute}
              disabled={!canExecute || isExecuting}
              className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                canExecute && !isExecuting
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isExecuting ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Ejecutando...
                </>
              ) : (
                <>
                  <i className="fas fa-play mr-2"></i>
                  Ejecutar Análisis OLAP
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OLAPWizard;