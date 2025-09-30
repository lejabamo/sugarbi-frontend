import React, { useState, useMemo } from 'react';
import type { CosechaData } from '../services/sugarbiService';

interface DataTableProps {
  data: CosechaData[];
  title?: string;
  showExport?: boolean;
}

const DataTable: React.FC<DataTableProps> = ({ 
  data, 
  title = "Datos de Cosecha",
  showExport = true 
}) => {
  const [sortField, setSortField] = useState<keyof CosechaData>('toneladas_cana_molida');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Función para exportar a CSV
  const exportToCSV = () => {
    const headers = [
      'Finca',
      'Variedad', 
      'Zona',
      'Año',
      'Mes',
      'Toneladas Caña Molida',
      'TCH (t/ha)',
      'Área Cosechada',
      'Brix (%)',
      'Sacarosa (%)',
      'Rendimiento Teórico'
    ];
    
    const csvContent = [
      headers.join(','),
      ...data.map(row => [
        `"${row.nombre_finca || ''}"`,
        `"${row.nombre_variedad || ''}"`,
        `"${row.nombre_zona || ''}"`,
        row.año || '',
        row.mes || '',
        row.toneladas_cana_molida || 0,
        row.tch || 0,
        row.area_cosechada || 0,
        row.brix || 0,
        row.sacarosa || 0,
        row.rendimiento_teorico || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `cosecha_data_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Función para exportar a Excel (usando CSV con extensión .xlsx)
  const exportToExcel = () => {
    const headers = [
      'Finca',
      'Variedad', 
      'Zona',
      'Año',
      'Mes',
      'Toneladas Caña Molida',
      'TCH (t/ha)',
      'Área Cosechada',
      'Brix (%)',
      'Sacarosa (%)',
      'Rendimiento Teórico'
    ];
    
    const csvContent = [
      headers.join('\t'),
      ...data.map(row => [
        row.nombre_finca || '',
        row.nombre_variedad || '',
        row.nombre_zona || '',
        row.año || '',
        row.mes || '',
        row.toneladas_cana_molida || 0,
        row.tch || 0,
        row.area_cosechada || 0,
        row.brix || 0,
        row.sacarosa || 0,
        row.rendimiento_teorico || 0
      ].join('\t'))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `cosecha_data_${new Date().toISOString().split('T')[0]}.xlsx`;
    link.click();
  };

  // Función para exportar a PDF
  const exportToPDF = () => {
    // Crear una nueva ventana para el PDF
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #2563eb; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f8fafc; font-weight: bold; }
            .summary { margin-bottom: 20px; padding: 15px; background-color: #f1f5f9; border-radius: 5px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <div class="summary">
            <strong>Resumen:</strong> ${data.length} registros encontrados<br>
            <strong>Fecha de exportación:</strong> ${new Date().toLocaleDateString()}
          </div>
          <table>
            <thead>
              <tr>
                <th>Finca</th>
                <th>Variedad</th>
                <th>Zona</th>
                <th>Año</th>
                <th>Mes</th>
                <th>Toneladas</th>
                <th>TCH</th>
                <th>Área</th>
                <th>Brix</th>
                <th>Sacarosa</th>
                <th>Rendimiento</th>
              </tr>
            </thead>
            <tbody>
              ${data.map(row => `
                <tr>
                  <td>${row.nombre_finca || ''}</td>
                  <td>${row.nombre_variedad || ''}</td>
                  <td>${row.nombre_zona || ''}</td>
                  <td>${row.año || ''}</td>
                  <td>${row.mes || ''}</td>
                  <td>${(row.toneladas_cana_molida || 0).toLocaleString()}</td>
                  <td>${(row.tch || 0).toFixed(2)}</td>
                  <td>${(row.area_cosechada || 0).toLocaleString()}</td>
                  <td>${(row.brix || 0).toFixed(2)}</td>
                  <td>${(row.sacarosa || 0).toFixed(2)}</td>
                  <td>${(row.rendimiento_teorico || 0).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  // Filtrar y ordenar datos
  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (item.nombre_finca?.toLowerCase().includes(searchLower)) ||
        (item.nombre_variedad?.toLowerCase().includes(searchLower)) ||
        (item.nombre_zona?.toLowerCase().includes(searchLower)) ||
        (item.año?.toString().includes(searchLower)) ||
        (item.mes?.toString().includes(searchLower))
      );
    });

    // Ordenar
    filtered.sort((a, b) => {
      const aVal = a[sortField] || 0;
      const bVal = b[sortField] || 0;
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [data, searchTerm, sortField, sortDirection]);

  // Paginación
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredAndSortedData.slice(startIndex, endIndex);

  const handleSort = (field: keyof CosechaData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: keyof CosechaData) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  if (data.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <i className="fas fa-table text-gray-400 text-4xl mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay datos disponibles</h3>
          <p className="text-gray-500">Aplica filtros para ver los datos de cosecha</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">
            {filteredAndSortedData.length} registros encontrados
          </p>
        </div>
        
        {showExport && (
          <div className="flex space-x-2">
            <button
              onClick={exportToCSV}
              className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
            >
              <i className="fas fa-file-csv mr-1"></i>
              CSV
            </button>
            <button
              onClick={exportToExcel}
              className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
            >
              <i className="fas fa-file-excel mr-1"></i>
              Excel
            </button>
            <button
              onClick={exportToPDF}
              className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
            >
              <i className="fas fa-file-pdf mr-1"></i>
              PDF
            </button>
          </div>
        )}
      </div>

      {/* Controles */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <i className="fas fa-search absolute left-2 top-2 text-gray-400"></i>
          </div>
          
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="text-sm border border-gray-300 rounded-md px-2 py-1"
          >
            <option value={10}>10 por página</option>
            <option value={25}>25 por página</option>
            <option value={50}>50 por página</option>
            <option value={100}>100 por página</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('nombre_finca')}
              >
                Finca {getSortIcon('nombre_finca')}
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('nombre_variedad')}
              >
                Variedad {getSortIcon('nombre_variedad')}
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('nombre_zona')}
              >
                Zona {getSortIcon('nombre_zona')}
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('año')}
              >
                Año {getSortIcon('año')}
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('mes')}
              >
                Mes {getSortIcon('mes')}
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('toneladas_cana_molida')}
              >
                Toneladas {getSortIcon('toneladas_cana_molida')}
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('tch')}
              >
                TCH {getSortIcon('tch')}
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('brix')}
              >
                Brix {getSortIcon('brix')}
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('sacarosa')}
              >
                Sacarosa {getSortIcon('sacarosa')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {row.nombre_finca || 'N/A'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {row.nombre_variedad || 'N/A'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {row.nombre_zona || 'N/A'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {row.año || 'N/A'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {row.mes || 'N/A'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {(row.toneladas_cana_molida || 0).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {(row.tch || 0).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {(row.brix || 0).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {(row.sacarosa || 0).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500">
            Mostrando {startIndex + 1} a {Math.min(endIndex, filteredAndSortedData.length)} de {filteredAndSortedData.length} registros
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Anterior
            </button>
            <span className="px-3 py-1 text-sm">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
