// ===============================
// LOGIN SCREEN - PRESUPUESTOS APP
// ===============================

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';

// Components
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import ErrorMessage from '../../components/common/ErrorMessage';

// Context
import { useAuth } from '../../context/AuthContext';

// Types
import { AuthStackParamList, LoginFormData } from '../../types';

// Constants
import { COLORS, LAYOUT, TYPOGRAPHY } from '../../constants/config';

// Utils
import { validateEmail } from '../../services/authService';

// ===============================
// TYPES
// ===============================

type LoginScreenProps = StackScreenProps<AuthStackParamList, 'Login'>;

// ===============================
// LOGIN SCREEN
// ===============================

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  // ===============================
  // HOOKS
  // ===============================

  const { login, isLoading } = useAuth();

  // ===============================
  // STATE
  // ===============================

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [generalError, setGeneralError] = useState<string>('');

  // ===============================
  // HANDLERS
  // ===============================

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Limpiar error general
    if (generalError) {
      setGeneralError('');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    // Validar password
    if (!formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await login(formData.email.trim(), formData.password);
      // La navegación se maneja automáticamente por AuthContext
    } catch (error: any) {
      console.error('Login error:', error);
      setGeneralError(error.message || 'Error al iniciar sesión');
    }
  };

  const handleRegisterPress = () => {
    navigation.navigate('Register');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // ===============================
  // RENDER
  // ===============================

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: COLORS.background }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          padding: LAYOUT.SPACING.LG,
        }}>
          {/* Header */}
          <View style={{
            alignItems: 'center',
            marginBottom: LAYOUT.SPACING.XXL,
          }}>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.XXXL,
              fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
              color: COLORS.primary,
              marginBottom: LAYOUT.SPACING.MD,
            }}>
              📋
            </Text>

            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.XXL,
              fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
              color: COLORS.text,
              textAlign: 'center',
              marginBottom: LAYOUT.SPACING.SM,
            }}>
              Bienvenido
            </Text>

            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.MD,
              color: COLORS.textSecondary,
              textAlign: 'center',
            }}>
              Inicia sesión para acceder a tu cuenta
            </Text>
          </View>

          {/* Form Card */}
          <Card variant="elevated" padding="lg">
            {/* General Error */}
            {generalError && (
              <ErrorMessage
                message={generalError}
                variant="inline"
                onDismiss={() => setGeneralError('')}
                style={{ marginBottom: LAYOUT.SPACING.MD }}
              />
            )}

            {/* Email Input */}
            <Input
              label="Email"
              placeholder="tu@email.com"
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              required
              leftIcon={
                <Text style={{ fontSize: 16, color: COLORS.textSecondary }}>
                  📧
                </Text>
              }
            />

            {/* Password Input */}
            <Input
              label="Contraseña"
              placeholder="Tu contraseña"
              value={formData.password}
              onChangeText={(text) => handleInputChange('password', text)}
              error={errors.password}
              secureTextEntry={!showPassword}
              autoComplete="password"
              required
              leftIcon={
                <Text style={{ fontSize: 16, color: COLORS.textSecondary }}>
                  🔒
                </Text>
              }
              rightIcon={
                <TouchableOpacity onPress={togglePasswordVisibility}>
                  <Text style={{ fontSize: 16, color: COLORS.textSecondary }}>
                    {showPassword ? '🙈' : '👁️'}
                  </Text>
                </TouchableOpacity>
              }
              onRightIconPress={togglePasswordVisibility}
            />

            {/* Login Button */}
            <Button
              title="Iniciar Sesión"
              onPress={handleSubmit}
              loading={isLoading}
              disabled={isLoading}
              fullWidth
              style={{ marginTop: LAYOUT.SPACING.MD }}
            />

            {/* Forgot Password Link */}
            <TouchableOpacity
              style={{
                alignItems: 'center',
                marginTop: LAYOUT.SPACING.MD,
              }}
              onPress={() => Alert.alert('Info', 'Funcionalidad en desarrollo')}
            >
              <Text style={{
                fontSize: TYPOGRAPHY.FONT_SIZE.SM,
                color: COLORS.primary,
                fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
              }}>
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>
          </Card>

          {/* Register Link */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: LAYOUT.SPACING.XL,
          }}>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.MD,
              color: COLORS.textSecondary,
            }}>
              ¿No tienes cuenta?{' '}
            </Text>
            <TouchableOpacity onPress={handleRegisterPress}>
              <Text style={{
                fontSize: TYPOGRAPHY.FONT_SIZE.MD,
                color: COLORS.primary,
                fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
              }}>
                Crear cuenta
              </Text>
            </TouchableOpacity>
          </View>

          {/* Demo Credentials */}
          {__DEV__ && (
            <Card
              variant="filled"
              padding="md"
              style={{ marginTop: LAYOUT.SPACING.LG }}
            >
              <Text style={{
                fontSize: TYPOGRAPHY.FONT_SIZE.SM,
                fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
                color: COLORS.textSecondary,
                marginBottom: LAYOUT.SPACING.SM,
              }}>
                Credenciales de prueba:
              </Text>
              <Text style={{
                fontSize: TYPOGRAPHY.FONT_SIZE.SM,
                color: COLORS.textSecondary,
                lineHeight: 18,
              }}>
                Email: admin@test.com{'\n'}
                Contraseña: Password123
              </Text>
            </Card>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;