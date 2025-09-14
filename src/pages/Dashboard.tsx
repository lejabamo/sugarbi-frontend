import React, { useState, useEffect } from 'react';
import { sugarbiService } from '../services/sugarbiService';
import type { Estadisticas } from '../services/sugarbiService';
import StatsCard from '../components/StatsCard';
import Chart from '../components/Chart';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Estadisticas | null>(null);
  const [topCosechas, setTopCosechas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Cargar solo top cosechas por ahora (estadísticas las haremos después)
      const topCosechasData = await sugarbiService.getTopCosechas('toneladas', 5);
      setTopCosechas(topCosechasData);
      
      // Crear estadísticas básicas desde los datos de cosecha
      const totalToneladas = topCosechasData.reduce((sum, c) => sum + (c.toneladas_cana_molida || 0), 0);
      const promedioTCH = topCosechasData.reduce((sum, c) => sum + (c.tch || 0), 0) / topCosechasData.length;
      const promedioBrix = topCosechasData.reduce((sum, c) => sum + (c.brix || 0), 0) / topCosechasData.length;
      const promedioSacarosa = topCosechasData.reduce((sum, c) => sum + (c.sacarosa || 0), 0) / topCosechasData.length;
      
      setStats({
        total_dimfinca: new Set(topCosechasData.map(c => c.id_finca)).size,
        total_dimvariedad: new Set(topCosechasData.map(c => c.codigo_variedad)).size,
        total_dimzona: new Set(topCosechasData.map(c => c.codigo_zona)).size,
        total_dimtiempo: new Set(topCosechasData.map(c => c.codigo_tiempo)).size,
        total_hechos_cosecha: topCosechasData.length,
        total_cosechas: topCosechasData.length,
        total_toneladas: totalToneladas,
        promedio_tch: promedioTCH,
        promedio_brix: promedioBrix,
        promedio_sacarosa: promedioSacarosa,
        año_inicio: 2024,
        año_fin: 2025
      });
    } catch (err: any) {
      setError(err.message || 'Error al cargar los datos del dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Cargando dashboard..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-md p-6 max-w-md mx-auto">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadDashboardData}
            className="mt-4 btn-primary"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Resumen general del sistema SugarBI
        </p>
      </div>

      {/* Estadísticas principales */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Fincas"
            value={stats.total_dimfinca}
            icon="🏭"
            color="blue"
          />
          <StatsCard
            title="Total Variedades"
            value={stats.total_dimvariedad}
            icon="🌱"
            color="green"
          />
          <StatsCard
            title="Total Cosechas"
            value={stats.total_cosechas}
            icon="📊"
            color="purple"
          />
          <StatsCard
            title="Total Toneladas"
            value={stats.total_toneladas?.toLocaleString() || '0'}
            icon="⚖️"
            color="orange"
          />
        </div>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Cosechas por Producción */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top 5 Cosechas por Producción
          </h3>
          {topCosechas.length > 0 ? (
            <Chart
              type="bar"
              data={{
                labels: topCosechas.map((c, index) => `Finca ${c.id_finca}`),
                datasets: [{
                  label: 'Toneladas',
                  data: topCosechas.map(c => c.toneladas_cana_molida),
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
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Toneladas'
                    }
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Fincas'
                    }
                  }
                }
              }}
            />
          ) : (
            <p className="text-gray-500 text-center py-8">No hay datos disponibles</p>
          )}
        </div>

        {/* Promedios de Calidad */}
        {stats && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Promedios de Calidad
            </h3>
            <Chart
              type="doughnut"
              data={{
                labels: ['TCH', 'Brix', 'Sacarosa'],
                datasets: [{
                  data: [
                    stats.promedio_tch || 0,
                    stats.promedio_brix || 0,
                    stats.promedio_sacarosa || 0
                  ],
                  backgroundColor: [
                    'rgba(34, 197, 94, 0.5)',
                    'rgba(251, 191, 36, 0.5)',
                    'rgba(168, 85, 247, 0.5)'
                  ],
                  borderColor: [
                    'rgba(34, 197, 94, 1)',
                    'rgba(251, 191, 36, 1)',
                    'rgba(168, 85, 247, 1)'
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
          </div>
        )}
      </div>

      {/* Tabla de datos de cosecha */}
      {topCosechas.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Detalles de Cosechas
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
                    Toneladas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TCH
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Brix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sacarosa
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topCosechas.map((cosecha, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Finca {cosecha.id_finca}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Var. {cosecha.codigo_variedad}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Zona {cosecha.codigo_zona}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {cosecha.toneladas_cana_molida?.toLocaleString() || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {cosecha.tch?.toFixed(2) || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {cosecha.brix?.toFixed(2) || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {cosecha.sacarosa?.toFixed(2) || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Información adicional */}
      {stats && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Información del Sistema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600">
                {stats.año_inicio} - {stats.año_fin}
              </p>
              <p className="text-sm text-gray-600">Período de datos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600">
                {stats.total_dimzona}
              </p>
              <p className="text-sm text-gray-600">Zonas geográficas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600">
                {stats.total_dimtiempo}
              </p>
              <p className="text-sm text-gray-600">Períodos de tiempo</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
