import axios from 'axios';

const api = axios.create({
  // Utiliza la variable de entorno si existe (para local), de lo contrario usa la de producción
  baseURL: import.meta.env.VITE_API_URL || 'https://backend-sistema-experto-6f5f.onrender.com/api/',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['X-API-KEY'] = '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08';
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Ignorar el 401 si viene del endpoint de login, para poder mostrar el error
      if (error.config.url === 'token/' || error.config.url === 'token/refresh/') {
        return Promise.reject(error);
      }
      // El token ha expirado o es inválido
      localStorage.removeItem('access_token');
      // Recargar la página para que App.tsx fuerce el regreso a la pantalla de Login
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
