// api/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'https://http://192.168.0.32:8000/api', // Ajusta a tu URL real
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor para incluir el token en las peticiones
api.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  response => response,
  async error => {
    // Si el error es 401 (no autorizado), podemos realizar un logout
    if (error.response && error.response.status === 401) {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      // Aquí podrías implementar alguna forma de redirigir al login
    }
    return Promise.reject(error);
  }
);

export default api;