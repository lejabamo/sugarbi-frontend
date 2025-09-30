import React, { useState, useEffect } from 'react';
import { sugarbiService } from '../services/sugarbiService';
import type { Finca, Variedad, Zona, Tiempo } from '../services/sugarbiService';

export interface FilterOptions {
  finca_id?: number;
  variedad_id?: number;
  zona_id?: string;
  año?: number;
  mes?: number;
}

interface FiltersProps {
  onFiltersChange: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
}

const Filters: React.FC<FiltersProps> = ({ onFiltersChange, initialFilters = {} }) => {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const [fincas, setFincas] = useState<Finca[]>([]);
  const [variedades, setVariedades] = useState<Variedad[]>([]);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [años, setAños] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFilterData();
  }, []);

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const loadFilterData = async () => {
    try {
      setIsLoading(true);
      
      const [fincasData, variedadesData, zonasData, tiempoData] = await Promise.all([
        sugarbiService.getFincas(),
        sugarbiService.getVariedades(),
        sugarbiService.getZonas(),
        sugarbiService.getTiempo()
      ]);

      console.log('Datos cargados:', {
        fincas: fincasData.length,
        variedades: variedadesData.length,
        zonas: zonasData.length,
        tiempo: tiempoData.length
      });

      setFincas(fincasData);
      setVariedades(variedadesData);
      setZonas(zonasData);
      
      // Extraer años únicos
      const añosUnicos = [...new Set(tiempoData.map(t => t.año))].sort((a, b) => b - a);
      setAños(añosUnicos);
      
    } catch (error) {
      console.error('Error loading filter data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            <span className="ml-2 text-gray-600">Cargando filtros...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Botón Limpiar */}
      <div className="flex justify-end">
        <button
          onClick={clearFilters}
          className="btn-secondary text-sm px-3 py-1.5"
        >
          <i className="fas fa-times mr-1"></i>
          Limpiar Filtros
        </button>
      </div>
      
      {/* Filtros */}
      <div className="space-y-4">
        {/* Filtro por Finca */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Finca
          </label>
          <select
            value={filters.finca_id || ''}
            onChange={(e) => handleFilterChange('finca_id', parseInt(e.target.value))}
            className="form-select w-full"
          >
            <option value="">Todas las fincas ({fincas.length})</option>
            {fincas.map(finca => (
              <option key={finca.finca_id} value={finca.finca_id}>
                {finca.nombre_finca}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Variedad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Variedad
          </label>
          <select
            value={filters.variedad_id || ''}
            onChange={(e) => handleFilterChange('variedad_id', parseInt(e.target.value))}
            className="form-select w-full"
          >
            <option value="">Todas las variedades ({variedades.length})</option>
            {variedades.map(variedad => (
              <option key={variedad.variedad_id} value={variedad.variedad_id}>
                {variedad.nombre_variedad}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Zona */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Zona
          </label>
          <select
            value={filters.zona_id || ''}
            onChange={(e) => handleFilterChange('zona_id', e.target.value)}
            className="form-select w-full"
          >
            <option value="">Todas las zonas ({zonas.length})</option>
            {zonas.map(zona => (
              <option key={zona.codigo_zona} value={zona.codigo_zona}>
                {zona.nombre_zona}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Año */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Año
          </label>
          <select
            value={filters.año || ''}
            onChange={(e) => handleFilterChange('año', parseInt(e.target.value))}
            className="form-select w-full"
          >
            <option value="">Todos los años ({años.length})</option>
            {años.map(año => (
              <option key={año} value={año}>
                {año}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Mes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mes
          </label>
          <select
            value={filters.mes || ''}
            onChange={(e) => handleFilterChange('mes', parseInt(e.target.value))}
            className="form-select w-full"
          >
            <option value="">Todos los meses</option>
            <option value="1">Enero</option>
            <option value="2">Febrero</option>
            <option value="3">Marzo</option>
            <option value="4">Abril</option>
            <option value="5">Mayo</option>
            <option value="6">Junio</option>
            <option value="7">Julio</option>
            <option value="8">Agosto</option>
            <option value="9">Septiembre</option>
            <option value="10">Octubre</option>
            <option value="11">Noviembre</option>
            <option value="12">Diciembre</option>
          </select>
        </div>
      </div>

      {/* Resumen de filtros activos */}
      {Object.keys(filters).length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Filtros Activos:</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if (!value) return null;
              
              let label = '';
              switch (key) {
                case 'finca_id':
                  label = `Finca: ${fincas.find(f => f.finca_id === value)?.nombre_finca || value}`;
                  break;
                case 'variedad_id':
                  label = `Variedad: ${variedades.find(v => v.variedad_id === value)?.nombre_variedad || value}`;
                  break;
                case 'zona_id':
                  label = `Zona: ${zonas.find(z => z.codigo_zona === value)?.nombre_zona || value}`;
                  break;
                case 'año':
                  label = `Año: ${value}`;
                  break;
                case 'mes':
                  const meses = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                  label = `Mes: ${meses[value]}`;
                  break;
              }
              
              return (
                <span
                  key={key}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {label}
                  <button
                    onClick={() => handleFilterChange(key as keyof FilterOptions, undefined)}
                    className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500"
                  >
                    <i className="fas fa-times text-xs"></i>
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Filters;
