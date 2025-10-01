import React, { useMemo } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';

// Extender jsPDF con autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface ResultsPanelProps {
  data: any[];
  selectedMetrics: string[];
  selectedDimensions: string[];
  selectedFunctions: string[];
  isLoading?: boolean;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({
  data,
  selectedMetrics,
  selectedDimensions,
  selectedFunctions,
  isLoading = false
}) => {
  // Obtener columnas para la tabla
  const tableColumns = useMemo(() => {
    const cols: string[] = [];
    
    // Agregar columnas de dimensiones con sus niveles
    selectedDimensions.forEach(dimension => {
      // Mapear nombres de dimensiones a nombres de columna en la respuesta
      const dimensionMapping: Record<string, string> = {
        'tiempo': 'tiempo_year',
        'geografia': 'geografia_zone', 
        'producto': 'producto_variedad'
      };
      
      const columnName = dimensionMapping[dimension] || dimension;
      cols.push(columnName);
    });
    
    // Agregar columnas de métricas con funciones
    selectedMetrics.forEach(metric => {
      selectedFunctions.forEach(func => {
        const fieldName = `${metric}_${func}`;
        cols.push(fieldName);
      });
    });
    
    return cols;
  }, [selectedDimensions, selectedMetrics, selectedFunctions]);

  // Función para exportar a Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'OLAP Results');
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(dataBlob, `olap_analysis_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Función para exportar a CSV
  const exportToCSV = () => {
    const csvContent = [
      // Headers
      columnDefs.map(col => col.headerName).join(','),
      // Data rows
      ...data.map(row => 
        columnDefs.map(col => {
          const value = row[col.field!];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value || '';
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `olap_analysis_${new Date().toISOString().split('T')[0]}.csv`);
  };

  // Función para exportar a PDF
  const exportToPDF = () => {
    const doc = new jsPDF('landscape');
    
    // Título
    doc.setFontSize(20);
    doc.text('Análisis OLAP - SugarBI', 14, 22);
    
    // Información de configuración
    doc.setFontSize(12);
    doc.text(`Métricas: ${selectedMetrics.join(', ')}`, 14, 35);
    doc.text(`Dimensiones: ${selectedDimensions.join(', ')}`, 14, 42);
    doc.text(`Funciones: ${selectedFunctions.join(', ')}`, 14, 49);
    doc.text(`Total de registros: ${data.length}`, 14, 56);
    
    // Preparar datos para la tabla
    const tableData = data.map(row => 
      tableColumns.map(col => row[col] || '')
    );
    
    const tableHeaders = tableColumns.map(col => {
      // Formatear nombres de columnas
      if (selectedDimensions.includes(col)) {
        return col.charAt(0).toUpperCase() + col.slice(1);
      }
      // Para métricas con funciones, extraer el nombre
      const parts = col.split('_');
      if (parts.length >= 2) {
        const metric = parts[0];
        const func = parts[1];
        return `${metric} (${func})`;
      }
      return col;
    });
    
    // Crear tabla
    (doc as any).autoTable({
      head: [tableHeaders],
      body: tableData,
      startY: 65,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 14, right: 14 }
    });
    
    doc.save(`olap_analysis_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
            <p className="text-gray-600">Generando resultados...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <i className="fas fa-table text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-600">No hay datos para mostrar</p>
            <p className="text-sm text-gray-500">Ejecuta un análisis OLAP para ver los resultados</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header con botones de exportación */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800">
            <i className="fas fa-table mr-2 text-blue-600"></i>
            Resultados del Análisis
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {data.length} registros encontrados
          </p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            <i className="fas fa-file-excel mr-2"></i>
            Excel
          </button>
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <i className="fas fa-file-csv mr-2"></i>
            CSV
          </button>
          <button
            onClick={exportToPDF}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            <i className="fas fa-file-pdf mr-2"></i>
            PDF
          </button>
        </div>
      </div>

      {/* Tabla de resultados */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {tableColumns.map((col, index) => {
                let headerName = col;
                
                // Mapear nombres de columnas a nombres legibles
                if (col === 'tiempo_year') {
                  headerName = 'TIEMPO';
                } else if (col === 'geografia_zone') {
                  headerName = 'GEOGRAFÍA';
                } else if (col === 'producto_variedad') {
                  headerName = 'PRODUCTO';
                } else if (col.includes('_')) {
                  // Para métricas con funciones
                  const parts = col.split('_');
                  if (parts.length >= 2) {
                    const metric = parts[0].toUpperCase();
                    const func = parts[1].toUpperCase();
                    headerName = `${metric} (${func})`;
                  }
                } else {
                  headerName = col.toUpperCase();
                }
                
                return (
                  <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {headerName}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.slice(0, 20).map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {tableColumns.map((col, colIndex) => {
                  const value = row[col];
                  const formattedValue = typeof value === 'number' 
                    ? value.toLocaleString() 
                    : value || '-';
                  
                  return (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formattedValue}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        
        {data.length > 20 && (
          <div className="text-center py-4 text-sm text-gray-500">
            Mostrando 20 de {data.length} registros
          </div>
        )}
      </div>

      {/* Resumen estadístico */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <i className="fas fa-cube text-blue-600 text-xl mr-3"></i>
            <div>
              <div className="text-sm text-blue-600 font-medium">Dimensiones</div>
              <div className="text-lg font-bold text-blue-800">{selectedDimensions.length}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <i className="fas fa-chart-pie text-green-600 text-xl mr-3"></i>
            <div>
              <div className="text-sm text-green-600 font-medium">Métricas</div>
              <div className="text-lg font-bold text-green-800">{selectedMetrics.length}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center">
            <i className="fas fa-cogs text-purple-600 text-xl mr-3"></i>
            <div>
              <div className="text-sm text-purple-600 font-medium">Funciones</div>
              <div className="text-lg font-bold text-purple-800">{selectedFunctions.length}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPanel;
