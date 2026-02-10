// ===============================
// AUTH SERVICE - PRESUPUESTOS APP
// ===============================

import {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ApiResponse
} from '../types';
import { get, post, put } from './api';
import { API_ENDPOINTS } from '../types';

// ===============================
// AUTH SERVICE FUNCTIONS
// ===============================

/**
 * Iniciar sesión
 */
export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  try {
    const response: ApiResponse<AuthResponse> = await post(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error en el login');
    }

    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Error de conexión durante el login');
  }
};

/**
 * Registrar usuario
 */
export const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
  try {
    const response: ApiResponse<AuthResponse> = await post(
      API_ENDPOINTS.AUTH.REGISTER,
      userData
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error en el registro');
    }

    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Error de conexión durante el registro');
  }
};

/**
 * Obtener usuario actual
 */
export const getCurrentUser = async (): Promise<User> => {
  try {
    const response: ApiResponse<User> = await get(API_ENDPOINTS.AUTH.ME);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error obteniendo usuario actual');
    }

    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Error obteniendo usuario actual');
  }
};

/**
 * Actualizar perfil de usuario
 */
export const updateProfile = async (userData: Partial<User>): Promise<User> => {
  try {
    const response: ApiResponse<User> = await put(
      API_ENDPOINTS.AUTH.ME,
      userData
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error actualizando perfil');
    }

    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Error actualizando perfil');
  }
};

/**
 * Cambiar contraseña
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  try {
    const response: ApiResponse = await put(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      currentPassword,
      newPassword,
    });

    if (!response.success) {
      throw new Error(response.message || 'Error cambiando contraseña');
    }
  } catch (error: any) {
    throw new Error(error.message || 'Error cambiando contraseña');
  }
};

/**
 * Validar email
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validar contraseña
 */
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una mayúscula');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una minúscula');
  }

  if (!/\d/.test(password)) {
    errors.push('La contraseña debe contener al menos un número');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validar datos de registro
 */
export const validateRegistrationData = (data: RegisterRequest): {
  isValid: boolean;
  errors: Record<string, string>;
} => {
  const errors: Record<string, string> = {};

  // Validar nombre
  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'El nombre debe tener al menos 2 caracteres';
  }

  // Validar email
  if (!data.email || !validateEmail(data.email)) {
    errors.email = 'El email no es válido';
  }

  // Validar contraseña
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.errors[0];
  }

  // Validar rol
  if (data.role && !['admin', 'seller'].includes(data.role)) {
    errors.role = 'El rol debe ser admin o seller';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Generar nombre de usuario sugerido
 */
export const generateSuggestedUsername = (name: string, email: string): string => {
  const cleanName = name.toLowerCase().replace(/\s+/g, '');
  const emailPart = email.split('@')[0].toLowerCase();

  return cleanName || emailPart;
};

/**
 * Verificar si el usuario es admin
 */
export const isAdmin = (user: User | null): boolean => {
  return user?.role === 'admin';
};

/**
 * Verificar si el usuario es vendedor
 */
export const isSeller = (user: User | null): boolean => {
  return user?.role === 'seller';
};

/**
 * Verificar si el usuario tiene permisos de administración
 */
export const hasAdminPermissions = (user: User | null): boolean => {
  return isAdmin(user);
};

/**
 * Verificar si el usuario puede gestionar productos
 */
export const canManageProducts = (user: User | null): boolean => {
  return user?.role === 'admin' || user?.role === 'seller';
};

/**
 * Verificar si el usuario puede gestionar presupuestos
 */
export const canManageQuotes = (user: User | null): boolean => {
  return user?.role === 'admin' || user?.role === 'seller';
};

/**
 * Verificar si el usuario puede ver estadísticas
 */
export const canViewStats = (user: User | null): boolean => {
  return user?.role === 'admin';
};

/**
 * Obtener nombre completo del usuario
 */
export const getUserDisplayName = (user: User | null): string => {
  return user?.name || 'Usuario';
};

/**
 * Obtener iniciales del usuario
 */
export const getUserInitials = (user: User | null): string => {
  if (!user?.name) return 'U';

  const names = user.name.split(' ');
  if (names.length >= 2) {
    return `${names[0][0]}${names[1][0]}`.toUpperCase();
  }

  return user.name[0].toUpperCase();
};

/**
 * Formatear rol del usuario
 */
export const formatUserRole = (role: User['role']): string => {
  const roleLabels: Record<User['role'], string> = {
    admin: 'Administrador',
    seller: 'Vendedor',
  };

  return roleLabels[role] || role;
};

export default {
  login,
  register,
  getCurrentUser,
  updateProfile,
  changePassword,
  validateEmail,
  validatePassword,
  validateRegistrationData,
  generateSuggestedUsername,
  isAdmin,
  isSeller,
  hasAdminPermissions,
  canManageProducts,
  canManageQuotes,
  canViewStats,
  getUserDisplayName,
  getUserInitials,
  formatUserRole,
};