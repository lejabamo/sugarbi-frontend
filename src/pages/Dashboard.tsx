import React, { useState, useEffect } from 'react';
import { sugarbiService } from '../services/sugarbiService';
import type { Estadisticas, FilterOptions } from '../services/sugarbiService';
import StatsCard from '../components/StatsCard';
import Chart from '../components/Chart';
import LoadingSpinner from '../components/LoadingSpinner';
import DashboardLayout from '../components/DashboardLayout';
import DataTable from '../components/DataTable';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Estadisticas | null>(null);
  const [topCosechas, setTopCosechas] = useState<any[]>([]);
  const [filteredCosechas, setFilteredCosechas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({});

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    console.log('🔄 Dashboard: Filtros cambiaron:', filters);
    loadFilteredData();
  }, [filters]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Cargar estadísticas reales desde la API
      const estadisticasData = await sugarbiService.getEstadisticas();
      setStats(estadisticasData);
      
      // Cargar top cosechas para los gráficos
      const topCosechasData = await sugarbiService.getTopCosechas('toneladas', 5);
      setTopCosechas(topCosechasData);
      setFilteredCosechas(topCosechasData);
      
    } catch (err: any) {
      setError(err.message || 'Error al cargar los datos del dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFilteredData = async () => {
    try {
      console.log('🔄 Aplicando filtros reactivos:', filters);
      
      // Si no hay filtros, usar los datos originales
      if (Object.keys(filters).length === 0) {
        setFilteredCosechas(topCosechas);
        return;
      }

      // Cargar datos filtrados usando la API de intersecciones
      const filteredData = await sugarbiService.getCosechaFiltered(filters, 1000);
      console.log('✅ Datos filtrados recibidos:', filteredData.length, 'registros');
      setFilteredCosechas(filteredData);
      
    } catch (err: any) {
      console.error('❌ Error loading filtered data:', err);
      setFilteredCosechas([]);
    }
  };

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
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
    <DashboardLayout onFiltersChange={handleFiltersChange} filters={filters}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Resumen general del sistema SugarBI
          </p>
        </div>

        {/* Resumen de datos filtrados */}
        {Object.keys(filters).length > 0 && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <i className="fas fa-info-circle text-blue-600 mr-2"></i>
              <span className="text-blue-800 font-medium">
                Mostrando {filteredCosechas.length} registros filtrados
              </span>
              <span className="text-blue-600 ml-2">
                (de {stats?.total_hechos_cosecha || 0} registros totales)
              </span>
            </div>
          </div>
        )}

      {/* Estadísticas principales */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <StatsCard
            title="Total Fincas"
            value={stats.total_dimfinca}
            icon="🏭"
            color="primary"
            subtitle="Fincas registradas"
            format="number"
          />
          <StatsCard
            title="Total Variedades"
            value={stats.total_dimvariedad}
            icon="🌱"
            color="secondary"
            subtitle="Tipos de caña"
            format="number"
          />
          <StatsCard
            title="Total Cosechas"
            value={stats.total_cosechas}
            icon="📊"
            color="info"
            subtitle="Registros de producción"
            format="number"
          />
          <StatsCard
            title="Total Toneladas"
            value={stats.total_toneladas || 0}
            icon="⚖️"
            color="accent"
            subtitle="Producción total"
            format="number"
          />
        </div>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Cosechas por Producción */}
        <div className="card">
          {filteredCosechas.length > 0 ? (
        <Chart
          type="bar"
          title={Object.keys(filters).length > 0 ? 'Cosechas Filtradas' : 'Top 15 Cosechas por Producción'}
          subtitle={`${filteredCosechas.length} registros encontrados`}
          height={350}
          data={{
            labels: filteredCosechas.slice(0, 15).map((c, index) => 
              c.nombre_finca ? `${c.nombre_finca} (${c.año}/${c.mes})` : `Finca ${c.id_finca}`
            ),
            datasets: [{
              label: 'Toneladas',
              data: filteredCosechas.slice(0, 15).map(c => c.toneladas_cana_molida),
            }]
          }}
              options={{
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
                      text: 'Toneladas',
                      font: {
                        size: 12,
                        weight: '600'
                      }
                    }
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Fincas',
                      font: {
                        size: 12,
                        weight: '600'
                      }
                    }
                  }
                }
              }}
            />
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="text-4xl text-gray-300 mb-4">📊</div>
                <p className="text-gray-500 text-lg">No hay datos disponibles</p>
                <p className="text-gray-400 text-sm mt-1">Ajusta los filtros para ver resultados</p>
              </div>
            </div>
          )}
        </div>

        {/* Promedios de Calidad */}
        {stats && (
          <div className="card">
            <Chart
              type="doughnut"
              title={Object.keys(filters).length > 0 ? 'Promedios de Calidad Filtrados' : 'Promedios de Calidad'}
              subtitle={Object.keys(filters).length > 0 ? 'Métricas de calidad filtradas' : 'Métricas de calidad de la caña'}
              height={350}
              data={(() => {
                // Calcular promedios de los datos filtrados si hay filtros aplicados
                if (Object.keys(filters).length > 0 && filteredCosechas.length > 0) {
                  const promedioTCH = filteredCosechas.reduce((sum, c) => sum + (c.tch || 0), 0) / filteredCosechas.length;
                  const promedioBrix = filteredCosechas.reduce((sum, c) => sum + (c.brix || 0), 0) / filteredCosechas.length;
                  const promedioSacarosa = filteredCosechas.reduce((sum, c) => sum + (c.sacarosa || 0), 0) / filteredCosechas.length;
                  
                  console.log('📊 GRÁFICA DE CALIDAD - Datos filtrados:', {
                    registros: filteredCosechas.length,
                    tch: promedioTCH.toFixed(2),
                    brix: promedioBrix.toFixed(2),
                    sacarosa: promedioSacarosa.toFixed(2)
                  });
                  
                  return {
                    labels: [
                      `TCH (${promedioTCH.toFixed(1)} t/ha)`, 
                      `Brix (${promedioBrix.toFixed(1)}%)`, 
                      `Sacarosa (${promedioSacarosa.toFixed(1)}%)`
                    ],
                    datasets: [{
                      data: [promedioTCH, promedioBrix, promedioSacarosa],
                      backgroundColor: [
                        'rgba(34, 197, 94, 0.8)',   // Verde para TCH
                        'rgba(59, 130, 246, 0.8)',  // Azul para Brix
                        'rgba(168, 85, 247, 0.8)'   // Púrpura para Sacarosa
                      ],
                      borderColor: [
                        'rgba(34, 197, 94, 1)',
                        'rgba(59, 130, 246, 1)',
                        'rgba(168, 85, 247, 1)'
                      ],
                      borderWidth: 2
                    }]
                  };
                } else {
                  // Usar estadísticas globales si no hay filtros
                  console.log('📊 GRÁFICA DE CALIDAD - Datos globales:', stats);
                  return {
                    labels: [
                      `TCH (${(stats?.promedio_tch || 0).toFixed(1)} t/ha)`, 
                      `Brix (${(stats?.promedio_brix || 0).toFixed(1)}%)`, 
                      `Sacarosa (${(stats?.promedio_sacarosa || 0).toFixed(1)}%)`
                    ],
                    datasets: [{
                      data: [
                        stats?.promedio_tch || 0,
                        stats?.promedio_brix || 0,
                        stats?.promedio_sacarosa || 0
                      ],
                      backgroundColor: [
                        'rgba(34, 197, 94, 0.8)',   // Verde para TCH
                        'rgba(59, 130, 246, 0.8)',  // Azul para Brix
                        'rgba(168, 85, 247, 0.8)'   // Púrpura para Sacarosa
                      ],
                      borderColor: [
                        'rgba(34, 197, 94, 1)',
                        'rgba(59, 130, 246, 1)',
                        'rgba(168, 85, 247, 1)'
                      ],
                      borderWidth: 2
                    }]
                  };
                }
              })()}
              options={{
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      generateLabels: function(chart: any) {
                        const data = chart.data;
                        if (data.labels.length && data.datasets.length) {
                          return data.labels.map((label: string, i: number) => {
                            const value = data.datasets[0].data[i];
                            return {
                              text: `${label}: ${value?.toFixed(1) || 0}`,
                              fillStyle: data.datasets[0].backgroundColor[i],
                              strokeStyle: data.datasets[0].borderColor[i],
                              lineWidth: data.datasets[0].borderWidth,
                              hidden: false,
                              index: i
                            };
                          });
                        }
                        return [];
                      }
                    }
                  }
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Tabla de datos de cosecha avanzada */}
      <DataTable 
        data={filteredCosechas.length > 0 ? filteredCosechas : topCosechas}
        title={Object.keys(filters).length > 0 ? "Datos Filtrados de Cosecha" : "Datos de Cosecha"}
        showExport={true}
      />

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
    </DashboardLayout>
  );
};

export default Dashboard;
