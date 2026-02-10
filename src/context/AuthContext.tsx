// ===============================
// AUTH CONTEXT - PRESUPUESTOS APP
// ===============================

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthContextData, LoginRequest, RegisterRequest } from '../types';
import { STORAGE_CONFIG } from '../constants/config';
import * as authService from '../services/authService';
import { setAuthToken, clearAuth } from '../services/api';

// ===============================
// CONTEXT CREATION
// ===============================

const AuthContext = createContext<AuthContextData | null>(null);

// ===============================
// TYPES
// ===============================

interface AuthProviderProps {
  children: ReactNode;
}

// ===============================
// AUTH PROVIDER
// ===============================

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ===============================
  // COMPUTED VALUES
  // ===============================

  const isAuthenticated = Boolean(user);

  // ===============================
  // INIT AUTH STATE
  // ===============================

  useEffect(() => {
    initAuthState();
  }, []);

  const initAuthState = async (): Promise<void> => {
    try {
      setIsLoading(true);

      // Obtener token y datos de usuario del storage
      const [token, userData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_CONFIG.KEYS.AUTH_TOKEN),
        AsyncStorage.getItem(STORAGE_CONFIG.KEYS.USER_DATA),
      ]);

      if (token && userData) {
        const parsedUser: User = JSON.parse(userData);

        // Configurar token en axios
        await setAuthToken(token);

        // Verificar si el token aún es válido
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);

          if (__DEV__) {
            console.log('✅ Auth state restored:', currentUser);
          }
        } catch (error) {
          // Token inválido, limpiar datos
          await handleLogout();

          if (__DEV__) {
            console.log('❌ Invalid token, clearing auth data');
          }
        }
      } else {
        // No hay datos de autenticación
        if (__DEV__) {
          console.log('ℹ️ No auth data found');
        }
      }
    } catch (error) {
      console.error('Error initializing auth state:', error);
      await handleLogout();
    } finally {
      setIsLoading(false);
    }
  };

  // ===============================
  // LOGIN
  // ===============================

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);

      const loginData: LoginRequest = { email, password };
      const response = await authService.login(loginData);

      // Guardar token y datos de usuario
      await Promise.all([
        AsyncStorage.setItem(STORAGE_CONFIG.KEYS.AUTH_TOKEN, response.token),
        AsyncStorage.setItem(STORAGE_CONFIG.KEYS.USER_DATA, JSON.stringify(response.user)),
      ]);

      // Configurar token en axios
      await setAuthToken(response.token);

      // Actualizar estado
      setUser(response.user);

      if (__DEV__) {
        console.log('✅ Login successful:', response.user);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ===============================
  // REGISTER
  // ===============================

  const register = async (data: RegisterRequest): Promise<void> => {
    try {
      setIsLoading(true);

      const response = await authService.register(data);

      // Guardar token y datos de usuario
      await Promise.all([
        AsyncStorage.setItem(STORAGE_CONFIG.KEYS.AUTH_TOKEN, response.token),
        AsyncStorage.setItem(STORAGE_CONFIG.KEYS.USER_DATA, JSON.stringify(response.user)),
      ]);

      // Configurar token en axios
      await setAuthToken(response.token);

      // Actualizar estado
      setUser(response.user);

      if (__DEV__) {
        console.log('✅ Register successful:', response.user);
      }
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ===============================
  // LOGOUT
  // ===============================

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await handleLogout();

      if (__DEV__) {
        console.log('✅ Logout successful');
      }
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async (): Promise<void> => {
    // Limpiar datos del storage
    await AsyncStorage.multiRemove([
      STORAGE_CONFIG.KEYS.AUTH_TOKEN,
      STORAGE_CONFIG.KEYS.USER_DATA,
    ]);

    // Limpiar token de axios
    await clearAuth();

    // Actualizar estado
    setUser(null);
  };

  // ===============================
  // UPDATE PROFILE
  // ===============================

  const updateProfile = async (data: Partial<User>): Promise<void> => {
    try {
      setIsLoading(true);

      const updatedUser = await authService.updateProfile(data);

      // Actualizar datos en storage
      await AsyncStorage.setItem(
        STORAGE_CONFIG.KEYS.USER_DATA,
        JSON.stringify(updatedUser)
      );

      // Actualizar estado
      setUser(updatedUser);

      if (__DEV__) {
        console.log('✅ Profile updated:', updatedUser);
      }
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ===============================
  // CHANGE PASSWORD
  // ===============================

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<void> => {
    try {
      setIsLoading(true);

      await authService.changePassword(currentPassword, newPassword);

      if (__DEV__) {
        console.log('✅ Password changed successfully');
      }
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ===============================
  // REFRESH USER DATA
  // ===============================

  const refreshUser = async (): Promise<void> => {
    try {
      if (!user) return;

      const currentUser = await authService.getCurrentUser();

      // Actualizar datos en storage
      await AsyncStorage.setItem(
        STORAGE_CONFIG.KEYS.USER_DATA,
        JSON.stringify(currentUser)
      );

      // Actualizar estado
      setUser(currentUser);

      if (__DEV__) {
        console.log('✅ User data refreshed:', currentUser);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      // Si falla, podría ser que el token expiró
      await handleLogout();
    }
  };

  // ===============================
  // CHECK AUTH STATUS
  // ===============================

  const checkAuthStatus = async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_CONFIG.KEYS.AUTH_TOKEN);

      if (!token) {
        return false;
      }

      // Verificar si el token es válido
      await authService.getCurrentUser();
      return true;
    } catch (error) {
      await handleLogout();
      return false;
    }
  };

  // ===============================
  // CONTEXT VALUE
  // ===============================

  const contextValue: AuthContextData = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshUser,
    checkAuthStatus,
  };

  // ===============================
  // RENDER
  // ===============================

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// ===============================
// HOOK
// ===============================

export const useAuth = (): AuthContextData => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

// ===============================
// ADDITIONAL TYPES FOR CONTEXT
// ===============================

declare module '../types' {
  interface AuthContextData {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
    refreshUser: () => Promise<void>;
    checkAuthStatus: () => Promise<boolean>;
  }
}

// ===============================
// EXPORT
// ===============================

export default AuthContext;