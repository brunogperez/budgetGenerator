// ===============================
// APP MAIN - PRESUPUESTOS APP
// ===============================

import React from 'react';
import { StatusBar } from 'expo-status-bar';

// Context Providers
import { AuthProvider } from './src/context/AuthContext';

// Navigation
import AppNavigator from './src/navigation/AppNavigator';

// ===============================
// APP COMPONENT
// ===============================

const App: React.FC = () => {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <AppNavigator />
    </AuthProvider>
  );
};

export default App;
