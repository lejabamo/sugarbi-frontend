import React from 'react';
import { useSmartFilters } from '../hooks/useSmartFilters';
import type { FilterOptions } from '../services/sugarbiService';

interface SmartFilterOptions {
  fincas: { finca_id: number; nombre_finca: string; count: number }[];
  variedades: { variedad_id: number; nombre_variedad: string; count: number }[];
  zonas: { zona_id: number; codigo_zona?: number; nombre_zona: string; count: number }[];
  años: { año: number; count: number }[];
  meses: { mes: number; nombre_mes: string; count: number }[];
}

interface SmartFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void;
}

const SmartFilters: React.FC<SmartFiltersProps> = ({ onFiltersChange }) => {
  const { 
    filters, 
    filterOptions, 
    isLoading, 
    updateFilter, 
    clearFilters,
    undoLastChange,
    getFilterState,
    canContinueFiltering,
    getTreeEndMessage,
    filterHistory 
  } = useSmartFilters();

  // Notificar cambios de filtros al componente padre
  React.useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    updateFilter(key, value);
  };

  const getStateIcon = (state: string) => {
    switch (state) {
      case 'selected': return <span className="text-green-600">●</span>;
      case 'available': return <span className="text-orange-500">●</span>;
      case 'blocked': return <span className="text-red-500">●</span>;
      default: return <span className="text-gray-400">●</span>;
    }
  };

  const getStateMessage = (key: keyof FilterOptions) => {
    const state = getFilterState(key);
    const options = filterOptions[key as keyof SmartFilterOptions] || [];
    
    // Debug para zona y variedad
    if (key === 'zona_id') {
      console.log('🌾 Estado de zona:', { state, optionsLength: options.length, isLoading });
    }
    if (key === 'variedad_id') {
      console.log('🌾 Estado de variedad:', { state, optionsLength: options.length, isLoading });
    }
    
    switch (key) {
      case 'año':
        return state === 'selected' ? 'Año seleccionado' : 'Selecciona un año';
      case 'mes':
        if (!filters.año) return 'Selecciona primero un año';
        if (options.length === 0) return 'No hay meses disponibles';
        return state === 'selected' ? 'Mes seleccionado' : 'Selecciona un mes';
      case 'zona_id':
        if (!filters.año || !filters.mes) return 'Selecciona primero año y mes';
        if (options.length === 0) return 'No hay zonas disponibles';
        return state === 'selected' ? 'Zona seleccionada' : 'Selecciona una zona';
      case 'variedad_id':
        if (!filters.año || !filters.mes || !filters.zona_id) return 'Selecciona primero año, mes y zona';
        if (options.length === 0) return 'No hay variedades disponibles';
        return state === 'selected' ? 'Variedad seleccionada' : 'Selecciona una variedad';
      case 'top_fincas':
        if (!filters.año || !filters.mes || !filters.zona_id) return 'Selecciona primero año, mes y zona';
        return state === 'selected' ? 'Top fincas seleccionado' : 'Selecciona cantidad de fincas';
      default:
        return '';
    }
  };

  if (isLoading && Object.keys(filters).length === 0) {
    return (
      <div className="text-center py-4">
        <i className="fas fa-spinner fa-spin text-primary-600 text-xl"></i>
        <p className="text-gray-500 text-sm mt-2">Cargando filtros inteligentes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Información del Sistema Inteligente - Solo en desktop */}
      <div className="hidden lg:block bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <i className="fas fa-brain text-blue-600 mr-2"></i>
            <div className="text-xs text-blue-800">
              <div className="font-medium">Sistema de Filtros Inteligente</div>
              <div className="text-blue-600">
                <span className="text-green-600">●</span> Seleccionado 
                <span className="text-orange-500">●</span> Disponible 
                <span className="text-red-500">●</span> Bloqueado
              </div>
            </div>
          </div>
          {filterHistory.length > 0 && (
            <button
              onClick={undoLastChange}
              className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded text-blue-700 transition-colors"
              title="Deshacer último cambio"
            >
              <i className="fas fa-undo mr-1"></i>
              Deshacer
            </button>
          )}
        </div>
      </div>

      {/* Controles de Filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="text-xs text-gray-500">
          {Object.keys(filters).length > 0 ? `${Object.keys(filters).length} filtros activos` : 'Sin filtros activos'}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={clearFilters}
            className="text-xs px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-red-700 transition-colors border border-red-200"
            title="Limpiar filtros y restaurar opciones disponibles"
          >
            <i className="fas fa-undo mr-1"></i>
            Limpiar
          </button>
        </div>
      </div>
      
      {/* Filtros Inteligentes */}
      <div className="space-y-3">
        {/* Filtro por Año */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Año {getStateIcon(getFilterState('año'))}
          </label>
          <select
            value={filters.año || ''}
            onChange={(e) => handleFilterChange('año', e.target.value ? parseInt(e.target.value) : undefined)}
            className={`form-select w-full text-sm py-2 ${getFilterState('año') === 'blocked' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            disabled={isLoading || getFilterState('año') === 'blocked'}
          >
            <option value="">
              {getStateMessage('año')} ({filterOptions.años.length})
            </option>
            {filterOptions.años.map(año => (
              <option key={año.año} value={año.año}>
                {año.año} {año.count > 0 && `(${año.count})`}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Mes */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Mes {getStateIcon(getFilterState('mes'))}
          </label>
          <select
            value={filters.mes || ''}
            onChange={(e) => handleFilterChange('mes', e.target.value ? parseInt(e.target.value) : undefined)}
            className={`form-select w-full text-sm py-2 ${getFilterState('mes') === 'blocked' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            disabled={isLoading || getFilterState('mes') === 'blocked'}
          >
            <option value="">
              {getStateMessage('mes')} ({filterOptions.meses.length})
            </option>
            {filterOptions.meses.map(mes => (
              <option key={mes.mes} value={mes.mes}>
                {mes.nombre_mes} {mes.count > 0 && `(${mes.count})`}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Zona */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Zona {getStateIcon(getFilterState('zona_id'))}
          </label>
          <select
            value={filters.zona_id || ''}
            onChange={(e) => {
              console.log('🌾 Zona seleccionada:', e.target.value);
              handleFilterChange('zona_id', e.target.value ? parseInt(e.target.value) : undefined);
            }}
            onFocus={() => console.log('🌾 Zona dropdown enfocado')}
            onBlur={() => console.log('🌾 Zona dropdown perdió foco')}
            className={`form-select w-full text-sm py-2 ${getFilterState('zona_id') === 'blocked' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            disabled={getFilterState('zona_id') === 'blocked'}
          >
            <option value="">
              {getStateMessage('zona_id')} ({filterOptions.zonas.length})
            </option>
            {filterOptions.zonas.map(zona => {
              console.log('🌾 Zona disponible:', zona);
              return (
                <option key={zona.zona_id ?? zona.codigo_zona} value={zona.zona_id ?? zona.codigo_zona}>
                  {zona.nombre_zona} {zona.count > 0 && `(${zona.count})`}
                </option>
              );
            })}
          </select>
        </div>

        {/* Filtro por Top Fincas */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Top Fincas {getStateIcon(getFilterState('top_fincas'))}
          </label>
          <select
            value={filters.top_fincas || ''}
            onChange={(e) => {
              console.log('🌾 Top Fincas seleccionado:', e.target.value);
              handleFilterChange('top_fincas', e.target.value ? parseInt(e.target.value) : undefined);
            }}
            onFocus={() => console.log('🌾 Top Fincas dropdown enfocado')}
            onBlur={() => console.log('🌾 Top Fincas dropdown perdió foco')}
            className={`form-select w-full text-sm py-2 ${getFilterState('top_fincas') === 'blocked' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            disabled={getFilterState('top_fincas') === 'blocked'}
          >
            <option value="">Todas las fincas</option>
            <option value="5">Top 5 fincas</option>
            <option value="10">Top 10 fincas</option>
            <option value="20">Top 20 fincas</option>
            <option value="50">Top 50 fincas</option>
            <option value="100">Top 100 fincas</option>
          </select>
        </div>

        {/* Filtro por Variedad */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Variedad {getStateIcon(getFilterState('variedad_id'))}
          </label>
          <select
            value={filters.variedad_id || ''}
            onChange={(e) => {
              console.log('🌾 Variedad seleccionada:', e.target.value);
              handleFilterChange('variedad_id', e.target.value ? parseInt(e.target.value) : undefined);
            }}
            onFocus={() => console.log('🌾 Variedad dropdown enfocado')}
            onBlur={() => console.log('🌾 Variedad dropdown perdió foco')}
            className={`form-select w-full text-sm py-2 ${getFilterState('variedad_id') === 'blocked' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            disabled={getFilterState('variedad_id') === 'blocked'}
          >
            <option value="">
              {getStateMessage('variedad_id')} ({filterOptions.variedades.length})
            </option>
            {filterOptions.variedades.map(variedad => {
              console.log('🌾 Variedad disponible:', variedad);
              return (
                <option key={variedad.variedad_id} value={variedad.variedad_id}>
                  {variedad.nombre_variedad} {variedad.count > 0 && `(${variedad.count})`}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Resumen de filtros activos */}
      {Object.keys(filters).length > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="text-sm font-medium text-green-900 mb-2">Filtros Activos:</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if (!value) return null;
              
              let label = '';
              switch (key) {
                case 'finca_id':
                  const finca = filterOptions.fincas.find(f => f.finca_id === value);
                  label = `Finca: ${finca?.nombre_finca || value}`;
                  break;
                case 'variedad_id':
                  const variedad = filterOptions.variedades.find(v => v.variedad_id === value);
                  label = `Variedad: ${variedad?.nombre_variedad || value}`;
                  break;
                case 'zona_id':
                  const zona = filterOptions.zonas.find(z => (z.zona_id ?? z.codigo_zona) === value);
                  label = `Zona: ${zona?.nombre_zona || value}`;
                  break;
                case 'año':
                  label = `Año: ${value}`;
                  break;
                case 'mes':
                  const mes = filterOptions.meses.find(m => m.mes === value);
                  label = `Mes: ${mes?.nombre_mes || value}`;
                  break;
                case 'top_fincas':
                  label = `Top ${value} fincas`;
                  break;
              }
              
              return (
                <span
                  key={key}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  {label}
                  <button
                    onClick={() => handleFilterChange(key as keyof FilterOptions, undefined)}
                    className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-green-400 hover:bg-green-200 hover:text-green-500"
                  >
                    <i className="fas fa-times text-xs"></i>
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Mensaje de "Suaquete" cuando no se puede continuar */}
      {getTreeEndMessage() && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <i className="fas fa-exclamation-triangle text-yellow-600 mr-2"></i>
            <div className="text-sm text-yellow-800">
              {getTreeEndMessage()}
            </div>
          </div>
        </div>
      )}

      {/* Historial de filtros */}
      {filterHistory.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Historial de Cambios:</h4>
          <div className="text-xs text-gray-600">
            {filterHistory.length} cambios guardados - Usa "Deshacer" para volver atrás
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartFilters;