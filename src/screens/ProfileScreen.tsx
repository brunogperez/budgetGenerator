// ===============================
// PROFILE SCREEN - PRESUPUESTOS APP
// ===============================

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

// Components
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';

// Context
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// Constants
import { COLORS, LAYOUT, TYPOGRAPHY } from '../constants/config';

// Utils
import { formatUserRole, getUserInitials } from '../services/authService';

// ===============================
// PROFILE SCREEN
// ===============================

const ProfileScreen: React.FC = () => {
  // ===============================
  // HOOKS
  // ===============================

  const { user, logout, isLoading } = useAuth();
  const { isDark, toggleTheme, colors } = useTheme();

  // ===============================
  // STATE
  // ===============================

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // ===============================
  // HANDLERS
  // ===============================

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que quieres cerrar tu sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoggingOut(true);
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'No se pudo cerrar la sesión');
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert('Info', 'Funcionalidad en desarrollo');
  };

  const handleChangePassword = () => {
    Alert.alert('Info', 'Funcionalidad en desarrollo');
  };

  const handleSettings = () => {
    Alert.alert('Info', 'Funcionalidad en desarrollo');
  };

  const handleHelp = () => {
    Alert.alert('Info', 'Funcionalidad en desarrollo');
  };

  const handleAbout = () => {
    Alert.alert(
      'Acerca de',
      'Generador de Presupuestos v1.0.0\n\nUna aplicación para gestionar productos, presupuestos y pagos con MercadoPago.',
      [{ text: 'OK' }]
    );
  };

  // ===============================
  // LOADING STATE
  // ===============================

  if (isLoading || !user) {
    return <Loading message="Cargando perfil..." />;
  }

  // ===============================
  // RENDER
  // ===============================

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: LAYOUT.SPACING.LG }}
    >
      {/* User Header Card */}
      <Card variant="elevated" padding="lg" style={{ marginBottom: LAYOUT.SPACING.LG }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          {/* Avatar */}
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: LAYOUT.SPACING.MD,
          }}>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.XXL,
              fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
              color: '#FFFFFF',
            }}>
              {getUserInitials(user)}
            </Text>
          </View>

          {/* User Info */}
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.LG,
              fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
              color: colors.text,
              marginBottom: LAYOUT.SPACING.XS,
            }}>
              {user.name}
            </Text>

            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.MD,
              color: colors.textSecondary,
              marginBottom: LAYOUT.SPACING.XS,
            }}>
              {user.email}
            </Text>

            <View style={{
              backgroundColor: COLORS.primaryLight + '20',
              paddingHorizontal: LAYOUT.SPACING.SM,
              paddingVertical: LAYOUT.SPACING.XS,
              borderRadius: LAYOUT.BORDER_RADIUS.SM,
              alignSelf: 'flex-start',
            }}>
              <Text style={{
                fontSize: TYPOGRAPHY.FONT_SIZE.SM,
                fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
                color: colors.primary,
              }}>
                {formatUserRole(user.role)}
              </Text>
            </View>
          </View>

          {/* Edit Button */}
          <TouchableOpacity
            onPress={handleEditProfile}
            style={{
              padding: LAYOUT.SPACING.SM,
            }}
          >
            <MaterialCommunityIcons name="pencil-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </Card>

      {/* Account Section */}
      <Card variant="default" padding="none" style={{ marginBottom: LAYOUT.SPACING.LG }}>
        <View style={{
          paddingHorizontal: LAYOUT.SPACING.LG,
          paddingVertical: LAYOUT.SPACING.MD,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}>
          <Text style={{
            fontSize: TYPOGRAPHY.FONT_SIZE.MD,
            fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
            color: colors.text,
          }}>
            Cuenta
          </Text>
        </View>

        {/* Edit Profile */}
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: LAYOUT.SPACING.LG,
            paddingVertical: LAYOUT.SPACING.MD,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
          onPress={handleEditProfile}
        >
          <MaterialCommunityIcons name="account-outline" size={22} color={colors.textSecondary} style={{ marginRight: LAYOUT.SPACING.MD }} />
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.MD,
              color: colors.text,
            }}>
              Editar perfil
            </Text>
          </View>
          <Text style={{ fontSize: 16, color: colors.textSecondary }}>›</Text>
        </TouchableOpacity>

        {/* Change Password */}
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: LAYOUT.SPACING.LG,
            paddingVertical: LAYOUT.SPACING.MD,
          }}
          onPress={handleChangePassword}
        >
          <MaterialCommunityIcons name="lock-outline" size={22} color={colors.textSecondary} style={{ marginRight: LAYOUT.SPACING.MD }} />
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.MD,
              color: colors.text,
            }}>
              Cambiar Contraseña
            </Text>
          </View>
          <Text style={{ fontSize: 16, color: colors.textSecondary }}>›</Text>
        </TouchableOpacity>
      </Card>

      {/* Settings Section */}
      <Card variant="default" padding="none" style={{ marginBottom: LAYOUT.SPACING.LG }}>
        <View style={{
          paddingHorizontal: LAYOUT.SPACING.LG,
          paddingVertical: LAYOUT.SPACING.MD,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}>
          <Text style={{
            fontSize: TYPOGRAPHY.FONT_SIZE.MD,
            fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
            color: colors.text,
          }}>
            Configuración
          </Text>
        </View>

        {/* Dark Mode Toggle */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: LAYOUT.SPACING.LG,
            paddingVertical: LAYOUT.SPACING.MD,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <MaterialCommunityIcons name={isDark ? "weather-night" : "white-balance-sunny"} size={22} color={colors.textSecondary} style={{ marginRight: LAYOUT.SPACING.MD }} />
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.MD,
              color: colors.text,
            }}>
              Tema oscuro
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={'#FFFFFF'}
          />
        </View>

        {/* Settings */}
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: LAYOUT.SPACING.LG,
            paddingVertical: LAYOUT.SPACING.MD,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
          onPress={handleSettings}
        >
          <MaterialCommunityIcons name="cog-outline" size={22} color={colors.textSecondary} style={{ marginRight: LAYOUT.SPACING.MD }} />
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.MD,
              color: colors.text,
            }}>
              Configuración
            </Text>
          </View>
          <Text style={{ fontSize: 16, color: colors.textSecondary }}>›</Text>
        </TouchableOpacity>

        {/* Help */}
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: LAYOUT.SPACING.LG,
            paddingVertical: LAYOUT.SPACING.MD,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
          onPress={handleHelp}
        >
          <MaterialCommunityIcons name="help-circle-outline" size={22} color={colors.textSecondary} style={{ marginRight: LAYOUT.SPACING.MD }} />
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.MD,
              color: colors.text,
            }}>
              Ayuda y soporte
            </Text>
          </View>
          <Text style={{ fontSize: 16, color: colors.textSecondary }}>›</Text>
        </TouchableOpacity>

        {/* About */}
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: LAYOUT.SPACING.LG,
            paddingVertical: LAYOUT.SPACING.MD,
          }}
          onPress={handleAbout}
        >
          <MaterialCommunityIcons name="information-outline" size={22} color={colors.textSecondary} style={{ marginRight: LAYOUT.SPACING.MD }} />
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.MD,
              color: colors.text,
            }}>
              Acerca de
            </Text>
          </View>
          <Text style={{ fontSize: 16, color: colors.textSecondary }}>›</Text>
        </TouchableOpacity>
      </Card>

      {/* App Info */}
      <View style={{
        alignItems: 'center',
        marginBottom: LAYOUT.SPACING.LG,
      }}>
        <Text style={{
          fontSize: TYPOGRAPHY.FONT_SIZE.SM,
          color: colors.textSecondary,
          textAlign: 'center',
        }}>
          Generador de Presupuestos{'\n'}
          Versión 1.0.0
        </Text>
      </View>

      {/* Logout Button */}
      <Button
        title="Cerrar sesión"
        variant="danger"
        onPress={handleLogout}
        loading={isLoggingOut}
        disabled={isLoggingOut}
        fullWidth
        style={{ marginBottom: LAYOUT.SPACING.XL }}
      />
    </ScrollView>
  );
};

export default ProfileScreen;
