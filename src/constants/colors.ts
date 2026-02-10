// ===============================
// PALETA DE COLORES - PRESUPUESTOS APP
// ===============================

export const COLORS = {
  // Colores principales
  primary: '#007AFF',
  primaryLight: '#4DA3FF',
  primaryDark: '#0056CC',

  secondary: '#5AC8FA',
  secondaryLight: '#8AD9FC',
  secondaryDark: '#2EA9E6',

  // Colores de estado
  success: '#34C759',
  successLight: '#6FD98A',
  successDark: '#248A3D',

  warning: '#FF9500',
  warningLight: '#FFB34D',
  warningDark: '#CC7700',

  error: '#FF3B30',
  errorLight: '#FF6B63',
  errorDark: '#CC2F26',

  info: '#5AC8FA',
  infoLight: '#8AD9FC',
  infoDark: '#2EA9E6',

  // Colores de fondo
  background: '#FFFFFF',
  backgroundSecondary: '#F2F2F7',
  backgroundTertiary: '#FFFFFF',

  // Dark mode backgrounds
  backgroundDark: '#000000',
  backgroundSecondaryDark: '#1C1C1E',
  backgroundTertiaryDark: '#2C2C2E',

  // Colores de superficie
  surface: '#FFFFFF',
  surfaceSecondary: '#F2F2F7',
  surfaceTertiary: '#E5E5EA',

  // Dark mode surfaces
  surfaceDark: '#1C1C1E',
  surfaceSecondaryDark: '#2C2C2E',
  surfaceTertiaryDark: '#3A3A3C',

  // Colores de texto
  text: '#000000',
  textSecondary: '#6D6D80',
  textTertiary: '#999999',
  textDisabled: '#C7C7CC',

  // Dark mode text
  textDark: '#FFFFFF',
  textSecondaryDark: '#EBEBF5',
  textTertiaryDark: '#EBEBF599',
  textDisabledDark: '#EBEBF54D',

  // Colores de borde
  border: '#C6C6C8',
  borderSecondary: '#E5E5EA',

  // Dark mode borders
  borderDark: '#38383A',
  borderSecondaryDark: '#48484A',

  // Colores de separador
  separator: '#C6C6C8',
  separatorDark: '#38383A',

  // Colores de overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.2)',

  // Colores específicos de la app
  quote: {
    pending: '#FF9500',
    paid: '#34C759',
    cancelled: '#FF3B30',
    expired: '#6D6D80',
  },

  payment: {
    pending: '#FF9500',
    approved: '#34C759',
    rejected: '#FF3B30',
    cancelled: '#6D6D80',
  },

  priority: {
    high: '#FF3B30',
    medium: '#FF9500',
    low: '#34C759',
  },

  // Colores de categorías de productos
  categories: [
    '#007AFF',
    '#5AC8FA',
    '#34C759',
    '#FF9500',
    '#FF3B30',
    '#AF52DE',
    '#FF2D92',
    '#FF6B35',
    '#5856D6',
    '#00C7BE',
  ],
} as const;

// Helper functions para manejar colores con tema
export const getTextColor = (isDark: boolean) => ({
  primary: isDark ? COLORS.textDark : COLORS.text,
  secondary: isDark ? COLORS.textSecondaryDark : COLORS.textSecondary,
  tertiary: isDark ? COLORS.textTertiaryDark : COLORS.textTertiary,
  disabled: isDark ? COLORS.textDisabledDark : COLORS.textDisabled,
});

export const getBackgroundColor = (isDark: boolean) => ({
  primary: isDark ? COLORS.backgroundDark : COLORS.background,
  secondary: isDark ? COLORS.backgroundSecondaryDark : COLORS.backgroundSecondary,
  tertiary: isDark ? COLORS.backgroundTertiaryDark : COLORS.backgroundTertiary,
});

export const getSurfaceColor = (isDark: boolean) => ({
  primary: isDark ? COLORS.surfaceDark : COLORS.surface,
  secondary: isDark ? COLORS.surfaceSecondaryDark : COLORS.surfaceSecondary,
  tertiary: isDark ? COLORS.surfaceTertiaryDark : COLORS.surfaceTertiary,
});

export const getBorderColor = (isDark: boolean) => ({
  primary: isDark ? COLORS.borderDark : COLORS.border,
  secondary: isDark ? COLORS.borderSecondaryDark : COLORS.borderSecondary,
  separator: isDark ? COLORS.separatorDark : COLORS.separator,
});

// Función para obtener color por status
export const getStatusColor = (
  status: string,
  type: 'quote' | 'payment' = 'quote'
): string => {
  const colorMap = type === 'quote' ? COLORS.quote : COLORS.payment;
  return colorMap[status as keyof typeof colorMap] || COLORS.textSecondary;
};

// Función para obtener color de categoría
export const getCategoryColor = (index: number): string => {
  return COLORS.categories[index % COLORS.categories.length];
};

// Función para generar color con opacidad
export const withOpacity = (color: string, opacity: number): string => {
  // Si el color ya tiene opacidad (rgba), reemplazarla
  if (color.startsWith('rgba')) {
    return color.replace(/[\d\.]+\)$/g, `${opacity})`);
  }

  // Si es hex, convertir a rgba
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  // Si es rgb, convertir a rgba
  if (color.startsWith('rgb')) {
    return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
  }

  return color;
};

export default COLORS;