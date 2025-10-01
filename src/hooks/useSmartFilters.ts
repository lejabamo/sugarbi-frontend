import { useState, useEffect, useCallback, useRef } from 'react';
import { sugarbiService } from '../services/sugarbiService';
import type { FilterOptions } from '../services/sugarbiService';

interface FilterOptionItem {
  id?: number | string;
  name?: string;
  count: number;
  [key: string]: any;
}

interface SmartFilterOptions {
  fincas: FilterOptionItem[];
  variedades: FilterOptionItem[];
  zonas: FilterOptionItem[];
  años: FilterOptionItem[];
  meses: FilterOptionItem[];
}

interface FilterHistory {
  filters: FilterOptions;
  timestamp: number;
  valid: boolean;
}

export const useSmartFilters = (initialFilters: FilterOptions = {}) => {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const [filterOptions, setFilterOptions] = useState<SmartFilterOptions>({
    fincas: [],
    variedades: [],
    zonas: [],
    años: [],
    meses: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  
  // Historial de filtros para restauración
  const [filterHistory, setFilterHistory] = useState<FilterHistory[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const previousFiltersRef = useRef<FilterOptions>({});

  // Función para validar si un filtro es válido
  const validateFilter = useCallback((testFilters: FilterOptions): boolean => {
    // Validaciones básicas
    if (testFilters.año && !filterOptions.años.find(a => a.año === testFilters.año)) {
      return false;
    }
    if (testFilters.mes && !filterOptions.meses.find(m => m.mes === testFilters.mes)) {
      return false;
    }
    if (testFilters.zona_id && !filterOptions.zonas.find(z => z.codigo_zona === testFilters.zona_id)) {
      return false;
    }
    if (testFilters.variedad_id && !filterOptions.variedades.find(v => v.variedad_id === testFilters.variedad_id)) {
      return false;
    }
    if (testFilters.finca_id && !filterOptions.fincas.find(f => f.finca_id === testFilters.finca_id)) {
      return false;
    }
    return true;
  }, [filterOptions]);

  // Función para cargar opciones de filtros de forma inteligente
  const loadFilterOptions = useCallback(async (currentFilters: FilterOptions = {}) => {
    try {
      console.log('🧠 Cargando filtros inteligentes para:', currentFilters);
      // Solo mostrar loading si no hay filtros previos (carga inicial)
      if (Object.keys(filters).length === 0) {
        setIsLoading(true);
      }
      
      // Usar API de intersecciones para filtros reactivos
      const filterOptions = await sugarbiService.getFilterOptions(currentFilters);
      console.log('✅ Filtros inteligentes recibidos:', filterOptions);
      console.log('🔍 Estructura de meses recibida:', filterOptions.meses);
      console.log('🔍 Estructura de zonas recibida:', filterOptions.zonas);
      console.log('🔍 Estructura de variedades recibida:', filterOptions.variedades);
      
      const newOptions = {
        fincas: filterOptions.fincas || [],
        variedades: filterOptions.variedades || [],
        zonas: filterOptions.zonas || [],
        años: filterOptions['años'] || [], // Usar la clave con tilde del backend
        meses: filterOptions.meses || []
      };
      
      setFilterOptions(newOptions);
      
      console.log('📊 Opciones cargadas:', {
        años: newOptions.años.length,
        meses: newOptions.meses.length,
        zonas: newOptions.zonas.length,
        variedades: newOptions.variedades.length,
        fincas: newOptions.fincas.length
      });
      
      // Debug específico para meses (solo si hay problema)
      if (currentFilters.año && newOptions.meses.length === 0) {
        console.log(`🔍 DEBUG CARGA - Problema con meses para año ${currentFilters.año}:`, {
          mesesRecibidos: filterOptions.meses?.length || 0,
          mesesMapeados: newOptions.meses.length
        });
      }
      
      // Si no hay opciones, intentar cargar datos básicos
      if (Object.values(newOptions).every(arr => arr.length === 0)) {
        console.log('⚠️ No hay opciones disponibles, cargando datos básicos...');
        await loadBasicFilterOptions();
      } else {
        // Actualizar el estado con las nuevas opciones
        setFilterOptions(newOptions);
        console.log('✅ Opciones de filtros actualizadas:', newOptions);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error cargando filtros inteligentes:', error);
      // Fallback a datos básicos
      await loadBasicFilterOptions();
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Función de fallback para cargar datos básicos
  const loadBasicFilterOptions = useCallback(async () => {
    try {
      console.log('🔄 Cargando filtros básicos como fallback...');
      const [fincasData, variedadesData, zonasData, tiempoData] = await Promise.all([
        sugarbiService.getFincas(),
        sugarbiService.getVariedades(),
        sugarbiService.getZonas(),
        sugarbiService.getTiempo()
      ]);

      const añosUnicos = [...new Set(tiempoData.map(t => t.año))].sort((a, b) => b - a);
      
      setFilterOptions({
        fincas: fincasData.map(f => ({ ...f, id: f.finca_id, name: f.nombre_finca, count: 0 })),
        variedades: variedadesData.map(v => ({ ...v, id: v.variedad_id, name: v.nombre_variedad, count: 0 })),
        zonas: zonasData.map(z => ({ ...z, id: z.codigo_zona, name: z.nombre_zona, count: 0 })),
        años: añosUnicos.map(año => ({ año, id: año, name: año.toString(), count: 0 })),
        meses: [
          { mes: 1, nombre_mes: 'Enero', id: 1, name: 'Enero', count: 0 },
          { mes: 2, nombre_mes: 'Febrero', id: 2, name: 'Febrero', count: 0 },
          { mes: 3, nombre_mes: 'Marzo', id: 3, name: 'Marzo', count: 0 },
          { mes: 4, nombre_mes: 'Abril', id: 4, name: 'Abril', count: 0 },
          { mes: 5, nombre_mes: 'Mayo', id: 5, name: 'Mayo', count: 0 },
          { mes: 6, nombre_mes: 'Junio', id: 6, name: 'Junio', count: 0 },
          { mes: 7, nombre_mes: 'Julio', id: 7, name: 'Julio', count: 0 },
          { mes: 8, nombre_mes: 'Agosto', id: 8, name: 'Agosto', count: 0 },
          { mes: 9, nombre_mes: 'Septiembre', id: 9, name: 'Septiembre', count: 0 },
          { mes: 10, nombre_mes: 'Octubre', id: 10, name: 'Octubre', count: 0 },
          { mes: 11, nombre_mes: 'Noviembre', id: 11, name: 'Noviembre', count: 0 },
          { mes: 12, nombre_mes: 'Diciembre', id: 12, name: 'Diciembre', count: 0 }
        ]
      });
      console.log('✅ Filtros básicos cargados como fallback');
    } catch (error) {
      console.error('❌ Error cargando filtros básicos:', error);
    }
  }, []);

  // Función para actualizar filtros con validación inteligente
  const updateFilter = useCallback((key: keyof FilterOptions, value: any) => {
    console.log(`🧠 Actualizando filtro inteligente ${key}:`, value);
    
    // Guardar estado anterior solo si hay filtros existentes
    if (Object.keys(filters).length > 0) {
      const previousState = { ...filters };
      previousFiltersRef.current = previousState;
    }
    
    setFilters(prev => {
      const newFilters = { ...prev };
      
      if (value === '' || value === undefined || value === null) {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }

      // Reset dependent filters if a higher-level filter changes
      if (key === 'año') {
        delete newFilters.mes;
        delete newFilters.zona_id;
        delete newFilters.variedad_id;
        delete newFilters.finca_id;
      }
      if (key === 'mes') {
        delete newFilters.zona_id;
        delete newFilters.variedad_id;
        delete newFilters.finca_id;
      }
      if (key === 'zona_id') {
        delete newFilters.variedad_id;
        delete newFilters.finca_id;
      }

      console.log('📊 Nuevos filtros inteligentes:', newFilters);
      
      // Cargar opciones inmediatamente después de actualizar filtros
      console.log('🔄 Cargando opciones después de actualizar filtro...');
      loadFilterOptions(newFilters);
      
      return newFilters;
    });
    
    setLastUpdate(Date.now());
  }, [filters, loadFilterOptions]);

  // Función para validar y restaurar filtros si es necesario
  const validateAndRestoreFilters = useCallback(async (newFilters: FilterOptions) => {
    setIsValidating(true);
    
    try {
      // Cargar opciones para validar
      const optionsLoaded = await loadFilterOptions(newFilters);
      
      if (!optionsLoaded) {
        console.warn('⚠️ No se pudieron cargar opciones, restaurando filtros anteriores');
        if (Object.keys(previousFiltersRef.current).length > 0) {
          setFilters(previousFiltersRef.current);
        }
        return;
      }

      // Solo validar si hay más de un filtro para evitar reset en el primer filtro
      if (Object.keys(newFilters).length > 1) {
        const isValid = validateFilter(newFilters);
        
        if (!isValid) {
          console.warn('⚠️ Filtros inválidos detectados, restaurando estado anterior');
          if (Object.keys(previousFiltersRef.current).length > 0) {
            setFilters(previousFiltersRef.current);
          }
        } else {
          // Agregar al historial si es válido
          setFilterHistory(prev => [
            ...prev.slice(-4), // Mantener solo los últimos 5 estados
            {
              filters: newFilters,
              timestamp: Date.now(),
              valid: true
            }
          ]);
        }
      }
    } catch (error) {
      console.error('❌ Error validando filtros:', error);
      if (Object.keys(previousFiltersRef.current).length > 0) {
        setFilters(previousFiltersRef.current);
      }
    } finally {
      setIsValidating(false);
    }
  }, [loadFilterOptions, validateFilter]);

  // Función para limpiar filtros inteligentemente
  const clearFilters = useCallback(() => {
    console.log('🧠 Limpiando filtros inteligentemente...');
    
    // Guardar estado actual en historial si hay filtros
    if (Object.keys(filters).length > 0) {
      setFilterHistory(prev => [
        ...prev.slice(-4),
        {
          filters: { ...filters },
          timestamp: Date.now(),
          valid: true
        }
      ]);
    }
    
    setFilters({});
    
    // Recargar opciones disponibles después de limpiar
    setTimeout(() => {
      console.log('🔄 Recargando opciones después de limpiar...');
      loadFilterOptions({});
    }, 100);
  }, [filters, loadFilterOptions]);

  // Función para restaurar filtros del historial
  const restoreFromHistory = useCallback((index: number) => {
    if (index >= 0 && index < filterHistory.length) {
      const historyItem = filterHistory[index];
      console.log('🔄 Restaurando filtros del historial:', historyItem.filters);
      setFilters(historyItem.filters);
    }
  }, [filterHistory]);

  // Función para deshacer último cambio
  const undoLastChange = useCallback(() => {
    if (filterHistory.length > 0) {
      const lastValidState = filterHistory[filterHistory.length - 1];
      console.log('↩️ Deshaciendo último cambio:', lastValidState.filters);
      setFilters(lastValidState.filters);
      
      // Recargar opciones para el estado restaurado
      setTimeout(() => {
        loadFilterOptions(lastValidState.filters);
      }, 100);
    }
  }, [filterHistory, loadFilterOptions]);

  // Cargar filtros iniciales
  useEffect(() => {
    console.log('🚀 Cargando filtros iniciales...');
    const loadInitial = async () => {
      await loadFilterOptions({});
    };
    loadInitial();
  }, []);

  // Validar filtros cuando cambien (con debounce para evitar peticiones excesivas)
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (Object.keys(filters).length > 1) {
        await validateAndRestoreFilters(filters);
      }
      // Removemos la lógica de filtro único ya que ahora se maneja en updateFilter
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [filters, validateAndRestoreFilters]);

  // Helper para obtener el arreglo de opciones correspondiente a una clave de filtro
  const getOptionsByFilterKey = useCallback((filterKey: keyof FilterOptions) => {
    switch (filterKey) {
      case 'año':
        return filterOptions.años || [];
      case 'mes':
        return filterOptions.meses || [];
      case 'zona_id':
        return filterOptions.zonas || [];
      case 'variedad_id':
        return filterOptions.variedades || [];
      case 'finca_id':
        return filterOptions.fincas || [];
      default:
        return [] as any[];
    }
  }, [filterOptions]);

  // Función para obtener el estado de un filtro
  const getFilterState = useCallback((filterKey: keyof FilterOptions) => {
    const hasValue = filters[filterKey] !== undefined && filters[filterKey] !== null;
    const options = getOptionsByFilterKey(filterKey);
    const hasOptions = options.length > 0;
    
    // Debug específico para mes (solo cuando hay problema)
    if (filterKey === 'mes' && !hasOptions && filters.año) {
      console.log(`🔍 DEBUG MES - Problema detectado:`, {
        hasValue,
        hasOptions,
        optionsLength: options.length,
        filters: filters
      });
    }
    
    // Lógica específica para cada filtro
    switch (filterKey) {
      case 'año':
        // El año siempre está disponible desde el inicio
        return hasValue ? 'selected' : 'available';
      case 'mes':
        if (!filters.año) return 'blocked';
        // Si hay año seleccionado, el mes está disponible si hay opciones
        return hasOptions ? (hasValue ? 'selected' : 'available') : 'blocked';
      case 'zona_id':
        if (!filters.año || !filters.mes) return 'blocked';
        // Si hay año y mes, la zona está disponible si hay opciones
        return hasOptions ? (hasValue ? 'selected' : 'available') : 'blocked';
      case 'variedad_id':
        if (!filters.año || !filters.mes || !filters.zona_id) return 'blocked';
        // Si hay año, mes y zona, la variedad está disponible si hay opciones
        return hasOptions ? (hasValue ? 'selected' : 'available') : 'blocked';
      case 'top_fincas':
        if (!filters.año || !filters.mes || !filters.zona_id) return 'blocked';
        // Top fincas siempre está disponible si se cumplen los prerequisitos
        return hasValue ? 'selected' : 'available';
      default:
        return hasOptions ? (hasValue ? 'selected' : 'available') : 'blocked';
    }
  }, [filters, getOptionsByFilterKey]);

  // Función para verificar si se puede continuar con más filtros
  const canContinueFiltering = useCallback((currentFilters: FilterOptions) => {
    // Si no hay año, no se puede continuar
    if (!currentFilters.año) return false;
    
    // Si hay año pero no mes, verificar si hay meses disponibles
    if (!currentFilters.mes) {
      const meses = filterOptions.meses || [];
      return meses.length > 0;
    }
    
    // Si hay año y mes pero no zona, verificar si hay zonas disponibles
    if (!currentFilters.zona_id) {
      const zonas = filterOptions.zonas || [];
      return zonas.length > 0;
    }
    
    // Si hay año, mes y zona pero no variedad, verificar si hay variedades disponibles
    if (!currentFilters.variedad_id) {
      const variedades = filterOptions.variedades || [];
      return variedades.length > 0;
    }
    
    // Si ya se seleccionó todo, se puede continuar
    return true;
  }, [filterOptions]);

  // Función para obtener el mensaje de "suaquete" cuando no se puede continuar
  const getTreeEndMessage = useCallback(() => {
    if (!filters.año) return null;
    
    if (!filters.mes) {
      const meses = filterOptions.meses || [];
      if (meses.length === 0) {
        return "¡Suaquete! No hay meses disponibles para este año. Tome su gráfica con los datos del año.";
      }
    }
    
    if (!filters.zona_id && filters.mes) {
      const zonas = filterOptions.zonas || [];
      if (zonas.length === 0) {
        return "¡Suaquete! No hay zonas disponibles para este año y mes. Tome su gráfica con los datos hasta aquí.";
      }
    }
    
    if (!filters.variedad_id && filters.zona_id) {
      const variedades = filterOptions.variedades || [];
      if (variedades.length === 0) {
        return "¡Suaquete! No hay variedades disponibles para esta combinación. Tome su gráfica con los datos hasta aquí.";
      }
    }
    
    return null;
  }, [filters, filterOptions]);

  return { 
    filters, 
    filterOptions, 
    isLoading: isLoading || isValidating,
    updateFilter, 
    clearFilters,
    restoreFromHistory,
    undoLastChange,
    getFilterState,
    canContinueFiltering,
    getTreeEndMessage,
    filterHistory,
    lastUpdate 
  };
};
