import React, { useState, useEffect } from 'react';
import { sugarbiService } from '../services/sugarbiService';
import type { CosechaData } from '../services/sugarbiService';
import LoadingSpinner from '../components/LoadingSpinner';
import Chart from '../components/Chart';

interface OLAPQuery {
  operation: 'aggregate' | 'drill_down' | 'roll_up' | 'slice' | 'dice';
  measures: string[];
  dimensions: string[];
  dimension_levels: Record<string, string>;
  filters: Record<string, any>;
  aggregation_functions: string[];
  limit: number;
  sort_by?: string;
}

interface OLAPResult {
  success: boolean;
  data: {
    records: any[];
    record_count: number;
    execution_time: number;
    operation: string;
    sql_query: string;
    metadata: any;
  };
  error?: string;
}

const OLAPAnalytics: React.FC = () => {
  // Estados para metadatos OLAP
  const [dimensions, setDimensions] = useState<any[]>([]);
  const [measures, setMeasures] = useState<any[]>([]);
  const [aggregations, setAggregations] = useState<string[]>([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);

  // Estados para datos de cosecha (vista rápida)
  const [cosechaData, setCosechaData] = useState<CosechaData[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Estados para consulta OLAP
  const [query, setQuery] = useState<OLAPQuery>({
    operation: 'aggregate',
    // Por defecto: Toneladas por Tiempo (Año) con SUM
    measures: ['toneladas'],
    dimensions: ['tiempo'],
    dimension_levels: { tiempo: 'year' },
    filters: {},
    aggregation_functions: ['sum'],
    limit: 100
  });

  const [queryResult, setQueryResult] = useState<OLAPResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Estados para filtros rápidos
  const [quickFilters, setQuickFilters] = useState({
    año: new Date().getFullYear(),
    limit: 100
  });

  useEffect(() => {
    loadMetadata();
    loadQuickData();
  }, []);

  // Auto-ejecutar con la configuración por defecto cuando se carguen metadatos
  useEffect(() => {
    if (!isLoadingMetadata && !queryResult && query.measures.length > 0 && query.dimensions.length > 0) {
      executeOLAPQuery();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingMetadata]);

  useEffect(() => {
    loadQuickData();
  }, [quickFilters]);

  const loadMetadata = async () => {
    try {
      setIsLoadingMetadata(true);
      const [dimensionsData, measuresData, aggregationsData] = await Promise.all([
        sugarbiService.getOLAPDimensions(),
        sugarbiService.getOLAPMeasures(),
        sugarbiService.getOLAPAggregations()
      ]);

      // Mapear datos de forma segura
      const rawDimensions = Array.isArray(dimensionsData) ? dimensionsData : (dimensionsData?.dimensions || []);
      const rawMeasures = Array.isArray(measuresData) ? measuresData : (measuresData?.measures || []);
      const rawAggregations = Array.isArray(aggregationsData) ? aggregationsData : (aggregationsData?.aggregations || []);
      
      // Convertir strings a objetos con name y label
      const dimensionLabels = {
        'tiempo': 'Tiempo',
        'geografia': 'Geografía', 
        'producto': 'Producto'
      };
      
      const measureLabels = {
        'toneladas': 'Toneladas',
        'tch': 'TCH',
        'brix': 'Brix',
        'sacarosa': 'Sacarosa',
        'area': 'Área',
        'rendimiento': 'Rendimiento',
        'toneladas_cana_molida': 'Toneladas Caña Molida',
        'rendimiento_por_hectarea': 'Rendimiento por Hectárea'
      };
      
      const safeDimensions = rawDimensions.map((dim, index) => 
        typeof dim === 'string' ? { 
          name: dim, 
          label: dimensionLabels[dim] || dim.charAt(0).toUpperCase() + dim.slice(1) 
        } : dim
      );
      const safeMeasures = rawMeasures.map((measure, index) => 
        typeof measure === 'string' ? { 
          name: measure, 
          label: measureLabels[measure] || measure.charAt(0).toUpperCase() + measure.slice(1) 
        } : measure
      );
      const safeAggregations = rawAggregations.map((agg, index) => 
        typeof agg === 'string' ? agg : agg
      );
      
      console.log('🔍 Datos mapeados:', {
        rawDimensions,
        rawMeasures,
        rawAggregations,
        safeDimensions,
        safeMeasures,
        safeAggregations
      });

      setDimensions(safeDimensions);
      setMeasures(safeMeasures);
      setAggregations(safeAggregations);
    } catch (error) {
      console.error('Error cargando metadatos OLAP:', error);
      // Valores por defecto si falla la API
      setDimensions([
        { name: 'tiempo', levels: ['año', 'mes', 'trimestre'] },
        { name: 'geografia', levels: ['zona', 'finca'] },
        { name: 'producto', levels: ['variedad'] }
      ]);
      setMeasures([
        { name: 'toneladas_cana_molida', label: 'Toneladas' },
        { name: 'tch', label: 'TCH' },
        { name: 'brix', label: 'Brix' },
        { name: 'sacarosa', label: 'Sacarosa' }
      ]);
      setAggregations(['sum', 'avg', 'count', 'max', 'min']);
    } finally {
      setIsLoadingMetadata(false);
    }
  };

  const loadQuickData = async () => {
    try {
      setIsLoadingData(true);
      const data = await sugarbiService.getCosechaFiltered({ año: quickFilters.año }, quickFilters.limit);
      setCosechaData(data);
    } catch (error) {
      console.error('Error cargando datos rápidos:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleMeasureChange = (measure: string, checked: boolean) => {
    setQuery(prev => ({
      ...prev,
      measures: checked 
        ? [...prev.measures, measure]
        : prev.measures.filter(m => m !== measure)
    }));
  };

  const handleDimensionChange = (dimension: string, checked: boolean) => {
    setQuery(prev => ({
      ...prev,
      dimensions: checked 
        ? [...prev.dimensions, dimension]
        : prev.dimensions.filter(d => d !== dimension)
    }));
  };

  const handleAggregationChange = (aggregation: string, checked: boolean) => {
    setQuery(prev => ({
      ...prev,
      aggregation_functions: checked 
        ? [...prev.aggregation_functions, aggregation]
        : prev.aggregation_functions.filter(a => a !== aggregation)
    }));
  };

  const executeOLAPQuery = async () => {
    if (query.measures.length === 0 || query.dimensions.length === 0) {
      alert('Selecciona al menos una medida y una dimensión');
      return;
    }

    try {
      if (isExecuting) return;
      setIsExecuting(true);
      const result = await sugarbiService.executeOLAPQuery(query);
      setQueryResult(result);
    } catch (error: any) {
      console.error('Error ejecutando consulta OLAP:', error?.response?.data || error);
      alert('Error ejecutando la consulta (500). Revisa medidas/funciones válidas.');
    } finally {
      setIsExecuting(false);
    }
  };

  // Procesar datos para visualizaciones rápidas
  const processQuickData = () => {
    if (!cosechaData || !Array.isArray(cosechaData) || cosechaData.length === 0) return {};

    const produccionPorFinca = cosechaData.reduce((acc: any, record) => {
      const finca = record.nombre_finca || `Finca ${record.id_finca}`;
      acc[finca] = (acc[finca] || 0) + (record.toneladas_cana_molida || 0);
      return acc;
    }, {});

    const tchPorVariedad = cosechaData.reduce((acc: any, record) => {
      const variedad = record.nombre_variedad || `Var. ${record.codigo_variedad}`;
      if (!acc[variedad]) {
        acc[variedad] = { total: 0, count: 0 };
      }
      acc[variedad].total += (record.tch || 0);
      acc[variedad].count += 1;
      return acc;
    }, {});

    const brixPorZona = cosechaData.reduce((acc: any, record) => {
      const zona = record.nombre_zona || `Zona ${record.codigo_zona}`;
      if (!acc[zona]) {
        acc[zona] = { total: 0, count: 0 };
      }
      acc[zona].total += (record.brix || 0);
      acc[zona].count += 1;
      return acc;
    }, {});

    return { produccionPorFinca, tchPorVariedad, brixPorZona };
  };

  const quickData = processQuickData();

  if (isLoadingMetadata) {
    return <LoadingSpinner message="Cargando análisis OLAP..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Análisis OLAP Multidimensional</h1>
        <p className="mt-2 text-gray-600">
          Análisis avanzado de datos de cosecha con operaciones OLAP (Drill-down, Roll-up, Slice, Dice)
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-6">
        {/* Panel de configuración OLAP */}
        <div className="xl:col-span-1 order-first xl:order-first">
          <div className="card">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              <i className="fas fa-cube mr-2 text-blue-600"></i>
              Configurar Análisis OLAP
            </h3>

            {/* Operación */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Operación OLAP
              </label>
              <select
                value={query.operation}
                onChange={(e) => setQuery(prev => ({ ...prev, operation: e.target.value as any }))}
                className="form-select w-full text-sm py-2"
              >
                <option value="aggregate">📊 Agregar (Suma total)</option>
                <option value="drill_down">🔍 Drill Down (Detallar)</option>
                <option value="roll_up">📈 Roll Up (Resumir)</option>
                <option value="slice">✂️ Slice (Cortar dimensión)</option>
                <option value="dice">🎲 Dice (Cortar múltiple)</option>
              </select>
            </div>

            {/* Medidas */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medidas (Métricas)
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {measures.map((measure, index) => (
                  <label key={measure.name || `measure-${index}`} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={query.measures.includes(measure.name)}
                      onChange={(e) => handleMeasureChange(measure.name, e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {measure.label || measure.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Dimensiones */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dimensiones (Ejes de análisis)
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {dimensions.map((dimension, index) => (
                  <label key={dimension.name || `dimension-${index}`} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={query.dimensions.includes(dimension.name)}
                      onChange={(e) => handleDimensionChange(dimension.name, e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {dimension.label || dimension.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Funciones de agregación */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Funciones de Agregación
              </label>
              <div className="space-y-2">
                {aggregations.map((aggregation, index) => (
                  <label key={aggregation || `aggregation-${index}`} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={query.aggregation_functions.includes(aggregation)}
                      onChange={(e) => handleAggregationChange(aggregation, e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{aggregation}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Límite */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Límite de registros
              </label>
              <input
                type="number"
                value={query.limit}
                onChange={(e) => setQuery(prev => ({ ...prev, limit: parseInt(e.target.value) }))}
                className="form-input w-full text-sm py-2"
                min="1"
                max="1000"
              />
            </div>

            {/* Botón de ejecución */}
            <button
              onClick={executeOLAPQuery}
              disabled={isExecuting || query.measures.length === 0 || query.dimensions.length === 0}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* Filtros rápidos */}
          <div className="card mt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              <i className="fas fa-filter mr-2 text-green-600"></i>
              Vista Rápida
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Año
                </label>
                <input
                  type="number"
                  value={quickFilters.año}
                  onChange={(e) => setQuickFilters(prev => ({ ...prev, año: parseInt(e.target.value) }))}
                  className="form-input w-full text-sm py-1"
                  min="2020"
                  max="2030"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Límite
                </label>
                <input
                  type="number"
                  value={quickFilters.limit}
                  onChange={(e) => setQuickFilters(prev => ({ ...prev, limit: parseInt(e.target.value) }))}
                  className="form-input w-full text-sm py-1"
                  min="10"
                  max="1000"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Panel de resultados */}
        <div className="xl:col-span-3 order-last xl:order-last">
          {/* Resultados OLAP */}
          {queryResult ? (
            <div className="space-y-4">
              {/* Información de la consulta */}
              <div className="card">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  <i className="fas fa-chart-line mr-2 text-blue-600"></i>
                  Resultados del Análisis OLAP
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div>
                    <span className="text-gray-600">Registros:</span>
                    <p className="font-semibold">{queryResult.data?.record_count || 0}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Tiempo:</span>
                    <p className="font-semibold">{queryResult.data?.execution_time || 0}ms</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Operación:</span>
                    <p className="font-semibold">{queryResult.data?.operation || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Estado:</span>
                    <p className="font-semibold text-green-600">Exitoso</p>
                  </div>
                </div>
              </div>

              {/* Visualización OLAP */}
              {queryResult.data?.records && queryResult.data.records.length > 0 && (
                <div className="card">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                    Visualización Multidimensional
                  </h3>
                  <div className="h-64 sm:h-80">
                    <Chart
                      type="bar"
                      data={{
                        labels: (() => {
                          // Derivar campo de etiqueta a partir de la primera dimensión y su nivel
                          const firstDim = query.dimensions[0];
                          const level = query.dimension_levels[firstDim];
                          const labelKey = (firstDim && level) ? `${firstDim}_${level}` : undefined;
                          return queryResult.data.records.map((record: any, index: number) => {
                            const value = labelKey ? (record[labelKey] ?? record[firstDim] ?? null) : null;
                            return value !== null && value !== undefined ? String(value) : `Registro ${index + 1}`;
                          });
                        })(),
                        datasets: (() => {
                          const primaryAgg = (query.aggregation_functions && query.aggregation_functions[0]) || 'sum';
                          return query.measures.map((measure: string, index: number) => {
                            const key = `${measure}_${primaryAgg}`;
                            return {
                              label: `${measure} (${primaryAgg})`,
                              data: queryResult.data.records.map((record: any) => Number(record[key]) || 0),
                              backgroundColor: `rgba(${59 + index * 50}, ${130 + index * 30}, ${246 + index * 20}, 0.5)`,
                              borderColor: `rgba(${59 + index * 50}, ${130 + index * 30}, ${246 + index * 20}, 1)`,
                              borderWidth: 1
                            };
                          });
                        })()
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top' as const,
                            labels: {
                              font: {
                                size: 10
                              }
                            }
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              font: {
                                size: 10
                              }
                            }
                          },
                          x: {
                            ticks: {
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
              )}

              {/* Tabla de datos OLAP */}
              {queryResult.data?.records && queryResult.data.records.length > 0 && (
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Datos del Cubo OLAP
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {Object.keys(queryResult.data.records[0]).map((key) => (
                            <th
                              key={key}
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {queryResult.data.records.slice(0, 10).map((record: any, index: number) => (
                          <tr key={index}>
                            {Object.values(record).map((value: any, valueIndex: number) => (
                              <td
                                key={valueIndex}
                                className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                              >
                                {typeof value === 'number' ? value.toLocaleString() : value}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {queryResult.data.records.length > 10 && (
                      <p className="text-sm text-gray-500 mt-2">
                        Mostrando 10 de {queryResult.data.records.length} registros
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Vista rápida de datos */
            <div className="space-y-4">
              {/* Estadísticas rápidas */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card text-center">
                  <p className="text-2xl font-bold text-primary-600">
                    {cosechaData?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Registros</p>
                </div>
                <div className="card text-center">
                  <p className="text-2xl font-bold text-primary-600">
                    {(cosechaData?.reduce((sum, record) => sum + (record.toneladas_cana_molida || 0), 0) || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Total Toneladas</p>
                </div>
                <div className="card text-center">
                  <p className="text-2xl font-bold text-primary-600">
                    {cosechaData && cosechaData.length > 0 ? (cosechaData.reduce((sum, record) => sum + (record.tch || 0), 0) / cosechaData.length).toFixed(1) : '0'}
                  </p>
                  <p className="text-sm text-gray-600">Promedio TCH</p>
                </div>
                <div className="card text-center">
                  <p className="text-2xl font-bold text-primary-600">
                    {cosechaData && cosechaData.length > 0 ? (cosechaData.reduce((sum, record) => sum + (record.brix || 0), 0) / cosechaData.length).toFixed(1) : '0'}
                  </p>
                  <p className="text-sm text-gray-600">Promedio Brix</p>
                </div>
              </div>

              {/* Visualizaciones rápidas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Producción por Finca */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Producción por Finca
                  </h3>
                  {Object.keys(quickData.produccionPorFinca || {}).length > 0 ? (
                    <Chart
                      type="bar"
                      data={{
                        labels: Object.keys(quickData.produccionPorFinca).slice(0, 10),
                        datasets: [{
                          label: 'Toneladas',
                          data: Object.values(quickData.produccionPorFinca).slice(0, 10) as number[],
                          backgroundColor: 'rgba(59, 130, 246, 0.5)',
                          borderColor: 'rgba(59, 130, 246, 1)',
                          borderWidth: 1
                        }]
                      }}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { display: false }
                        },
                        scales: {
                          y: { beginAtZero: true }
                        }
                      }}
                    />
                  ) : (
                    <p className="text-gray-500 text-center py-8">No hay datos disponibles</p>
                  )}
                </div>

                {/* TCH por Variedad */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    TCH Promedio por Variedad
                  </h3>
                  {Object.keys(quickData.tchPorVariedad || {}).length > 0 ? (
                    <Chart
                      type="doughnut"
                      data={{
                        labels: Object.keys(quickData.tchPorVariedad),
                        datasets: [{
                          data: Object.values(quickData.tchPorVariedad).map((item: any) => 
                            item.total / item.count
                          ),
                          backgroundColor: [
                            'rgba(34, 197, 94, 0.5)',
                            'rgba(251, 191, 36, 0.5)',
                            'rgba(168, 85, 247, 0.5)',
                            'rgba(239, 68, 68, 0.5)',
                            'rgba(14, 165, 233, 0.5)'
                          ],
                          borderColor: [
                            'rgba(34, 197, 94, 1)',
                            'rgba(251, 191, 36, 1)',
                            'rgba(168, 85, 247, 1)',
                            'rgba(239, 68, 68, 1)',
                            'rgba(14, 165, 233, 1)'
                          ],
                          borderWidth: 1
                        }]
                      }}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { position: 'bottom' }
                        }
                      }}
                    />
                  ) : (
                    <p className="text-gray-500 text-center py-8">No hay datos disponibles</p>
                  )}
                </div>

                {/* Brix por Zona */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Brix Promedio por Zona
                  </h3>
                  {Object.keys(quickData.brixPorZona || {}).length > 0 ? (
                    <Chart
                      type="bar"
                      data={{
                        labels: Object.keys(quickData.brixPorZona),
                        datasets: [{
                          label: 'Brix',
                          data: Object.values(quickData.brixPorZona).map((item: any) => 
                            item.total / item.count
                          ),
                          backgroundColor: 'rgba(251, 191, 36, 0.5)',
                          borderColor: 'rgba(251, 191, 36, 1)',
                          borderWidth: 1
                        }]
                      }}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { display: false }
                        },
                        scales: {
                          y: { beginAtZero: true }
                        }
                      }}
                    />
                  ) : (
                    <p className="text-gray-500 text-center py-8">No hay datos disponibles</p>
                  )}
                </div>

                {/* Instrucciones */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    <i className="fas fa-info-circle mr-2 text-blue-600"></i>
                    Cómo usar el Análisis OLAP
                  </h3>
                  <div className="space-y-3 text-sm text-gray-600">
                    <div>
                      <strong>📊 Agregar:</strong> Suma total por dimensiones seleccionadas
                    </div>
                    <div>
                      <strong>🔍 Drill Down:</strong> Detalla de año → mes → día
                    </div>
                    <div>
                      <strong>📈 Roll Up:</strong> Resume de finca → zona → región
                    </div>
                    <div>
                      <strong>✂️ Slice:</strong> Filtra una dimensión específica
                    </div>
                    <div>
                      <strong>🎲 Dice:</strong> Filtra múltiples dimensiones
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <strong>💡 Tip:</strong> Selecciona al menos una medida y una dimensión para comenzar el análisis.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OLAPAnalytics;
