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

      // Cargar estadísticas y top cosechas en paralelo
      const [statsData, topCosechasData] = await Promise.all([
        sugarbiService.getEstadisticas(),
        sugarbiService.getTopCosechas('toneladas', 5)
      ]);

      setStats(statsData);
      setTopCosechas(topCosechasData);
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
        {/* Top 5 Fincas por Producción */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top 5 Fincas por Producción
          </h3>
          {topCosechas.length > 0 ? (
            <Chart
              type="bar"
              data={{
                labels: topCosechas.map(c => c.nombre_finca),
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
                    beginAtZero: true
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
