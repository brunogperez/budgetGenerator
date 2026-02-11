// ===============================
// API CLIENT - PRESUPUESTOS APP
// ===============================

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { ApiResponse } from '../types';
import { STORAGE_CONFIG, API_CONFIG, ERROR_CONFIG } from '../constants/config';

declare const global: { navigationRef?: any };

// ===============================
// CONFIGURACIÓN BASE
// ===============================

const API_URL = Constants.expoConfig?.extra?.apiUrl || API_CONFIG.BASE_URL;

// ===============================
// CREAR INSTANCIA DE AXIOS
// ===============================

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// ===============================
// INTERCEPTOR DE REQUEST
// ===============================

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Agregar token de autenticación si existe
      const token = await AsyncStorage.getItem(STORAGE_CONFIG.KEYS.AUTH_TOKEN);
      if (token) {
        config.headers.set('Authorization', `Bearer ${token}`);
      }

      // Log de request en desarrollo
      if (__DEV__) {
        console.log('🚀 API Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          data: config.data,
          headers: config.headers,
        });
      }

      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      return config;
    }
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// ===============================
// INTERCEPTOR DE RESPONSE
// ===============================

api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log de response en desarrollo
    if (__DEV__) {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log de error en desarrollo
    if (__DEV__) {
      console.error('❌ API Error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
        data: error.response?.data,
      });
    }

    // Manejar token expirado (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Limpiar datos de autenticación
        await AsyncStorage.multiRemove([
          STORAGE_CONFIG.KEYS.AUTH_TOKEN,
          STORAGE_CONFIG.KEYS.USER_DATA,
        ]);

        // Emitir evento para redirigir a login
        // Nota: Esto se puede manejar mejor con un context o event emitter
        if (global.navigationRef) {
          global.navigationRef.navigate('Auth');
        }
      } catch (storageError) {
        console.error('Error clearing auth data:', storageError);
      }
    }

    // Retry logic para errores de red
    if (
      error.code === 'NETWORK_ERROR' ||
      error.code === 'ECONNREFUSED' ||
      error.response?.status >= 500
    ) {
      const retryCount = originalRequest._retryCount || 0;

      if (retryCount < ERROR_CONFIG.RETRY_ATTEMPTS) {
        originalRequest._retryCount = retryCount + 1;

        // Esperar antes del retry
        await new Promise(resolve =>
          setTimeout(resolve, ERROR_CONFIG.RETRY_DELAY * (retryCount + 1))
        );

        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

// ===============================
// HELPER FUNCTIONS
// ===============================

/**
 * Wrapper para requests GET
 */
export const get = async <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response = await api.get(url, config);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Wrapper para requests POST
 */
export const post = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response = await api.post(url, data, config);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Wrapper para requests PUT
 */
export const put = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response = await api.put(url, data, config);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Wrapper para requests DELETE
 */
export const del = async <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response = await api.delete(url, config);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Wrapper para requests PATCH
 */
export const patch = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response = await api.patch(url, data, config);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Manejo centralizado de errores de API
 */
const handleApiError = (error: any) => {
  let errorMessage = 'Error de conexión';
  let errorCode = 'NETWORK_ERROR';
  let errorDetails = null;

  if (error.response) {
    // Error de respuesta del servidor
    const { status, data } = error.response;
    errorMessage = data?.message || `Error ${status}`;
    errorCode = data?.error?.code || `HTTP_${status}`;
    errorDetails = data?.error?.details || null;
  } else if (error.request) {
    // Error de red
    errorMessage = 'No se pudo conectar con el servidor';
    errorCode = 'NETWORK_ERROR';
  } else {
    // Error de configuración
    errorMessage = error.message || 'Error desconocido';
    errorCode = 'CONFIG_ERROR';
  }

  return {
    success: false,
    message: errorMessage,
    error: {
      code: errorCode,
      details: errorDetails,
    },
  };
};

/**
 * Función para establecer el token de autenticación
 */
export const setAuthToken = async (token: string | null) => {
  if (token) {
    await AsyncStorage.setItem(STORAGE_CONFIG.KEYS.AUTH_TOKEN, token);
    api.defaults.headers.Authorization = `Bearer ${token}`;
  } else {
    await AsyncStorage.removeItem(STORAGE_CONFIG.KEYS.AUTH_TOKEN);
    delete api.defaults.headers.Authorization;
  }
};

/**
 * Función para limpiar datos de autenticación
 */
export const clearAuth = async () => {
  await AsyncStorage.multiRemove([
    STORAGE_CONFIG.KEYS.AUTH_TOKEN,
    STORAGE_CONFIG.KEYS.USER_DATA,
  ]);
  delete api.defaults.headers.Authorization;
};

/**
 * Función para verificar conectividad
 */
export const checkConnectivity = async (): Promise<boolean> => {
  try {
    const response = await api.get('/health', { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

/**
 * Función para upload de archivos
 */
export const uploadFile = async (
  url: string,
  file: any,
  onProgress?: (progress: number) => void
): Promise<ApiResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      },
    });

    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Función para download de archivos
 */
export const downloadFile = async (
  url: string,
  onProgress?: (progress: number) => void
): Promise<Blob> => {
  try {
    const response = await api.get(url, {
      responseType: 'blob',
      onDownloadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      },
    });

    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Función para cancelar requests
 */
export const createCancelToken = () => {
  return axios.CancelToken.source();
};

/**
 * Función para verificar si un error es de cancelación
 */
export const isCancel = (error: any): boolean => {
  return axios.isCancel(error);
};

/**
 * Función para obtener información del API
 */
export const getApiInfo = () => {
  return {
    baseURL: API_URL,
    timeout: API_CONFIG.TIMEOUT,
    retryAttempts: ERROR_CONFIG.RETRY_ATTEMPTS,
    retryDelay: ERROR_CONFIG.RETRY_DELAY,
  };
};

// ===============================
// EXPORT DEFAULT
// ===============================

export default api;