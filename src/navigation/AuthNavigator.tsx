// ===============================
// AUTH NAVIGATOR - PRESUPUESTOS APP
// ===============================

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Text } from 'react-native';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Types
import { AuthStackParamList } from '../types';

// Constants
import { COLORS, LAYOUT, TYPOGRAPHY } from '../constants/config';

// ===============================
// STACK NAVIGATOR
// ===============================

const Stack = createStackNavigator<AuthStackParamList>();

// ===============================
// AUTH NAVIGATOR
// ===============================

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.background,
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTitleStyle: {
          fontSize: TYPOGRAPHY.FONT_SIZE.LG,
          fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
          color: COLORS.text,
        },
        headerBackTitleVisible: false,
        headerTintColor: COLORS.primary,
        cardStyle: {
          backgroundColor: COLORS.background,
        },
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: 'Iniciar Sesión',
          headerShown: false, // Login sin header
        }}
      />

      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={({ navigation }) => ({
          title: 'Crear Cuenta',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                marginLeft: LAYOUT.SPACING.MD,
                padding: LAYOUT.SPACING.SM,
              }}
            >
              <Text style={{
                fontSize: TYPOGRAPHY.FONT_SIZE.MD,
                color: COLORS.primary,
                fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
              }}>
                ← Volver
              </Text>
            </TouchableOpacity>
          ),
        })}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;