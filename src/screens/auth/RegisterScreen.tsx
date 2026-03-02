// ===============================
// REGISTER SCREEN - PRESUPUESTOS APP
// ===============================

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StackScreenProps } from '@react-navigation/stack';

// Components
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import ErrorMessage from '../../components/common/ErrorMessage';

// Context
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

// Types
import { AuthStackParamList, RegisterFormData } from '../../types';

// Constants
import { COLORS, LAYOUT, TYPOGRAPHY } from '../../constants/config';

// Utils
import { validateRegistrationData } from '../../services/authService';

// ===============================
// TYPES
// ===============================

type RegisterScreenProps = StackScreenProps<AuthStackParamList, 'Register'>;

// ===============================
// REGISTER SCREEN
// ===============================

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  // ===============================
  // HOOKS
  // ===============================

  const { register, isLoading } = useAuth();
  const { colors } = useTheme();

  // ===============================
  // STATE
  // ===============================

  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [generalError, setGeneralError] = useState<string>('');

  // ===============================
  // HANDLERS
  // ===============================

  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    if (generalError) {
      setGeneralError('');
    }
  };

  const validateForm = (): boolean => {
    const serviceValidation = validateRegistrationData({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: 'seller',
    });

    let newErrors = { ...serviceValidation.errors };

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las Contraseñas no coinciden';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirma tu Contraseña';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: 'seller',
      });
    } catch (error: any) {
      console.error('Register error:', error);
      setGeneralError(error.message || 'Error al crear la cuenta');
    }
  };

  const handleLoginPress = () => {
    navigation.navigate('Login');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          padding: LAYOUT.SPACING.LG,
          paddingTop: LAYOUT.SPACING.XXL,
        }}>
          {/* Header */}
          <View style={{
            alignItems: 'center',
            marginBottom: LAYOUT.SPACING.XL,
          }}>
            <MaterialCommunityIcons name="rocket-launch-outline" size={48} color={colors.primary} style={{ marginBottom: LAYOUT.SPACING.MD }} />

            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.XXL,
              fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
              color: colors.text,
              textAlign: 'center',
              marginBottom: LAYOUT.SPACING.SM,
            }}>
              Crear Cuenta
            </Text>

            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.MD,
              color: colors.textSecondary,
              textAlign: 'center',
            }}>
              Unite y empieza a gestionar tus presupuestos
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

            {/* Name Input */}
            <Input
              label="Nombre completo"
              placeholder="Tu nombre completo"
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
              error={errors.name}
              autoCapitalize="words"
              autoComplete="name"
              required
              leftIcon={
                <MaterialCommunityIcons name="account-outline" size={20} color={colors.textSecondary} />
              }
            />

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
                <MaterialCommunityIcons name="email-outline" size={20} color={colors.textSecondary} />
              }
            />

            {/* Password Input */}
            <Input
              label="Contraseña"
              placeholder="Mínimo 8 caracteres"
              value={formData.password}
              onChangeText={(text) => handleInputChange('password', text)}
              error={errors.password}
              secureTextEntry={!showPassword}
              autoComplete="password-new"
              required
              leftIcon={
                <MaterialCommunityIcons name="lock-outline" size={20} color={colors.textSecondary} />
              }
              rightIcon={
                <TouchableOpacity onPress={togglePasswordVisibility}>
                  <MaterialCommunityIcons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              }
              onRightIconPress={togglePasswordVisibility}
              helperText="Debe contener mayúsculas, minúsculas y números"
            />

            {/* Confirm Password Input */}
            <Input
              label="Confirmar Contraseña"
              placeholder="Confirma tu Contraseña"
              value={formData.confirmPassword}
              onChangeText={(text) => handleInputChange('confirmPassword', text)}
              error={errors.confirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoComplete="password-new"
              required
              leftIcon={
                <MaterialCommunityIcons name="lock-outline" size={20} color={colors.textSecondary} />
              }
              rightIcon={
                <TouchableOpacity onPress={toggleConfirmPasswordVisibility}>
                  <MaterialCommunityIcons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              }
              onRightIconPress={toggleConfirmPasswordVisibility}
            />

            {/* Terms Notice */}
            <View style={{
              backgroundColor: colors.backgroundSecondary,
              padding: LAYOUT.SPACING.MD,
              borderRadius: LAYOUT.BORDER_RADIUS.MD,
              marginTop: LAYOUT.SPACING.SM,
            }}>
              <Text style={{
                fontSize: TYPOGRAPHY.FONT_SIZE.SM,
                color: colors.textSecondary,
                textAlign: 'center',
                lineHeight: 18,
              }}>
                Al crear una cuenta aceptas nuestros{' '}
                <Text style={{ color: colors.primary, fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM }}>
                  Términos y Condiciones
                </Text>
                {' '}y{' '}
                <Text style={{ color: colors.primary, fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM }}>
                  Política de Privacidad
                </Text>
              </Text>
            </View>

            {/* Register Button */}
            <Button
              title="Crear Cuenta"
              onPress={handleSubmit}
              loading={isLoading}
              disabled={isLoading}
              fullWidth
              style={{
                marginTop: LAYOUT.SPACING.LG,
                shadowColor: COLORS.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 5.25,
                elevation: 5,
              }}
            />
          </Card>

          {/* Login Link */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: LAYOUT.SPACING.XL,
            marginBottom: LAYOUT.SPACING.LG,
          }}>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.MD,
              color: colors.textSecondary,
            }}>
              ¿Ya tienes cuenta?{' '}
            </Text>
            <TouchableOpacity onPress={handleLoginPress}>
              <Text style={{
                fontSize: TYPOGRAPHY.FONT_SIZE.MD,
                color: colors.primary,
                fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
              }}>
                Iniciar sesión
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
