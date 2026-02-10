// ===============================
// STORAGE UTILITIES - PRESUPUESTOS APP
// ===============================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_CONFIG } from '../constants/config';

// ===============================
// TYPES
// ===============================

type StorageKey = keyof typeof STORAGE_CONFIG.KEYS;

interface StorageOptions {
  encrypt?: boolean;
  expiry?: number; // timestamp
}

interface StorageItem<T> {
  data: T;
  timestamp: number;
  expiry?: number;
}

// ===============================
// STORAGE FUNCTIONS
// ===============================

/**
 * Guardar datos en AsyncStorage
 */
export const setItem = async <T>(
  key: string,
  value: T,
  options?: StorageOptions
): Promise<void> => {
  try {
    const storageItem: StorageItem<T> = {
      data: value,
      timestamp: Date.now(),
      expiry: options?.expiry,
    };

    const serializedValue = JSON.stringify(storageItem);
    await AsyncStorage.setItem(key, serializedValue);

    if (__DEV__) {
      console.log(`💾 Stored item: ${key}`, value);
    }
  } catch (error) {
    console.error(`Error storing item ${key}:`, error);
    throw error;
  }
};

/**
 * Obtener datos de AsyncStorage
 */
export const getItem = async <T>(key: string): Promise<T | null> => {
  try {
    const serializedValue = await AsyncStorage.getItem(key);

    if (!serializedValue) {
      return null;
    }

    const storageItem: StorageItem<T> = JSON.parse(serializedValue);

    // Verificar si el item ha expirado
    if (storageItem.expiry && Date.now() > storageItem.expiry) {
      await removeItem(key);
      return null;
    }

    if (__DEV__) {
      console.log(`📖 Retrieved item: ${key}`, storageItem.data);
    }

    return storageItem.data;
  } catch (error) {
    console.error(`Error retrieving item ${key}:`, error);
    return null;
  }
};

/**
 * Eliminar un item de AsyncStorage
 */
export const removeItem = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);

    if (__DEV__) {
      console.log(`🗑️ Removed item: ${key}`);
    }
  } catch (error) {
    console.error(`Error removing item ${key}:`, error);
    throw error;
  }
};

/**
 * Eliminar múltiples items de AsyncStorage
 */
export const removeItems = async (keys: string[]): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(keys);

    if (__DEV__) {
      console.log(`🗑️ Removed items:`, keys);
    }
  } catch (error) {
    console.error('Error removing multiple items:', error);
    throw error;
  }
};

/**
 * Limpiar todo AsyncStorage
 */
export const clearStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();

    if (__DEV__) {
      console.log('🧹 Cleared all storage');
    }
  } catch (error) {
    console.error('Error clearing storage:', error);
    throw error;
  }
};

/**
 * Obtener todas las claves almacenadas
 */
export const getAllKeys = async (): Promise<string[]> => {
  try {
    return await AsyncStorage.getAllKeys();
  } catch (error) {
    console.error('Error getting all keys:', error);
    return [];
  }
};

/**
 * Obtener múltiples items
 */
export const getMultiple = async <T>(keys: string[]): Promise<Record<string, T | null>> => {
  try {
    const results = await AsyncStorage.multiGet(keys);
    const data: Record<string, T | null> = {};

    results.forEach(([key, value]) => {
      if (value) {
        try {
          const storageItem: StorageItem<T> = JSON.parse(value);

          // Verificar expiry
          if (storageItem.expiry && Date.now() > storageItem.expiry) {
            data[key] = null;
            removeItem(key); // Eliminar item expirado
          } else {
            data[key] = storageItem.data;
          }
        } catch (parseError) {
          data[key] = null;
        }
      } else {
        data[key] = null;
      }
    });

    return data;
  } catch (error) {
    console.error('Error getting multiple items:', error);
    return {};
  }
};

/**
 * Verificar si existe un item
 */
export const hasItem = async (key: string): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value !== null;
  } catch (error) {
    console.error(`Error checking item ${key}:`, error);
    return false;
  }
};

/**
 * Obtener el tamaño de un item en bytes
 */
export const getItemSize = async (key: string): Promise<number> => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? new Blob([value]).size : 0;
  } catch (error) {
    console.error(`Error getting size of item ${key}:`, error);
    return 0;
  }
};

/**
 * Obtener el tamaño total del storage
 */
export const getStorageSize = async (): Promise<number> => {
  try {
    const keys = await getAllKeys();
    let totalSize = 0;

    for (const key of keys) {
      totalSize += await getItemSize(key);
    }

    return totalSize;
  } catch (error) {
    console.error('Error getting storage size:', error);
    return 0;
  }
};

// ===============================
// SPECIFIC STORAGE FUNCTIONS
// ===============================

/**
 * Guardar token de autenticación
 */
export const setAuthToken = async (token: string): Promise<void> => {
  await setItem(STORAGE_CONFIG.KEYS.AUTH_TOKEN, token);
};

/**
 * Obtener token de autenticación
 */
export const getAuthToken = async (): Promise<string | null> => {
  return getItem<string>(STORAGE_CONFIG.KEYS.AUTH_TOKEN);
};

/**
 * Eliminar token de autenticación
 */
export const removeAuthToken = async (): Promise<void> => {
  await removeItem(STORAGE_CONFIG.KEYS.AUTH_TOKEN);
};

/**
 * Guardar datos de usuario
 */
export const setUserData = async (user: any): Promise<void> => {
  await setItem(STORAGE_CONFIG.KEYS.USER_DATA, user);
};

/**
 * Obtener datos de usuario
 */
export const getUserData = async (): Promise<any | null> => {
  return getItem(STORAGE_CONFIG.KEYS.USER_DATA);
};

/**
 * Eliminar datos de usuario
 */
export const removeUserData = async (): Promise<void> => {
  await removeItem(STORAGE_CONFIG.KEYS.USER_DATA);
};

/**
 * Guardar carrito de compras
 */
export const setCartData = async (cart: any): Promise<void> => {
  await setItem(STORAGE_CONFIG.KEYS.CART_DATA, cart);
};

/**
 * Obtener carrito de compras
 */
export const getCartData = async (): Promise<any | null> => {
  return getItem(STORAGE_CONFIG.KEYS.CART_DATA);
};

/**
 * Eliminar carrito de compras
 */
export const removeCartData = async (): Promise<void> => {
  await removeItem(STORAGE_CONFIG.KEYS.CART_DATA);
};

/**
 * Guardar tema de la aplicación
 */
export const setTheme = async (theme: 'light' | 'dark'): Promise<void> => {
  await setItem(STORAGE_CONFIG.KEYS.THEME, theme);
};

/**
 * Obtener tema de la aplicación
 */
export const getTheme = async (): Promise<'light' | 'dark' | null> => {
  return getItem<'light' | 'dark'>(STORAGE_CONFIG.KEYS.THEME);
};

/**
 * Guardar estado de onboarding
 */
export const setOnboardingCompleted = async (completed: boolean): Promise<void> => {
  await setItem(STORAGE_CONFIG.KEYS.ONBOARDING, completed);
};

/**
 * Verificar si se completó el onboarding
 */
export const getOnboardingCompleted = async (): Promise<boolean> => {
  const completed = await getItem<boolean>(STORAGE_CONFIG.KEYS.ONBOARDING);
  return completed || false;
};

/**
 * Guardar timestamp de última sincronización
 */
export const setLastSync = async (timestamp: number): Promise<void> => {
  await setItem(STORAGE_CONFIG.KEYS.LAST_SYNC, timestamp);
};

/**
 * Obtener timestamp de última sincronización
 */
export const getLastSync = async (): Promise<number | null> => {
  return getItem<number>(STORAGE_CONFIG.KEYS.LAST_SYNC);
};

/**
 * Guardar cola offline
 */
export const setOfflineQueue = async (queue: any[]): Promise<void> => {
  await setItem(STORAGE_CONFIG.KEYS.OFFLINE_QUEUE, queue);
};

/**
 * Obtener cola offline
 */
export const getOfflineQueue = async (): Promise<any[]> => {
  const queue = await getItem<any[]>(STORAGE_CONFIG.KEYS.OFFLINE_QUEUE);
  return queue || [];
};

/**
 * Limpiar cola offline
 */
export const clearOfflineQueue = async (): Promise<void> => {
  await removeItem(STORAGE_CONFIG.KEYS.OFFLINE_QUEUE);
};

// ===============================
// CACHE FUNCTIONS
// ===============================

/**
 * Guardar en cache con TTL
 */
export const setCacheItem = async <T>(
  key: string,
  value: T,
  ttl: number
): Promise<void> => {
  const expiry = Date.now() + ttl;
  await setItem(key, value, { expiry });
};

/**
 * Obtener item de cache
 */
export const getCacheItem = async <T>(key: string): Promise<T | null> => {
  return getItem<T>(key);
};

/**
 * Verificar si item de cache es válido
 */
export const isCacheValid = async (key: string): Promise<boolean> => {
  try {
    const serializedValue = await AsyncStorage.getItem(key);

    if (!serializedValue) {
      return false;
    }

    const storageItem: StorageItem<any> = JSON.parse(serializedValue);

    if (storageItem.expiry && Date.now() > storageItem.expiry) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Limpiar cache expirado
 */
export const cleanExpiredCache = async (): Promise<void> => {
  try {
    const keys = await getAllKeys();
    const expiredKeys: string[] = [];

    for (const key of keys) {
      if (!(await isCacheValid(key))) {
        expiredKeys.push(key);
      }
    }

    if (expiredKeys.length > 0) {
      await removeItems(expiredKeys);

      if (__DEV__) {
        console.log(`🧹 Cleaned expired cache items:`, expiredKeys);
      }
    }
  } catch (error) {
    console.error('Error cleaning expired cache:', error);
  }
};

// ===============================
// EXPORT DEFAULT
// ===============================

export default {
  setItem,
  getItem,
  removeItem,
  removeItems,
  clearStorage,
  getAllKeys,
  getMultiple,
  hasItem,
  getItemSize,
  getStorageSize,
  setAuthToken,
  getAuthToken,
  removeAuthToken,
  setUserData,
  getUserData,
  removeUserData,
  setCartData,
  getCartData,
  removeCartData,
  setTheme,
  getTheme,
  setOnboardingCompleted,
  getOnboardingCompleted,
  setLastSync,
  getLastSync,
  setOfflineQueue,
  getOfflineQueue,
  clearOfflineQueue,
  setCacheItem,
  getCacheItem,
  isCacheValid,
  cleanExpiredCache,
};