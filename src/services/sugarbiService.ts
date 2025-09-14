import api from './api';

// Tipos de datos
export interface Finca {
  finca_id: number;
  codigo_finca: string;
  nombre_finca: string;
}

export interface Variedad {
  variedad_id: number;
  nombre_variedad: string;
}

export interface Zona {
  codigo_zona: string;
  nombre_zona: string;
}

export interface Tiempo {
  tiempo_id: number;
  año: number;
  mes: number;
  nombre_mes: string;
  trimestre: number;
  fecha: string;
}

export interface CosechaData {
  id_hecho: number;
  nombre_finca: string;
  nombre_variedad: string;
  nombre_zona: string;
  año: number;
  mes: number;
  nombre_mes: string;
  toneladas_cana_molida: number;
  tch: number;
  area_cosechada: number;
  brix: number;
  sacarosa: number;
  rendimiento_teorico: number;
}

export interface Estadisticas {
  total_dimfinca: number;
  total_dimvariedad: number;
  total_dimzona: number;
  total_dimtiempo: number;
  total_hechos_cosecha: number;
  total_cosechas: number;
  total_toneladas: number;
  promedio_tch: number;
  promedio_brix: number;
  promedio_sacarosa: number;
  año_inicio: number;
  año_fin: number;
}

export interface ChatResponse {
  success: boolean;
  data: {
    query: string;
    intent: {
      type: string;
      metric: string;
      dimension: string;
      filters: any;
      limit: number;
    };
    sql: string;
    visualization: any;
    raw_data: any[];
    record_count: number;
  };
  error?: string;
}

export interface OLAPQuery {
  operation: string;
  measures: string[];
  dimensions: string[];
  dimension_levels: Record<string, string>;
  filters?: Record<string, any>;
  aggregation_functions: string[];
  limit?: number;
  sort_by?: string;
}

export interface OLAPResponse {
  success: boolean;
  data: {
    records: any[];
    record_count: number;
    execution_time: number;
    operation: string;
    sql_query: string;
    metadata: any;
  };
  error?: string;
}

// Servicio principal de SugarBI
class SugarBIService {
  // Obtener fincas
  async getFincas(): Promise<Finca[]> {
    const response = await api.get('/api/fincas');
    return response.data.data;
  }

  // Obtener variedades
  async getVariedades(): Promise<Variedad[]> {
    const response = await api.get('/api/variedades');
    return response.data.data;
  }

  // Obtener zonas
  async getZonas(): Promise<Zona[]> {
    const response = await api.get('/api/zonas');
    return response.data.data;
  }

  // Obtener períodos de tiempo
  async getTiempo(): Promise<Tiempo[]> {
    const response = await api.get('/api/tiempo');
    return response.data.data;
  }

  // Obtener datos de cosecha con filtros
  async getCosecha(filters?: {
    finca_id?: number;
    variedad_id?: number;
    zona_id?: string;
    año?: number;
    mes?: number;
    limit?: number;
    offset?: number;
  }): Promise<CosechaData[]> {
    const response = await api.get('/api/cosecha', { params: filters });
    return response.data.data;
  }

  // Obtener estadísticas del sistema
  async getEstadisticas(): Promise<Estadisticas> {
    const response = await api.get('/api/estadisticas');
    return response.data.data;
  }

  // Obtener top cosechas por criterio
  async getTopCosechas(criterio: 'toneladas' | 'tch' | 'brix' | 'sacarosa', limit: number = 10): Promise<CosechaData[]> {
    const response = await api.get('/api/cosecha/top', {
      params: { criterio, limit }
    });
    return response.data.data;
  }

  // Procesar consulta del chatbot
  async processChatQuery(query: string): Promise<ChatResponse> {
    const response = await api.post('/api/chat', { query });
    return response.data;
  }

  // Procesar consulta del chatbot con LangChain
  async processChatQueryLangChain(query: string): Promise<ChatResponse> {
    const response = await api.post('/api/chat/langchain', { query });
    return response.data;
  }

  // Solo parsear consulta (sin ejecutar SQL)
  async parseQuery(query: string): Promise<any> {
    const response = await api.post('/api/query/parse', { query });
    return response.data;
  }

  // Obtener ejemplos de consultas
  async getExampleQueries(): Promise<string[]> {
    const response = await api.get('/api/examples');
    return response.data.data.examples;
  }

  // OLAP - Obtener dimensiones disponibles
  async getOLAPDimensions(): Promise<any> {
    const response = await api.get('/api/olap/dimensions');
    return response.data.data;
  }

  // OLAP - Obtener medidas disponibles
  async getOLAPMeasures(): Promise<any> {
    const response = await api.get('/api/olap/measures');
    return response.data.data;
  }

  // OLAP - Obtener funciones de agregación
  async getOLAPAggregations(): Promise<any> {
    const response = await api.get('/api/olap/aggregations');
    return response.data.data;
  }

  // OLAP - Obtener ejemplos de consultas OLAP
  async getOLAPExamples(): Promise<any> {
    const response = await api.get('/api/olap/examples');
    return response.data.data;
  }

  // OLAP - Ejecutar consulta OLAP
  async executeOLAPQuery(query: OLAPQuery): Promise<OLAPResponse> {
    const response = await api.post('/api/olap/query', query);
    return response.data;
  }

  // OLAP - Obtener valores de dimensión
  async getDimensionValues(dimension: string, level: string): Promise<any> {
    const response = await api.get(`/api/olap/dimension-values/${dimension}/${level}`);
    return response.data.data;
  }

  // Crear tabla dinámica
  async createPivotTable(data: any[], rowDimension: string, colDimension: string, measure: string): Promise<any> {
    const response = await api.post('/api/olap/pivot', {
      data,
      row_dimension: rowDimension,
      col_dimension: colDimension,
      measure
    });
    return response.data;
  }
}

export const sugarbiService = new SugarBIService();
