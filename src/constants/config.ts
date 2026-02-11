// ===============================
// CONFIGURACIÓN - PRESUPUESTOS APP
// ===============================

import Constants from 'expo-constants';
export { COLORS } from './colors';

// ===============================
// CONFIGURACIÓN DE API
// ===============================

export const API_CONFIG = {
  BASE_URL: Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// ===============================
// CONFIGURACIÓN DE PAGINACIÓN
// ===============================

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  PRODUCTS_PER_PAGE: 20,
  QUOTES_PER_PAGE: 15,
  PAYMENTS_PER_PAGE: 15,
} as const;

// ===============================
// CONFIGURACIÓN DE CACHE
// ===============================

export const CACHE_CONFIG = {
  TTL: {
    PRODUCTS: 5 * 60 * 1000, // 5 minutos
    QUOTES: 2 * 60 * 1000,   // 2 minutos
    PAYMENTS: 30 * 1000,     // 30 segundos
    USER: 15 * 60 * 1000,    // 15 minutos
  },
} as const;

// ===============================
// CONFIGURACIÓN DE FORMULARIOS
// ===============================

export const FORM_CONFIG = {
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 8,
    MAX_NAME_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 500,
    MAX_NOTES_LENGTH: 1000,
    MIN_PRICE: 0.01,
    MAX_PRICE: 999999999,
    MIN_STOCK: 0,
    MAX_STOCK: 999999,
    MIN_QUANTITY: 1,
    MAX_QUANTITY: 1000,
  },
  DEBOUNCE_DELAY: 300, // ms para búsquedas
} as const;

// ===============================
// CONFIGURACIÓN DE QR CODES
// ===============================

export const QR_CONFIG = {
  SIZE: 250,
  ERROR_CORRECTION_LEVEL: 'M' as const,
  COLOR: '#000000',
  BACKGROUND_COLOR: '#FFFFFF',
  LOGO_SIZE: 50,
  LOGO_PADDING: 10,
  REFRESH_INTERVAL: 30000, // 30 segundos
} as const;

// ===============================
// CONFIGURACIÓN DE ANIMACIONES
// ===============================

export const ANIMATION_CONFIG = {
  DURATION: {
    SHORT: 150,
    MEDIUM: 300,
    LONG: 500,
  },
  EASING: 'ease-in-out' as const,
  SPRING: {
    DAMPING: 80,
    STIFFNESS: 200,
  },
} as const;

// ===============================
// CONFIGURACIÓN DE LAYOUT
// ===============================

export const LAYOUT = {
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
    XXL: 48,
  },
  BORDER_RADIUS: {
    SM: 4,
    MD: 8,
    LG: 12,
    XL: 16,
    PILL: 999,
  },
  HEADER_HEIGHT: 56,
  TAB_BAR_HEIGHT: 83,
  SAFE_AREA_BOTTOM: 34,
} as const;

// ===============================
// CONFIGURACIÓN DE TIPOGRAFÍA
// ===============================

export const TYPOGRAPHY = {
  FONT_SIZE: {
    XS: 12,
    SM: 14,
    MD: 16,
    LG: 18,
    XL: 20,
    XXL: 24,
    XXXL: 32,
  },
  FONT_WEIGHT: {
    LIGHT: '300' as const,
    REGULAR: '400' as const,
    MEDIUM: '500' as const,
    SEMIBOLD: '600' as const,
    BOLD: '700' as const,
  },
  LINE_HEIGHT: {
    TIGHT: 1.2,
    NORMAL: 1.4,
    RELAXED: 1.6,
  },
} as const;

// ===============================
// CONFIGURACIÓN DE NOTIFICACIONES
// ===============================

export const NOTIFICATION_CONFIG = {
  DURATION: {
    SHORT: 2000,
    MEDIUM: 4000,
    LONG: 6000,
  },
  POSITION: 'top' as const,
  MAX_VISIBLE: 3,
} as const;

// ===============================
// CONFIGURACIÓN DE STORAGE
// ===============================

export const STORAGE_CONFIG = {
  KEYS: {
    AUTH_TOKEN: 'auth_token',
    USER_DATA: 'user_data',
    CART_DATA: 'cart_data',
    THEME: 'app_theme',
    ONBOARDING: 'has_completed_onboarding',
    LAST_SYNC: 'last_sync_timestamp',
    OFFLINE_QUEUE: 'offline_queue',
  },
  ENCRYPTION: {
    ENABLED: true,
    ALGORITHM: 'AES-256-GCM',
  },
} as const;

// ===============================
// CONFIGURACIÓN DE FILTROS
// ===============================

