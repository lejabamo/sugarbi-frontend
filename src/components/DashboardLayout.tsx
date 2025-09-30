import React from 'react';
import SmartFilters from './SmartFilters';
import type { FilterOptions } from '../services/sugarbiService';

interface DashboardLayoutProps {
  children: React.ReactNode;
  onFiltersChange: (filters: FilterOptions) => void;
  filters: FilterOptions;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  onFiltersChange, 
  filters 
}) => {
  const [isFiltersOpen, setIsFiltersOpen] = React.useState(false);

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50">
      {/* Botón para abrir filtros en móvil */}
      <div className="lg:hidden fixed top-16 left-4 z-50">
        <button
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className="bg-primary-600 text-white p-2 rounded-lg shadow-lg"
        >
          <i className={`fas ${isFiltersOpen ? 'fa-times' : 'fa-filter'}`}></i>
        </button>
      </div>

      {/* Overlay para móvil */}
      {isFiltersOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsFiltersOpen(false)}
        />
      )}

      {/* Sidebar de Filtros */}
      <div className={`
        ${isFiltersOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        fixed lg:relative
        top-0 left-0
        w-80 sm:w-96 lg:w-64
        h-full
        bg-white border-r border-gray-200 
        flex flex-col
        z-50
        transition-transform duration-300 ease-in-out
      `}>
        {/* Header del Sidebar */}
        <div className="p-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">
            <i className="fas fa-filter mr-1 text-primary-600"></i>
            Filtros
          </h2>
          <button
            onClick={() => setIsFiltersOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        {/* Contenido de Filtros */}
        <div className="flex-1 overflow-y-auto p-3">
          <SmartFilters onFiltersChange={onFiltersChange} />
        </div>
      </div>
      
      {/* Contenido Principal */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
