// Paleta de colores para SugarBI Dashboard
// Basada en las mejores prácticas de visualización de datos de Atlassian
// https://www.atlassian.com/data/charts/how-to-choose-colors-data-visualization

export const colors = {
  // Colores cualitativos para categorías
  qualitative: {
    primary: '#2563eb',      // Azul - Confianza, datos principales
    success: '#16a34a',      // Verde - Éxito, crecimiento, producción
    warning: '#ea580c',      // Naranja - Advertencia, atención
    danger: '#dc2626',       // Rojo - Peligro, alertas
    info: '#0891b2',         // Cian - Información, datos secundarios
    purple: '#7c3aed',       // Púrpura - Datos especiales
  },

  // Colores secuenciales para valores numéricos
  sequential: {
    blue: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    green: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    orange: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316',
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
    },
    purple: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7c3aed',
      800: '#6b21a8',
      900: '#581c87',
    }
  },

  // Colores divergentes para comparaciones
  diverging: {
    redBlue: {
      red: '#dc2626',
      redLight: '#fca5a5',
      neutral: '#6b7280',
      blueLight: '#93c5fd',
      blue: '#2563eb',
    },
    greenRed: {
      green: '#16a34a',
      greenLight: '#86efac',
      neutral: '#6b7280',
      redLight: '#fca5a5',
      red: '#dc2626',
    }
  },

  // Colores neutros para fondos y texto
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Colores específicos para el contexto agrícola
  agricultural: {
    sugar: '#fbbf24',        // Amarillo - Caña de azúcar
    soil: '#92400e',         // Marrón - Tierra
    leaf: '#16a34a',         // Verde - Hojas, crecimiento
    water: '#0ea5e9',        // Azul claro - Agua, riego
    sun: '#f59e0b',          // Naranja - Sol, energía
  },

  // Colores para estados y métricas
  status: {
    excellent: '#16a34a',    // Verde - Excelente
    good: '#22c55e',         // Verde claro - Bueno
    average: '#eab308',      // Amarillo - Promedio
    poor: '#f97316',         // Naranja - Malo
    critical: '#dc2626',     // Rojo - Crítico
  },

  // Colores para gráficos específicos
  chart: {
    // Colores para gráficos de barras
    bar: {
      primary: '#2563eb',
      secondary: '#16a34a',
      tertiary: '#ea580c',
      quaternary: '#7c3aed',
    },
    // Colores para gráficos de líneas
    line: {
      production: '#2563eb',
      quality: '#16a34a',
      efficiency: '#ea580c',
      trend: '#7c3aed',
    },
    // Colores para gráficos de pastel
    pie: {
      finca1: '#2563eb',
      finca2: '#16a34a',
      finca3: '#ea580c',
      finca4: '#7c3aed',
      finca5: '#0891b2',
      other: '#6b7280',
    }
  }
};

// Función para obtener colores con opacidad
export const withOpacity = (color: string, opacity: number): string => {
  // Convertir hex a rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Función para generar gradientes
export const createGradient = (color1: string, color2: string, direction: string = 'to right'): string => {
  return `linear-gradient(${direction}, ${color1}, ${color2})`;
};
