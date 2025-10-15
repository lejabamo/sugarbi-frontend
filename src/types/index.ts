// Tipos principales del sistema SugarBI

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

export interface VisualizationConfig {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'scatter' | 'radar';
  title: string;
  xAxis: string;
  yAxis: string;
  data: any[];
  colors?: string[];
}

export interface DashboardStats {
  totalFincas: number;
  totalVariedades: number;
  totalZonas: number;
  totalCosechas: number;
  totalToneladas: number;
  promedioTCH: number;
  promedioBrix: number;
  añoInicio: number;
  añoFin: number;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  visualization?: any;
  sql?: string;
  error?: string;
  raw_data?: any[];
}

export interface OLAPDimension {
  name: string;
  levels: string[];
  description: string;
}

export interface OLAPMeasure {
  name: string;
  type: string;
  description: string;
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

export interface OLAPOperation {
  type: 'aggregate' | 'drill_down' | 'roll_up' | 'slice' | 'dice' | 'pivot';
  measures: string[];
  dimensions: string[];
  dimension_levels: Record<string, string>;
  filters?: Record<string, any>;
  aggregation_functions: string[];
  limit?: number;
  sort_by?: string;
}

export interface FilterOptions {
  finca_id?: number;
  variedad_id?: number;
  zona_id?: string;
  año?: number;
  mes?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'string' | 'number' | 'date' | 'boolean';
  format?: (value: any) => string;
}

export interface TableConfig {
  columns: TableColumn[];
  data: any[];
  pagination?: PaginationParams;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
