// ===============================
// APP NAVIGATOR - PRESUPUESTOS APP
// ===============================

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';

// Context
import { useAuth } from '../context/AuthContext';

// Navigators
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

// Types
import { RootStackParamList } from '../types';

// Constants
import { COLORS } from '../constants/colors';

// ===============================
// STACK NAVIGATOR
// ===============================

const Stack = createStackNavigator<RootStackParamList>();

// ===============================
// LOADING SCREEN
// ===============================

const LoadingScreen: React.FC = () => (
  <View style={{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  }}>
    <ActivityIndicator size="large" color={COLORS.primary} />
  </View>
);

// ===============================
// APP NAVIGATOR
// ===============================

const AppNavigator: React.FC = () => {
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (__DEV__) {
      console.log('🧭 Navigation state:', {
        isLoading,
        isAuthenticated,
        user: user ? { _id: user._id, name: user.name, role: user.role } : null,
      });
    }
  }, [isLoading, isAuthenticated, user]);

  return (
    <NavigationContainer
      onReady={() => {
        if (__DEV__) {
          console.log('🧭 Navigation container ready');
        }
      }}
      onStateChange={(state) => {
        if (__DEV__ && state) {
          console.log('🧭 Navigation state changed:', {
            routeNames: state.routes.map(route => route.name).join(', '),
            index: state.index,
          });
        }
      }}
    >
      <StatusBar style="auto" />

      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoading ? (
          // Pantalla de carga mientras verificamos autenticación
          <Stack.Screen
            name="Loading"
            component={LoadingScreen}
            options={{
              animation: 'none',
            }}
          />
        ) : isAuthenticated ? (
          // Usuario autenticado - mostrar navegación principal
          <Stack.Screen
            name="Main"
            component={MainNavigator}
            options={{
              animation: 'none',
            }}
          />
        ) : (
          // Usuario no autenticado - mostrar pantallas de autenticación
          <Stack.Screen
            name="Auth"
            component={AuthNavigator}
            options={{
              animation: 'none',
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;