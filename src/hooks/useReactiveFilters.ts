import { useState, useEffect, useCallback } from 'react';
import { sugarbiService } from '../services/sugarbiService';
import type { FilterOptions } from '../services/sugarbiService';

interface FilterOption {
  [key: string]: any;
  count: number;
}

interface FilterOptionsData {
  fincas: FilterOption[];
  variedades: FilterOption[];
  zonas: FilterOption[];
  años: FilterOption[];
  meses: FilterOption[];
}

export const useReactiveFilters = () => {
  const [filters, setFilters] = useState<FilterOptions>({});
  const [filterOptions, setFilterOptions] = useState<FilterOptionsData>({
    fincas: [],
    variedades: [],
    zonas: [],
    años: [],
    meses: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  // Función para cargar opciones de filtros de forma reactiva
  const loadFilterOptions = useCallback(async (currentFilters: FilterOptions = {}) => {
    try {
      setIsLoading(true);
      console.log('🔄 Cargando filtros reactivos para:', currentFilters);
      
      // Usar API de intersecciones para filtros reactivos
      const filterOptions = await sugarbiService.getFilterOptions(currentFilters);
      console.log('✅ Filtros reactivos recibidos:', filterOptions);
      
      setFilterOptions({
        fincas: filterOptions.fincas || [],
        variedades: filterOptions.variedades || [],
        zonas: filterOptions.zonas || [],
        años: filterOptions.años || [],
        meses: filterOptions.meses || []
      });
      
    } catch (error) {
      console.error('❌ Error cargando filtros reactivos:', error);
      // Fallback a APIs básicas
      await loadBasicFilterOptions();
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fallback a APIs básicas
  const loadBasicFilterOptions = useCallback(async () => {
    try {
      console.log('🔄 Cargando filtros básicos...');
      
      const [fincasData, variedadesData, zonasData, tiempoData] = await Promise.all([
        sugarbiService.getFincas(),
        sugarbiService.getVariedades(),
        sugarbiService.getZonas(),
        sugarbiService.getTiempo()
      ]);

      // Extraer años únicos
      const añosUnicos = [...new Set(tiempoData.map(t => t.año))].sort((a, b) => b - a);
      
      // Crear estructura de opciones
      const options = {
        fincas: fincasData.map(f => ({ ...f, count: 0 })),
        variedades: variedadesData.map(v => ({ ...v, count: 0 })),
        zonas: zonasData.map(z => ({ ...z, count: 0 })),
        años: añosUnicos.map(año => ({ año, count: 0 })),
        meses: [
          { mes: 1, nombre_mes: 'Enero', count: 0 },
          { mes: 2, nombre_mes: 'Febrero', count: 0 },
          { mes: 3, nombre_mes: 'Marzo', count: 0 },
          { mes: 4, nombre_mes: 'Abril', count: 0 },
          { mes: 5, nombre_mes: 'Mayo', count: 0 },
          { mes: 6, nombre_mes: 'Junio', count: 0 },
          { mes: 7, nombre_mes: 'Julio', count: 0 },
          { mes: 8, nombre_mes: 'Agosto', count: 0 },
          { mes: 9, nombre_mes: 'Septiembre', count: 0 },
          { mes: 10, nombre_mes: 'Octubre', count: 0 },
          { mes: 11, nombre_mes: 'Noviembre', count: 0 },
          { mes: 12, nombre_mes: 'Diciembre', count: 0 }
        ]
      };
      
      console.log('✅ Filtros básicos cargados:', options);
      setFilterOptions(options);
      setLastUpdate(Date.now());
      
    } catch (error) {
      console.error('❌ Error cargando filtros básicos:', error);
    }
  }, []);

  // Cargar filtros iniciales
  useEffect(() => {
    loadFilterOptions();
  }, [loadFilterOptions]);

  // Actualizar filtros cuando cambien (reactividad)
  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      console.log('🔄 Filtros cambiaron, actualizando opciones...');
      loadFilterOptions(filters);
    }
  }, [filters, loadFilterOptions]);

  // Función para cambiar filtros
  const updateFilter = useCallback((key: keyof FilterOptions, value: any) => {
    console.log(`🔄 Actualizando filtro ${key}:`, value);
    
    setFilters(prev => {
      const newFilters = { ...prev };
      
      if (value === '' || value === undefined || value === null) {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }
      
      console.log('📊 Nuevos filtros:', newFilters);
      return newFilters;
    });
  }, []);

  // Función para limpiar filtros
  const clearFilters = useCallback(() => {
    console.log('🧹 Limpiando filtros y restaurando opciones disponibles...');
    setFilters({});
    // Recargar opciones disponibles después de limpiar
    setTimeout(() => {
      loadFilterOptions({});
    }, 100);
  }, [loadFilterOptions]);

  // Función para obtener datos filtrados
  const getFilteredData = useCallback(async (limit: number = 100) => {
    try {
      console.log('📊 Obteniendo datos filtrados para:', filters);
      
      if (Object.keys(filters).length === 0) {
        // Si no hay filtros, obtener datos básicos
        return await sugarbiService.getTopCosechas('toneladas', limit);
      }
      
      // Obtener datos filtrados
      return await sugarbiService.getCosecha(filters);
      
    } catch (error) {
      console.error('❌ Error obteniendo datos filtrados:', error);
      return [];
    }
  }, [filters]);

  return {
    filters,
    filterOptions,
    isLoading,
    lastUpdate,
    updateFilter,
    clearFilters,
    getFilteredData,
    loadFilterOptions
  };
};
