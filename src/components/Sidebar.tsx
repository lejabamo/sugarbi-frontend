import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  ChatBubbleLeftRightIcon, 
  ChartBarIcon, 
  CubeIcon
} from '@heroicons/react/24/outline';
import { colors } from '../styles/colors';

const Sidebar: React.FC = () => {
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Chatbot', href: '/chatbot', icon: ChatBubbleLeftRightIcon },
    { name: 'Análisis OLAP', href: '/olap', icon: CubeIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  ];

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r border-gray-200">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg mr-3" style={{ backgroundColor: colors.sequential.green[50] }}>
              <img 
                src="/sugarbi.png" 
                alt="SugarBI Logo" 
                className="w-6 h-6 object-contain"
                onError={(e) => {
                  // Fallback a SVG si la imagen no se carga
                  e.currentTarget.style.display = 'none';
                  const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                  if (nextElement) {
                    nextElement.style.display = 'block';
                  }
                }}
              />
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'none' }}>
                {/* Caña de azúcar con tronco verde y hojitas amarillas */}
                <path d="M5 1C5 0.447715 5.44772 0 6 0H14C14.5523 0 15 0.447715 15 1V19C15 19.5523 14.5523 20 14 20H6C5.44772 20 5 19.5523 5 19V1Z" fill="#16a34a"/>
                
                {/* Nudos de la caña */}
                <rect x="6" y="3" width="8" height="1" fill="#15803d"/>
                <rect x="6" y="6" width="8" height="1" fill="#15803d"/>
                <rect x="6" y="9" width="8" height="1" fill="#15803d"/>
                <rect x="6" y="12" width="8" height="1" fill="#15803d"/>
                <rect x="6" y="15" width="8" height="1" fill="#15803d"/>
                
                {/* Hojitas amarillas */}
                <path d="M3 4C3 3.44772 3.44772 3 4 3C4.55228 3 5 3.44772 5 4V8C5 8.55228 4.55228 9 4 9C3.44772 9 3 8.55228 3 8V4Z" fill="#fbbf24"/>
                <path d="M17 4C17 3.44772 16.5523 3 16 3C15.4477 3 15 3.44772 15 4V8C15 8.55228 15.4477 9 16 9C16.5523 9 17 8.55228 17 8V4Z" fill="#fbbf24"/>
                <path d="M3 12C3 11.4477 3.44772 11 4 11C4.55228 11 5 11.4477 5 12V16C5 16.5523 4.55228 17 4 17C3.44772 17 3 16.5523 3 16V12Z" fill="#fbbf24"/>
                <path d="M17 12C17 11.4477 16.5523 11 16 11C15.4477 11 15 11.4477 15 12V16C15 16.5523 15.4477 17 16 17C16.5523 17 17 16.5523 17 16V12Z" fill="#fbbf24"/>
                
                {/* Detalles de textura */}
                <path d="M6 1H14V3H6V1Z" fill="#15803d"/>
                <path d="M6 5H14V7H6V5Z" fill="#15803d"/>
                <path d="M6 9H14V11H6V9Z" fill="#15803d"/>
                <path d="M6 13H14V15H6V13Z" fill="#15803d"/>
                <path d="M6 17H14V19H6V17Z" fill="#15803d"/>
              </svg>
            </div>
            <span className="text-xl font-semibold" style={{ color: colors.qualitative.primary }}>SugarBI</span>
          </div>
        </div>
        
        {/* Navegación */}
        <div className="mt-8 flex-grow flex flex-col">
          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-100 text-primary-900 border-r-2 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon
                  className="mr-3 h-5 w-5 flex-shrink-0"
                  aria-hidden="true"
                />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
        
        {/* Footer del sidebar */}
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-sm font-medium">U</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Usuario</p>
              <p className="text-xs text-gray-500">Administrador</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
