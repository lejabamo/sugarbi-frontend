import React, { useState, useEffect } from 'react';
import { sugarbiService } from '../services/sugarbiService';
import type { CosechaData } from '../services/sugarbiService';
import LoadingSpinner from '../components/LoadingSpinner';
import Chart from '../components/Chart';

const Analytics: React.FC = () => {
  const [cosechaData, setCosechaData] = useState<CosechaData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    año: new Date().getFullYear(),
    limit: 100
  });

  useEffect(() => {
    loadCosechaData();
  }, [filters]);

  const loadCosechaData = async () => {
    try {
      setIsLoading(true);
      const data = await sugarbiService.getCosecha(filters);
      setCosechaData(data);
    } catch (error) {
      console.error('Error al cargar datos de cosecha:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Procesar datos para visualizaciones
  const processDataForCharts = () => {
    if (!cosechaData.length) return {};

    // Producción por finca
    const produccionPorFinca = cosechaData.reduce((acc: any, record) => {
      const finca = record.nombre_finca;
      acc[finca] = (acc[finca] || 0) + record.toneladas_cana_molida;
      return acc;
    }, {});

    // TCH por variedad
    const tchPorVariedad = cosechaData.reduce((acc: any, record) => {
      const variedad = record.nombre_variedad;
      if (!acc[variedad]) {
        acc[variedad] = { total: 0, count: 0 };
      }
      acc[variedad].total += record.tch;
      acc[variedad].count += 1;
      return acc;
    }, {});

    // Brix por zona
    const brixPorZona = cosechaData.reduce((acc: any, record) => {
      const zona = record.nombre_zona;
      if (!acc[zona]) {
        acc[zona] = { total: 0, count: 0 };
      }
      acc[zona].total += record.brix;
      acc[zona].count += 1;
      return acc;
    }, {});

    // Tendencia mensual
    const tendenciaMensual = cosechaData.reduce((acc: any, record) => {
      const mes = record.nombre_mes;
      acc[mes] = (acc[mes] || 0) + record.toneladas_cana_molida;
      return acc;
    }, {});

    return {
      produccionPorFinca,
      tchPorVariedad,
      brixPorZona,
      tendenciaMensual
    };
  };

  const chartData = processDataForCharts();

  if (isLoading) {
    return <LoadingSpinner message="Cargando datos de análisis..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Avanzado</h1>
        <p className="mt-2 text-gray-600">
          Análisis detallado de datos de cosecha con visualizaciones interactivas
        </p>
      </div>

      {/* Filtros */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Año
            </label>
            <input
              type="number"
              value={filters.año}
              onChange={(e) => handleFilterChange('año', parseInt(e.target.value))}
              className="input-field"
              min="2020"
              max="2030"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Límite de registros
            </label>
            <input
              type="number"
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
              className="input-field"
              min="10"
              max="1000"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={loadCosechaData}
              className="btn-primary"
            >
              Actualizar Datos
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-primary-600">
            {cosechaData.length}
          </p>
          <p className="text-sm text-gray-600">Registros</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-primary-600">
            {cosechaData.reduce((sum, record) => sum + record.toneladas_cana_molida, 0).toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">Total Toneladas</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-primary-600">
            {(cosechaData.reduce((sum, record) => sum + record.tch, 0) / cosechaData.length).toFixed(1)}
          </p>
          <p className="text-sm text-gray-600">Promedio TCH</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-primary-600">
            {(cosechaData.reduce((sum, record) => sum + record.brix, 0) / cosechaData.length).toFixed(1)}
          </p>
          <p className="text-sm text-gray-600">Promedio Brix</p>
        </div>
      </div>

      {/* Visualizaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Producción por Finca */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Producción por Finca
          </h3>
          {Object.keys(chartData.produccionPorFinca || {}).length > 0 ? (
            <Chart
              type="bar"
              data={{
                labels: Object.keys(chartData.produccionPorFinca).slice(0, 10),
                datasets: [{
                  label: 'Toneladas',
                  data: Object.values(chartData.produccionPorFinca).slice(0, 10) as number[],
                  backgroundColor: 'rgba(59, 130, 246, 0.5)',
                  borderColor: 'rgba(59, 130, 246, 1)',
                  borderWidth: 1
                }]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true
                  }
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
          {Object.keys(chartData.tchPorVariedad || {}).length > 0 ? (
            <Chart
              type="doughnut"
              data={{
                labels: Object.keys(chartData.tchPorVariedad),
                datasets: [{
                  data: Object.values(chartData.tchPorVariedad).map((item: any) => 
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
                  legend: {
                    position: 'bottom'
                  }
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
          {Object.keys(chartData.brixPorZona || {}).length > 0 ? (
            <Chart
              type="bar"
              data={{
                labels: Object.keys(chartData.brixPorZona),
                datasets: [{
                  label: 'Brix',
                  data: Object.values(chartData.brixPorZona).map((item: any) => 
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
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          ) : (
            <p className="text-gray-500 text-center py-8">No hay datos disponibles</p>
          )}
        </div>

        {/* Tendencia Mensual */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tendencia de Producción Mensual
          </h3>
          {Object.keys(chartData.tendenciaMensual || {}).length > 0 ? (
            <Chart
              type="line"
              data={{
                labels: Object.keys(chartData.tendenciaMensual),
                datasets: [{
                  label: 'Toneladas',
                  data: Object.values(chartData.tendenciaMensual) as number[],
                  backgroundColor: 'rgba(168, 85, 247, 0.1)',
                  borderColor: 'rgba(168, 85, 247, 1)',
                  borderWidth: 2,
                  fill: true,
                  tension: 0.4
                }]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          ) : (
            <p className="text-gray-500 text-center py-8">No hay datos disponibles</p>
          )}
        </div>
      </div>

      {/* Tabla de datos */}
      {cosechaData.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Datos de Cosecha
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Finca
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Variedad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zona
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Año
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Toneladas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TCH
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Brix
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cosechaData.slice(0, 20).map((record, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.nombre_finca}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.nombre_variedad}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.nombre_zona}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.año}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.nombre_mes}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.toneladas_cana_molida.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.tch.toFixed(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.brix.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {cosechaData.length > 20 && (
              <p className="text-sm text-gray-500 mt-2">
                Mostrando 20 de {cosechaData.length} registros
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
