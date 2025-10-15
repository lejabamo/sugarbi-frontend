import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { colors } from '../styles/colors';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo y título */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: colors.sequential.green[50] }}>
            <img 
              src="/sugarbi.png" 
              alt="SugarBI Logo" 
              className="w-12 h-12 object-contain"
              onError={(e) => {
                // Fallback a SVG si la imagen no se carga
                e.currentTarget.style.display = 'none';
                const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                if (nextElement) {
                  nextElement.style.display = 'block';
                }
              }}
            />
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'none' }}>
              {/* Caña de azúcar con tronco verde y hojitas amarillas */}
              <path d="M8 4C8 2.89543 8.89543 2 10 2H22C23.1046 2 24 2.89543 24 4V28C24 29.1046 23.1046 30 22 30H10C8.89543 30 8 29.1046 8 28V4Z" fill="#16a34a"/>
              
              {/* Nudos de la caña */}
              <rect x="9" y="6" width="14" height="2" fill="#15803d"/>
              <rect x="9" y="10" width="14" height="2" fill="#15803d"/>
              <rect x="9" y="14" width="14" height="2" fill="#15803d"/>
              <rect x="9" y="18" width="14" height="2" fill="#15803d"/>
              <rect x="9" y="22" width="14" height="2" fill="#15803d"/>
              <rect x="9" y="26" width="14" height="2" fill="#15803d"/>
              
              {/* Hojitas amarillas */}
              <path d="M6 8C6 7.44772 6.44772 7 7 7C7.55228 7 8 7.44772 8 8V12C8 12.5523 7.55228 13 7 13C6.44772 13 6 12.5523 6 12V8Z" fill="#fbbf24"/>
              <path d="M26 8C26 7.44772 25.5523 7 25 7C24.4477 7 24 7.44772 24 8V12C24 12.5523 24.4477 13 25 13C25.5523 13 26 12.5523 26 12V8Z" fill="#fbbf24"/>
              <path d="M6 16C6 15.4477 6.44772 15 7 15C7.55228 15 8 15.4477 8 16V20C8 20.5523 7.55228 21 7 21C6.44772 21 6 20.5523 6 20V16Z" fill="#fbbf24"/>
              <path d="M26 16C26 15.4477 25.5523 15 25 15C24.4477 15 24 15.4477 24 16V20C24 20.5523 24.4477 21 25 21C25.5523 21 26 20.5523 26 20V16Z" fill="#fbbf24"/>
              
              {/* Detalles de textura */}
              <path d="M10 4H22V6H10V4Z" fill="#15803d"/>
              <path d="M10 8H22V10H10V8Z" fill="#15803d"/>
              <path d="M10 12H22V14H10V12Z" fill="#15803d"/>
              <path d="M10 16H22V18H10V16Z" fill="#15803d"/>
              <path d="M10 20H22V22H10V20Z" fill="#15803d"/>
              <path d="M10 24H22V26H10V24Z" fill="#15803d"/>
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold" style={{ color: colors.qualitative.primary }}>
            SugarBI
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sistema de Business Intelligence para Cosecha de Caña
          </p>
        </div>

        {/* Formulario de login */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Usuario
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="input-field mt-1"
                placeholder="Ingresa tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input-field mt-1"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Botón de submit */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: colors.qualitative.primary,
                '--hover-color': colors.sequential.blue[700]
              } as React.CSSProperties}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.sequential.blue[700];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.qualitative.primary;
              }}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Iniciando sesión...
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </div>

          {/* Información adicional */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Para desarrollo: usuario: admin, contraseña: admin
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
