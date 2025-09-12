import React, { useState, useEffect } from 'react';
import { sugarbiService } from '../services/sugarbiService';
import type { OLAPQuery } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import Chart from '../components/Chart';

const OLAP: React.FC = () => {
  const [dimensions, setDimensions] = useState<any[]>([]);
  const [measures, setMeasures] = useState<any[]>([]);
  const [aggregations, setAggregations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [queryResult, setQueryResult] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Estado del formulario de consulta
  const [query, setQuery] = useState<OLAPQuery>({
    operation: 'aggregate',
    measures: [],
    dimensions: [],
    dimension_levels: {},
    filters: {},
    aggregation_functions: ['sum'],
    limit: 100
  });

  useEffect(() => {
    loadOLAPMetadata();
  }, []);

  const loadOLAPMetadata = async () => {
    try {
      setIsLoading(true);
      const [dimensionsData, measuresData, aggregationsData] = await Promise.all([
        sugarbiService.getOLAPDimensions(),
        sugarbiService.getOLAPMeasures(),
        sugarbiService.getOLAPAggregations()
      ]);

      setDimensions(dimensionsData);
      setMeasures(measuresData.measures || []);
      setAggregations(aggregationsData.aggregations || []);
    } catch (error) {
      console.error('Error al cargar metadatos OLAP:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMeasureChange = (measure: string, checked: boolean) => {
    setQuery((prev: OLAPQuery) => ({
      ...prev,
      measures: checked 
        ? [...prev.measures, measure]
        : prev.measures.filter((m: string) => m !== measure)
    }));
  };

  const handleDimensionChange = (dimension: string, checked: boolean) => {
    setQuery((prev: OLAPQuery) => ({
      ...prev,
      dimensions: checked 
        ? [...prev.dimensions, dimension]
        : prev.dimensions.filter((d: string) => d !== dimension)
    }));
  };

  const handleAggregationChange = (aggregation: string, checked: boolean) => {
    setQuery((prev: OLAPQuery) => ({
      ...prev,
      aggregation_functions: checked 
        ? [...prev.aggregation_functions, aggregation]
        : prev.aggregation_functions.filter((a: string) => a !== aggregation)
    }));
  };

  const executeQuery = async () => {
    if (query.measures.length === 0) {
      alert('Selecciona al menos una medida');
      return;
    }

    try {
      setIsExecuting(true);
      const result = await sugarbiService.executeOLAPQuery(query);
      setQueryResult(result);
    } catch (error: any) {
      console.error('Error al ejecutar consulta OLAP:', error);
      alert('Error al ejecutar la consulta: ' + error.message);
    } finally {
      setIsExecuting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Cargando configuración OLAP..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Análisis OLAP</h1>
        <p className="mt-2 text-gray-600">
          Análisis multidimensional de datos de cosecha
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de configuración */}
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Configurar Consulta
            </h3>

            {/* Operación */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Operación
              </label>
              <select
                value={query.operation}
                onChange={(e) => setQuery((prev: OLAPQuery) => ({ ...prev, operation: e.target.value }))}
                className="input-field"
              >
                <option value="aggregate">Agregar</option>
                <option value="drill_down">Drill Down</option>
                <option value="roll_up">Roll Up</option>
                <option value="slice">Slice</option>
                <option value="dice">Dice</option>
              </select>
            </div>

            {/* Medidas */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medidas
              </label>
              <div className="space-y-2">
                {measures.map((measure) => (
                  <label key={measure.name} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={query.measures.includes(measure.name)}
                      onChange={(e) => handleMeasureChange(measure.name, e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{measure.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Dimensiones */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dimensiones
              </label>
              <div className="space-y-2">
                {dimensions.map((dimension) => (
                  <label key={dimension.name} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={query.dimensions.includes(dimension.name)}
                      onChange={(e) => handleDimensionChange(dimension.name, e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{dimension.name}</span>
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
                {aggregations.map((aggregation) => (
                  <label key={aggregation} className="flex items-center">
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
                onChange={(e) => setQuery((prev: OLAPQuery) => ({ ...prev, limit: parseInt(e.target.value) }))}
                className="input-field"
                min="1"
                max="1000"
              />
            </div>

            {/* Botón de ejecución */}
            <button
              onClick={executeQuery}
              disabled={isExecuting || query.measures.length === 0}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExecuting ? 'Ejecutando...' : 'Ejecutar Consulta'}
            </button>
          </div>
        </div>

        {/* Panel de resultados */}
        <div className="lg:col-span-2">
          {queryResult ? (
            <div className="space-y-4">
              {/* Información de la consulta */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Resultados de la Consulta
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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

              {/* Visualización */}
              {queryResult.data?.records && queryResult.data.records.length > 0 && (
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Visualización
                  </h3>
                  <Chart
                    type="bar"
                    data={{
                      labels: queryResult.data.records.map((_: any, index: number) => 
                        `Registro ${index + 1}`
                      ),
                      datasets: query.measures.map((measure: string, index: number) => ({
                        label: measure,
                        data: queryResult.data.records.map((record: any) => record[measure] || 0),
                        backgroundColor: `rgba(${59 + index * 50}, ${130 + index * 30}, ${246 + index * 20}, 0.5)`,
                        borderColor: `rgba(${59 + index * 50}, ${130 + index * 30}, ${246 + index * 20}, 1)`,
                        borderWidth: 1
                      }))
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'top' as const,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      }
                    }}
                  />
                </div>
              )}

              {/* Tabla de datos */}
              {queryResult.data?.records && queryResult.data.records.length > 0 && (
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Datos
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
            <div className="card">
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📊</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay consulta ejecutada
                </h3>
                <p className="text-gray-600">
                  Configura y ejecuta una consulta OLAP para ver los resultados aquí
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OLAP;
