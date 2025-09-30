import React from 'react';
import { useReactiveFilters } from '../hooks/useReactiveFilters';
import type { FilterOptions } from '../services/sugarbiService';

interface ReactiveFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void;
}

const ReactiveFilters: React.FC<ReactiveFiltersProps> = ({ onFiltersChange }) => {
  const {
    filters,
    filterOptions,
    isLoading,
    updateFilter,
    clearFilters
  } = useReactiveFilters();

  // Notificar cambios de filtros al componente padre
  React.useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    updateFilter(key, value);
  };

  if (isLoading && Object.keys(filters).length === 0) {
    return (
      <div className="space-y-3">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Información del Sistema Anti-Bobos */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center">
          <i className="fas fa-info-circle text-blue-600 mr-2"></i>
          <div className="text-xs text-blue-800">
            <div className="font-medium">Sistema Anti-Bobos</div>
            <div className="text-blue-600">
              <span className="text-green-600">●</span> Disponible 
              <span className="text-orange-500">●</span> En proceso 
              <span className="text-red-500">●</span> Bloqueado
            </div>
          </div>
        </div>
      </div>

               {/* Botón Limpiar */}
               <div className="flex justify-end">
                 <button
                   onClick={clearFilters}
                   className="text-xs px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-red-700 transition-colors border border-red-200"
                   title="Limpiar filtros y restaurar opciones disponibles"
                 >
                   <i className="fas fa-undo mr-1"></i>
                   Limpiar y Restaurar
                 </button>
               </div>
      
      {/* Filtros Reactivos */}
      <div className="space-y-3">
        {/* Filtro por Año */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Año <span className="text-green-600">●</span>
          </label>
          <select
            value={filters.año || ''}
            onChange={(e) => handleFilterChange('año', e.target.value ? parseInt(e.target.value) : undefined)}
            className="form-select w-full text-xs py-1"
            disabled={isLoading}
          >
            <option value="">
              Selecciona un año ({filterOptions.años.length})
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
                     Mes {!filters.año ? <span className="text-red-500">●</span> : filters.mes ? <span className="text-green-600">●</span> : <span className="text-orange-500">●</span>}
                   </label>
                   <select
                     value={filters.mes || ''}
                     onChange={(e) => handleFilterChange('mes', e.target.value ? parseInt(e.target.value) : undefined)}
                     className={`form-select w-full text-xs py-1 ${!filters.año || filterOptions.meses.length === 0 ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                     disabled={isLoading || !filters.año || filterOptions.meses.length === 0}
                   >
                     <option value="">
                       {!filters.año ? 'Selecciona primero un año' : 
                        filterOptions.meses.length === 0 ? 'No hay meses disponibles' :
                        `Selecciona un mes (${filterOptions.meses.length})`}
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
                     Zona {!filters.año || !filters.mes ? <span className="text-red-500">●</span> : filters.zona_id ? <span className="text-green-600">●</span> : <span className="text-orange-500">●</span>}
                   </label>
                   <select
                     value={filters.zona_id || ''}
                     onChange={(e) => handleFilterChange('zona_id', e.target.value || undefined)}
                     className={`form-select w-full text-xs py-1 ${!filters.año || !filters.mes || filterOptions.zonas.length === 0 ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                     disabled={isLoading || !filters.año || !filters.mes || filterOptions.zonas.length === 0}
                   >
                     <option value="">
                       {!filters.año || !filters.mes ? 'Selecciona primero año y mes' : 
                        filterOptions.zonas.length === 0 ? 'No hay zonas disponibles' :
                        `Selecciona una zona (${filterOptions.zonas.length})`}
                     </option>
                     {filterOptions.zonas.map(zona => (
                       <option key={zona.codigo_zona} value={zona.codigo_zona}>
                         {zona.nombre_zona} {zona.count > 0 && `(${zona.count})`}
                       </option>
                     ))}
                   </select>
                 </div>

                 {/* Filtro por Top Fincas */}
                 <div>
                   <label className="block text-xs font-medium text-gray-700 mb-1">
                     Top Fincas {!filters.año || !filters.mes || !filters.zona_id ? <span className="text-red-500">●</span> : filters.top_fincas ? <span className="text-green-600">●</span> : <span className="text-orange-500">●</span>}
                   </label>
                   <select
                     value={filters.top_fincas || ''}
                     onChange={(e) => handleFilterChange('top_fincas', e.target.value ? parseInt(e.target.value) : undefined)}
                     className={`form-select w-full text-xs py-1 ${!filters.año || !filters.mes || !filters.zona_id ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                     disabled={isLoading || !filters.año || !filters.mes || !filters.zona_id}
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
                     Variedad {!filters.año || !filters.mes || !filters.zona_id ? <span className="text-red-500">●</span> : filters.variedad_id ? <span className="text-green-600">●</span> : <span className="text-orange-500">●</span>}
                   </label>
                   <select
                     value={filters.variedad_id || ''}
                     onChange={(e) => handleFilterChange('variedad_id', e.target.value ? parseInt(e.target.value) : undefined)}
                     className={`form-select w-full text-xs py-1 ${!filters.año || !filters.mes || !filters.zona_id || filterOptions.variedades.length === 0 ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                     disabled={isLoading || !filters.año || !filters.mes || !filters.zona_id || filterOptions.variedades.length === 0}
                   >
                     <option value="">
                       {!filters.año || !filters.mes || !filters.zona_id ? 'Selecciona primero año, mes y zona' : 
                        filterOptions.variedades.length === 0 ? 'No hay variedades disponibles' :
                        `Todas (${filterOptions.variedades.length})`}
                     </option>
                     {filterOptions.variedades.map(variedad => (
                       <option key={variedad.variedad_id} value={variedad.variedad_id}>
                         {variedad.nombre_variedad} {variedad.count > 0 && `(${variedad.count})`}
                       </option>
                     ))}
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
                case 'año':
                  label = `Año: ${value}`;
                  break;
                case 'mes':
                  const mes = filterOptions.meses.find(m => m.mes === value);
                  label = `Mes: ${mes?.nombre_mes || value}`;
                  break;
                case 'zona_id':
                  const zona = filterOptions.zonas.find(z => z.codigo_zona === value);
                  label = `Zona: ${zona?.nombre_zona || value}`;
                  break;
                case 'variedad_id':
                  const variedad = filterOptions.variedades.find(v => v.variedad_id === value);
                  label = `Variedad: ${variedad?.nombre_variedad || value}`;
                  break;
                case 'top_fincas':
                  label = `Top ${value} fincas`;
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

      {/* Indicador de carga */}
      {isLoading && (
        <div className="flex items-center justify-center py-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Actualizando filtros...</span>
        </div>
      )}
    </div>
  );
};

export default ReactiveFilters;
