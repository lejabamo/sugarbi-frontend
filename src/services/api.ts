import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';

// Configuración de la API
const API_BASE_URL = 'http://localhost:5001';

// Crear instancia de axios
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Para cookies de autenticación
});

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api;