export const FILTER_CONFIG = {
  PRODUCT_CATEGORIES: [
    'Electrónicos',
    'Computación',
    'Telefonía',
    'Hogar',
    'Oficina',
    'Gaming',
    'Audio',
    'Video',
    'Accesorios',
    'Otros',
  ],
  SORT_OPTIONS: {
    PRODUCTS: [
      { label: 'Nombre A-Z', value: 'name', order: 'asc' },
      { label: 'Nombre Z-A', value: 'name', order: 'desc' },
      { label: 'Precio menor', value: 'price', order: 'asc' },
      { label: 'Precio mayor', value: 'price', order: 'desc' },
      { label: 'Stock menor', value: 'stock', order: 'asc' },
      { label: 'Stock mayor', value: 'stock', order: 'desc' },
      { label: 'Más recientes', value: 'createdAt', order: 'desc' },
      { label: 'Más antiguos', value: 'createdAt', order: 'asc' },
    ],
    QUOTES: [
      { label: 'Más recientes', value: 'createdAt', order: 'desc' },
      { label: 'Más antiguos', value: 'createdAt', order: 'asc' },
      { label: 'Monto mayor', value: 'total', order: 'desc' },
      { label: 'Monto menor', value: 'total', order: 'asc' },
      { label: 'Número A-Z', value: 'quoteNumber', order: 'asc' },
      { label: 'Número Z-A', value: 'quoteNumber', order: 'desc' },
    ],
  },
} as const;

// ===============================
// CONFIGURACIÓN DE VALIDACIONES
// ===============================

export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  PRICE: /^\d+(\.\d{1,2})?$/,
  SKU: /^[A-Z0-9\-_]{3,20}$/i,
  QUOTE_NUMBER: /^Q-\d{8}-\d{4}$/,
} as const;

// ===============================
// CONFIGURACIÓN DE FORMATO
// ===============================

export const FORMAT_CONFIG = {
  CURRENCY: {
    LOCALE: 'es-AR',
    CURRENCY: 'ARS',
    SYMBOL: '$',
  },
  DATE: {
    LOCALE: 'es-AR',
    SHORT_FORMAT: 'dd/MM/yyyy',
    LONG_FORMAT: 'dd/MM/yyyy HH:mm',
    TIME_FORMAT: 'HH:mm',
  },
  NUMBER: {
    LOCALE: 'es-AR',
    DECIMAL_PLACES: 2,
    THOUSAND_SEPARATOR: '.',
    DECIMAL_SEPARATOR: ',',
  },
} as const;

// ===============================
// CONFIGURACIÓN DE LÍMITES
// ===============================

export const LIMITS = {
  MAX_CART_ITEMS: 50,
  MAX_QUOTE_ITEMS: 20,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_IMAGE_SIZE: 2 * 1024 * 1024, // 2MB
  MIN_SEARCH_CHARS: 2,
  MAX_SEARCH_RESULTS: 50,
} as const;

// ===============================
// CONFIGURACIÓN DE TIMEOUTS
// ===============================

export const TIMEOUTS = {
  API_REQUEST: 10000,        // 10 segundos
  IMAGE_LOAD: 15000,         // 15 segundos
  QR_REFRESH: 30000,         // 30 segundos
  PAYMENT_STATUS: 5000,      // 5 segundos
  SEARCH_DEBOUNCE: 300,      // 300ms
  AUTO_LOGOUT: 30 * 60 * 1000, // 30 minutos
} as const;

// ===============================
// CONFIGURACIÓN DE DESARROLLO
// ===============================

export const DEV_CONFIG = {
  ENABLE_LOGGING: __DEV__,
  ENABLE_REDUX_LOGGER: __DEV__,
  ENABLE_FLIPPER: __DEV__,
  MOCK_API: false,
  SHOW_PERFORMANCE: __DEV__,
} as const;

// ===============================
// CONFIGURACIÓN DE ERRORES
// ===============================

export const ERROR_CONFIG = {
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  SHOW_STACK_TRACE: __DEV__,
  LOG_ERRORS: true,
} as const;

// ===============================
// CONFIGURACIÓN DE FEATURES
// ===============================

export const FEATURE_FLAGS = {
  ENABLE_BIOMETRIC_AUTH: true,
  ENABLE_DARK_MODE: true,
  ENABLE_OFFLINE_MODE: true,
  ENABLE_ANALYTICS: false,
  ENABLE_CRASH_REPORTING: true,
  ENABLE_PUSH_NOTIFICATIONS: true,
} as const;

// Helper function para obtener configuración por ambiente
export const getEnvironmentConfig = () => {
  const isDev = __DEV__;
  const isProduction = !isDev;

  return {
    isDev,
    isProduction,
    apiUrl: isDev
      ? 'http://localhost:3000/api'
      : 'https://your-production-api.com/api',
    enableLogging: isDev,
    enableAnalytics: isProduction,
  };
};

export default {
  API_CONFIG,
  PAGINATION,
  CACHE_CONFIG,
  FORM_CONFIG,
  QR_CONFIG,
  ANIMATION_CONFIG,
  LAYOUT,
  TYPOGRAPHY,
  NOTIFICATION_CONFIG,
  STORAGE_CONFIG,
  FILTER_CONFIG,
  VALIDATION_PATTERNS,
  FORMAT_CONFIG,
  LIMITS,
  TIMEOUTS,
  DEV_CONFIG,
  ERROR_CONFIG,
  FEATURE_FLAGS,
};