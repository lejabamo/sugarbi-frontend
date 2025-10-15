import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Bars3Icon, BellIcon } from '@heroicons/react/24/outline';
import { colors } from '../styles/colors';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Lado izquierdo */}
        <div className="flex items-center">
          <button className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          {/* Logo SugarBI con icono de caña de azúcar */}
          <div className="flex items-center ml-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg mr-3" style={{ backgroundColor: colors.sequential.green[50] }}>
              <img 
                src="/sugarbi.png" 
                alt="SugarBI Logo" 
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  // Fallback a SVG si la imagen no se carga
                  e.currentTarget.style.display = 'none';
                  const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                  if (nextElement) {
                    nextElement.style.display = 'block';
                  }
                }}
              />
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'none' }}>
                {/* Caña de azúcar con tronco verde y hojitas amarillas */}
                <path d="M6 2C6 1.44772 6.44772 1 7 1H17C17.5523 1 18 1.44772 18 2V22C18 22.5523 17.5523 23 17 23H7C6.44772 23 6 22.5523 6 22V2Z" fill="#16a34a"/>
                
                {/* Nudos de la caña */}
                <rect x="7" y="4" width="10" height="1.5" fill="#15803d"/>
                <rect x="7" y="7" width="10" height="1.5" fill="#15803d"/>
                <rect x="7" y="10" width="10" height="1.5" fill="#15803d"/>
                <rect x="7" y="13" width="10" height="1.5" fill="#15803d"/>
                <rect x="7" y="16" width="10" height="1.5" fill="#15803d"/>
                <rect x="7" y="19" width="10" height="1.5" fill="#15803d"/>
                
                {/* Hojitas amarillas */}
                <path d="M4 5C4 4.44772 4.44772 4 5 4C5.55228 4 6 4.44772 6 5V9C6 9.55228 5.55228 10 5 10C4.44772 10 4 9.55228 4 9V5Z" fill="#fbbf24"/>
                <path d="M20 5C20 4.44772 19.5523 4 19 4C18.4477 4 18 4.44772 18 5V9C18 9.55228 18.4477 10 19 10C19.5523 10 20 9.55228 20 9V5Z" fill="#fbbf24"/>
                <path d="M4 13C4 12.4477 4.44772 12 5 12C5.55228 12 6 12.4477 6 13V17C6 17.5523 5.55228 18 5 18C4.44772 18 4 17.5523 4 17V13Z" fill="#fbbf24"/>
                <path d="M20 13C20 12.4477 19.5523 12 19 12C18.4477 12 18 12.4477 18 13V17C18 17.5523 18.4477 18 19 18C19.5523 18 20 17.5523 20 17V13Z" fill="#fbbf24"/>
                
                {/* Detalles de textura */}
                <path d="M7 2H17V4H7V2Z" fill="#15803d"/>
                <path d="M7 6H17V8H7V6Z" fill="#15803d"/>
                <path d="M7 10H17V12H7V10Z" fill="#15803d"/>
                <path d="M7 14H17V16H7V14Z" fill="#15803d"/>
                <path d="M7 18H17V20H7V18Z" fill="#15803d"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: colors.qualitative.primary }}>
                SugarBI
              </h1>
              <p className="text-xs text-gray-500 -mt-1">Sistema de Business Intelligence</p>
            </div>
          </div>
        </div>
        
        {/* Lado derecho */}
        <div className="flex items-center space-x-4">
          {/* Notificaciones */}
          <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full">
            <BellIcon className="h-6 w-6" />
          </button>
          
          {/* Usuario */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.username || 'Usuario'}
              </p>
              <p className="text-xs text-gray-500">
                {user?.role || 'Administrador'}
              </p>
            </div>
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <button
              onClick={logout}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
