import React from 'react';

export type ChartType = 'bar' | 'line' | 'doughnut';
export type ViewMode = 'values' | 'percentage';

interface ChartControlsProps {
  chartType: ChartType;
  viewMode: ViewMode;
  onChartTypeChange: (type: ChartType) => void;
  onViewModeChange: (mode: ViewMode) => void;
  showViewModeToggle?: boolean;
}

const ChartControls: React.FC<ChartControlsProps> = ({
  chartType,
  viewMode,
  onChartTypeChange,
  onViewModeChange,
  showViewModeToggle = true
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3 p-2 bg-gray-50 rounded-lg border">
      {/* Toggle de tipo de gráfica */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-600">Tipo:</span>
        <div className="flex bg-white rounded-md border border-gray-200">
          <button
            onClick={() => onChartTypeChange('bar')}
            className={`px-2 py-1 text-xs rounded-l-md transition-colors ${
              chartType === 'bar'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Barras
          </button>
          <button
            onClick={() => onChartTypeChange('line')}
            className={`px-2 py-1 text-xs border-l border-gray-200 transition-colors ${
              chartType === 'line'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Línea
          </button>
          <button
            onClick={() => onChartTypeChange('doughnut')}
            className={`px-2 py-1 text-xs rounded-r-md border-l border-gray-200 transition-colors ${
              chartType === 'doughnut'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Donut
          </button>
        </div>
      </div>

      {/* Toggle de modo de visualización */}
      {showViewModeToggle && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600">Vista:</span>
          <div className="flex bg-white rounded-md border border-gray-200">
            <button
              onClick={() => onViewModeChange('values')}
              className={`px-2 py-1 text-xs rounded-l-md transition-colors ${
                viewMode === 'values'
                  ? 'bg-green-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Valores
            </button>
            <button
              onClick={() => onViewModeChange('percentage')}
              className={`px-2 py-1 text-xs rounded-r-md border-l border-gray-200 transition-colors ${
                viewMode === 'percentage'
                  ? 'bg-green-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              %
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartControls;
export { ChartType, ViewMode };
