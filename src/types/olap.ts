export interface Metric {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface Dimension {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  levels: string[];
}

export interface AggregationFunction {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  formula: string;
}

export interface OLAPQuery {
  operation: 'aggregate' | 'drill_down' | 'roll_up' | 'slice' | 'dice';
  measures: string[];
  dimensions: string[];
  dimension_levels: Record<string, string>;
  filters: Record<string, any>;
  aggregation_functions: string[];
  limit: number;
}

export interface OLAPResult {
  data: {
    records: any[];
    execution_time: number;
    operation: string;
    metadata: any;
  };
  error?: string;
}

export interface FaceData {
  label: string;
  value: number;
  count: number;
  metricValues?: Record<string, number>;
}
