import React, { useState, useCallback, useMemo } from 'react';
import OLAPWizard from './OLAPWizard';
import OLAPCube3D from './OLAPCube3D';
import ResultsPanel from './ResultsPanel';
import type { Metric, Dimension, AggregationFunction, OLAPQuery, OLAPResult } from '../types/olap';

interface OlapWizardProps {
  onExecuteOLAP: (query: OLAPQuery) => Promise<OLAPResult>;
  isLoading?: boolean;
}

const OlapWizardMain: React.FC<OlapWizardProps> = ({
  onExecuteOLAP,
  isLoading = false
}) => {
  // Estados del wizard
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([]);
  const [selectedFunctions, setSelectedFunctions] = useState<string[]>([]);
  const [olapResults, setOlapResults] = useState<OLAPResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [hoveredFace, setHoveredFace] = useState<string | null>(null);

  // Datos disponibles
  const availableMetrics: Metric[] = [
    { id: 'toneladas', name: 'Toneladas', icon: 'fas fa-weight', color: 'bg-blue-500', description: 'Producción en toneladas' },
    { id: 'tch', name: 'TCH', icon: 'fas fa-chart-line', color: 'bg-green-500', description: 'Toneladas de caña por hectárea' },
    { id: 'brix', name: 'Brix', icon: 'fas fa-tint', color: 'bg-yellow-500', description: 'Contenido de azúcar' },
    { id: 'sacarosa', name: 'Sacarosa', icon: 'fas fa-cube', color: 'bg-purple-500', description: 'Contenido de sacarosa' },
    { id: 'area', name: 'Área', icon: 'fas fa-expand-arrows-alt', color: 'bg-orange-500', description: 'Área cultivada' }
  ];

  const availableDimensions: Dimension[] = [
    { id: 'tiempo', name: 'Tiempo', icon: 'fas fa-clock', color: 'bg-blue-500', description: 'Análisis temporal', levels: ['año', 'mes', 'trimestre'] },
    { id: 'geografia', name: 'Geografía', icon: 'fas fa-globe', color: 'bg-green-500', description: 'Análisis geográfico', levels: ['zona', 'finca'] },
    { id: 'producto', name: 'Producto', icon: 'fas fa-seedling', color: 'bg-purple-500', description: 'Análisis de variedades', levels: ['variedad'] }
  ];

  const availableFunctions: AggregationFunction[] = [
    { id: 'sum', name: 'Suma', icon: 'fas fa-plus', color: 'bg-blue-500', description: 'Suma total de valores', formula: 'SUM(medida)' },
    { id: 'avg', name: 'Promedio', icon: 'fas fa-chart-bar', color: 'bg-green-500', description: 'Promedio aritmético', formula: 'AVG(medida)' },
    { id: 'max', name: 'Máximo', icon: 'fas fa-arrow-up', color: 'bg-red-500', description: 'Valor máximo', formula: 'MAX(medida)' },
    { id: 'min', name: 'Mínimo', icon: 'fas fa-arrow-down', color: 'bg-orange-500', description: 'Valor mínimo', formula: 'MIN(medida)' },
    { id: 'count', name: 'Conteo', icon: 'fas fa-hashtag', color: 'bg-purple-500', description: 'Número de registros', formula: 'COUNT(medida)' },
    { id: 'std', name: 'Desviación', icon: 'fas fa-chart-line', color: 'bg-indigo-500', description: 'Desviación estándar', formula: 'STDDEV(medida)' },
    { id: 'variance', name: 'Varianza', icon: 'fas fa-chart-area', color: 'bg-pink-500', description: 'Varianza estadística', formula: 'VARIANCE(medida)' },
    { id: 'median', name: 'Mediana', icon: 'fas fa-chart-pie', color: 'bg-teal-500', description: 'Valor mediano', formula: 'PERCENTILE_CONT(0.5)' }
  ];

  // Procesar datos para el cubo 3D
  const dimensionData = useMemo(() => {
    if (!olapResults?.data?.records) return {};
    
    const data: Record<string, any[]> = {};
    
    selectedDimensions.forEach(dimension => {
      const dimensionData = olapResults.data.records.reduce((acc: any, record: any) => {
        // Buscar la columna de dimensión
        const dimensionKey = Object.keys(record).find(key => 
          key.includes(dimension) && !key.includes('_')
        ) || Object.keys(record).find(key => key.includes(dimension));
        
        if (dimensionKey) {
          const key = record[dimensionKey];
          if (key) {
            if (!acc[key]) {
              acc[key] = { value: 0, count: 0, label: key };
            }
            
            // Sumar las métricas seleccionadas
            selectedMetrics.forEach(metric => {
              selectedFunctions.forEach(func => {
                const columnName = `${metric}_${func}`;
                if (record[columnName]) {
                  acc[key].value += record[columnName];
                }
              });
            });
            acc[key].count += 1;
          }
        }
        return acc;
      }, {});
      
      data[dimension] = Object.values(dimensionData);
    });
    
    return data;
  }, [olapResults, selectedDimensions, selectedMetrics, selectedFunctions]);

  // Handlers
  const handleMetricsChange = useCallback((metrics: string[]) => {
    setSelectedMetrics(metrics);
    if (metrics.length > 0 && currentStep === 1) {
      setCurrentStep(2);
    }
  }, [currentStep]);

  const handleDimensionsChange = useCallback((dimensions: string[]) => {
    setSelectedDimensions(dimensions);
    if (dimensions.length > 0 && currentStep === 2) {
      setCurrentStep(3);
    }
  }, [currentStep]);

  const handleFunctionsChange = useCallback((functions: string[]) => {
    setSelectedFunctions(functions);
    if (functions.length > 0 && currentStep === 3) {
      setCurrentStep(4);
    }
  }, [currentStep]);

  const handleExecute = useCallback(async () => {
    if (selectedMetrics.length === 0 || selectedDimensions.length === 0 || selectedFunctions.length === 0) {
      return;
    }

    setIsExecuting(true);
    try {
      const query: OLAPQuery = {
        operation: 'aggregate',
        measures: selectedMetrics,
        dimensions: selectedDimensions,
        dimension_levels: selectedDimensions.reduce((acc, dim) => {
          acc[dim] = 'year';
          return acc;
        }, {} as Record<string, string>),
        filters: {},
        aggregation_functions: selectedFunctions,
        limit: 1000
      };

      const results = await onExecuteOLAP(query);
      setOlapResults(results);
    } catch (error) {
      console.error('Error executing OLAP query:', error);
    } finally {
      setIsExecuting(false);
    }
  }, [selectedMetrics, selectedDimensions, selectedFunctions, onExecuteOLAP]);

  const handleFaceClick = useCallback((dimension: string) => {
    console.log('Drill down on dimension:', dimension);
    // Implementar lógica de drill-down
  }, []);

  const handleFaceHover = useCallback((dimension: string | null) => {
    setHoveredFace(dimension);
  }, []);

  const handleNewAnalysis = useCallback(() => {
    setCurrentStep(1);
    setSelectedMetrics([]);
    setSelectedDimensions([]);
    setSelectedFunctions([]);
    setOlapResults(null);
    setHoveredFace(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Panel izquierdo - Wizard */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <OLAPWizard
                selectedMetrics={selectedMetrics}
                selectedDimensions={selectedDimensions}
                selectedFunctions={selectedFunctions}
                onMetricsChange={handleMetricsChange}
                onDimensionsChange={handleDimensionsChange}
                onFunctionsChange={handleFunctionsChange}
                onExecute={handleExecute}
                isExecuting={isExecuting}
                availableMetrics={availableMetrics}
                availableDimensions={availableDimensions}
                availableFunctions={availableFunctions}
                currentStep={currentStep}
                onStepChange={setCurrentStep}
                onNewAnalysis={handleNewAnalysis}
              />
            </div>
          </div>

          {/* Panel central - Cubo 3D */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
                <i className="fas fa-cube mr-2 text-blue-600"></i>
                Visualización Multidimensional
              </h3>
              
              {selectedDimensions.length > 0 ? (
                <OLAPCube3D
                  selectedDimensions={selectedDimensions}
                  selectedMetrics={selectedMetrics}
                  dimensionData={dimensionData}
                  onFaceClick={handleFaceClick}
                  hoveredFace={hoveredFace}
                  onFaceHover={handleFaceHover}
                />
              ) : (
                <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <i className="fas fa-cube text-6xl text-gray-300 mb-4"></i>
                    <p className="text-gray-600">Selecciona dimensiones para ver el cubo 3D</p>
                  </div>
                </div>
              )}
              
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Arrastra para rotar • Haz clic en las caras para hacer drill-down
                </p>
              </div>
            </div>
          </div>

          {/* Panel derecho - Resultados */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <ResultsPanel
                data={olapResults?.data?.records || []}
                selectedMetrics={selectedMetrics}
                selectedDimensions={selectedDimensions}
                selectedFunctions={selectedFunctions}
                isLoading={isExecuting}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OlapWizardMain;