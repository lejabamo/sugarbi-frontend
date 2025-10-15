import api from './api';

// Tipos de datos para autenticación
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
  error?: string;
}

// Servicio de autenticación
class AuthService {
  // Iniciar sesión
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/api/login', credentials);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al iniciar sesión'
      };
    }
  }

  // Cerrar sesión
  async logout(): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/api/logout');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al cerrar sesión'
      };
    }
  }

  // Registro de usuario
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al registrarse'
      };
    }
  }

  // Obtener usuario actual
  async getCurrentUser(): Promise<AuthResponse> {
    try {
      const response = await api.get('/auth/api/user/me');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'No hay sesión activa'
      };
    }
  }

  // Verificar si hay sesión activa
  async checkAuth(): Promise<boolean> {
    try {
      const response = await this.getCurrentUser();
      return response.success;
    } catch {
      return false;
    }
  }
}

export const authService = new AuthService();
