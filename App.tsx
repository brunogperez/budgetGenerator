// ===============================
// APP MAIN - PRESUPUESTOS APP
// ===============================

import React from 'react';
import { StatusBar } from 'expo-status-bar';

// Temporary debug: Add console override to track VirtualizedList warnings
const originalConsoleError = console.error;
console.error = (...args) => {
  if (args[0] && args[0].includes && args[0].includes('VirtualizedList') && args[0].includes('key')) {
    console.warn('🔍 VirtualizedList key warning caught:', args[0]);
    console.warn('📍 Stack trace:', new Error().stack);
  }
  originalConsoleError(...args);
};

// Context Providers
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';

// Navigation
import AppNavigator from './src/navigation/AppNavigator';

// ===============================
// APP COMPONENT
// ===============================

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
