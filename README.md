# SugarBI Frontend

Sistema de Business Intelligence para análisis de datos de cosecha de caña de azúcar.

## 🚀 Características

- **Dashboard Interactivo**: Visualizaciones en tiempo real con filtros inteligentes
- **Chatbot Inteligente**: Consultas en lenguaje natural con LangChain
- **Análisis OLAP**: Operaciones multidimensionales avanzadas
- **Diseño Responsivo**: Optimizado para móviles, tablets y desktop
- **Filtros Inteligentes**: Sistema anti-bobos con validación secuencial
- **Exportación de Datos**: CSV, Excel, PDF

## 🛠️ Tecnologías

- **React 19** con TypeScript
- **Vite** para desarrollo y build
- **Tailwind CSS** para estilos
- **Chart.js** para visualizaciones
- **Axios** para API calls
- **React Router** para navegación

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## 🔧 Variables de Entorno

Crear archivo `.env`:

```env
VITE_API_BASE_URL=http://localhost:5001
VITE_APP_NAME=SugarBI
```

## 📱 Responsive Design

- **Mobile First**: Diseño optimizado para móviles
- **Hamburger Menu**: Navegación deslizable en móvil
- **Filter Sidebar**: Panel de filtros con overlay en móvil
- **Adaptive Charts**: Gráficos que se ajustan al dispositivo

## 🎯 Funcionalidades

### Dashboard
- Tarjetas de estadísticas en tiempo real
- Gráficos interactivos (barras, líneas, doughnut)
- Tabla de datos con exportación
- Filtros inteligentes con validación

### Chatbot
- Consultas en lenguaje natural
- Visualizaciones automáticas
- Ejemplos de consultas predefinidas
- Exportación de resultados

### OLAP Analytics
- Operaciones multidimensionales
- Auto-ejecución con configuración por defecto
- Visualizaciones dinámicas
- Tabla de datos del cubo

## 🚀 Deployment

### Build para Producción
```bash
npm run build
```

### Servidor Web
El build genera archivos estáticos en `dist/` que pueden servirse con:
- Nginx
- Apache
- Netlify
- Vercel
- Cualquier servidor web estático

### Docker (Opcional)
```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 📊 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Chart.tsx       # Gráficos
│   ├── DataTable.tsx   # Tabla con exportación
│   ├── SmartFilters.tsx # Filtros inteligentes
│   └── ...
├── hooks/              # Custom hooks
│   ├── useSmartFilters.ts
│   └── useReactiveFilters.ts
├── pages/              # Páginas principales
│   ├── Dashboard.tsx
│   ├── Chatbot.tsx
│   └── OLAPAnalytics.tsx
├── services/           # Servicios API
│   └── sugarbiService.ts
└── styles/            # Estilos personalizados
```

## 🔗 Integración Backend

Requiere el backend SugarBI corriendo en `http://localhost:5001` con:
- API REST para datos
- Endpoints de filtros inteligentes
- Integración LangChain para chatbot
- Motor OLAP para análisis multidimensional

## 📝 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run preview` - Preview del build
- `npm run lint` - Linter de código

## 🐛 Troubleshooting

### Problemas Comunes

1. **Error de CORS**: Verificar configuración del backend
2. **Filtros no cargan**: Verificar conexión a API
3. **Charts no renderizan**: Verificar datos y configuración Chart.js
4. **Build falla**: Verificar versiones de Node.js y dependencias

### Logs de Desarrollo
```bash
# Habilitar logs detallados
VITE_DEBUG=true npm run dev
```