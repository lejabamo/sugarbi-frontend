import React from 'react';
import { sugarbiService } from '../services/sugarbiService';
import OlapWizardMain from '../components/OlapWizardMain';

interface OLAPQuery {
  operation: 'aggregate' | 'drill_down' | 'roll_up' | 'slice' | 'dice';
  measures: string[];
  dimensions: string[];
  dimension_levels: Record<string, string>;
  filters: Record<string, any>;
  aggregation_functions: string[];
  limit: number;
}

interface OLAPResult {
  data: {
    records: any[];
    execution_time: number;
    operation: string;
    metadata: any;
  };
  error?: string;
}

const OLAPAnalytics: React.FC = () => {
  // Función para ejecutar consultas OLAP
  const executeOLAPQuery = async (query: OLAPQuery): Promise<OLAPResult> => {
    try {
      const response = await sugarbiService.executeOLAPQuery(query);
      return response;
    } catch (error) {
      console.error('Error executing OLAP query:', error);
      throw error;
    }
  };

  return (
    <OlapWizardMain onExecuteOLAP={executeOLAPQuery} />
  );
};

export default OLAPAnalytics;