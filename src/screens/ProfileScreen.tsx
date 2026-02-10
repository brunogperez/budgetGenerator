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
} from 'react-native';

// Components
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';

// Context
import { useAuth } from '../context/AuthContext';

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
      style={{ flex: 1, backgroundColor: COLORS.background }}
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
            backgroundColor: COLORS.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: LAYOUT.SPACING.MD,
          }}>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.XXL,
              fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
              color: COLORS.background,
            }}>
              {getUserInitials(user)}
            </Text>
          </View>

          {/* User Info */}
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.LG,
              fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
              color: COLORS.text,
              marginBottom: LAYOUT.SPACING.XS,
            }}>
              {user.name}
            </Text>

            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.MD,
              color: COLORS.textSecondary,
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
                color: COLORS.primary,
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
            <Text style={{ fontSize: 20 }}>✏️</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Account Section */}
      <Card variant="default" padding="none" style={{ marginBottom: LAYOUT.SPACING.LG }}>
        <View style={{
          paddingHorizontal: LAYOUT.SPACING.LG,
          paddingVertical: LAYOUT.SPACING.MD,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
        }}>
          <Text style={{
            fontSize: TYPOGRAPHY.FONT_SIZE.MD,
            fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
            color: COLORS.text,
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
            borderBottomColor: COLORS.border,
          }}
          onPress={handleEditProfile}
        >
          <Text style={{ fontSize: 20, marginRight: LAYOUT.SPACING.MD }}>👤</Text>
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.MD,
              color: COLORS.text,
            }}>
              Editar perfil
            </Text>
          </View>
          <Text style={{ fontSize: 16, color: COLORS.textSecondary }}>›</Text>
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
          <Text style={{ fontSize: 20, marginRight: LAYOUT.SPACING.MD }}>🔒</Text>
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.MD,
              color: COLORS.text,
            }}>
              Cambiar contraseña
            </Text>
          </View>
          <Text style={{ fontSize: 16, color: COLORS.textSecondary }}>›</Text>
        </TouchableOpacity>
      </Card>

      {/* Settings Section */}
      <Card variant="default" padding="none" style={{ marginBottom: LAYOUT.SPACING.LG }}>
        <View style={{
          paddingHorizontal: LAYOUT.SPACING.LG,
          paddingVertical: LAYOUT.SPACING.MD,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
        }}>
          <Text style={{
            fontSize: TYPOGRAPHY.FONT_SIZE.MD,
            fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
            color: COLORS.text,
          }}>
            Configuración
          </Text>
        </View>

        {/* Settings */}
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: LAYOUT.SPACING.LG,
            paddingVertical: LAYOUT.SPACING.MD,
            borderBottomWidth: 1,
            borderBottomColor: COLORS.border,
          }}
          onPress={handleSettings}
        >
          <Text style={{ fontSize: 20, marginRight: LAYOUT.SPACING.MD }}>⚙️</Text>
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.MD,
              color: COLORS.text,
            }}>
              Configuración
            </Text>
          </View>
          <Text style={{ fontSize: 16, color: COLORS.textSecondary }}>›</Text>
        </TouchableOpacity>

        {/* Help */}
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: LAYOUT.SPACING.LG,
            paddingVertical: LAYOUT.SPACING.MD,
            borderBottomWidth: 1,
            borderBottomColor: COLORS.border,
          }}
          onPress={handleHelp}
        >
          <Text style={{ fontSize: 20, marginRight: LAYOUT.SPACING.MD }}>❓</Text>
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.MD,
              color: COLORS.text,
            }}>
              Ayuda y soporte
            </Text>
          </View>
          <Text style={{ fontSize: 16, color: COLORS.textSecondary }}>›</Text>
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
          <Text style={{ fontSize: 20, marginRight: LAYOUT.SPACING.MD }}>ℹ️</Text>
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.MD,
              color: COLORS.text,
            }}>
              Acerca de
            </Text>
          </View>
          <Text style={{ fontSize: 16, color: COLORS.textSecondary }}>›</Text>
        </TouchableOpacity>
      </Card>

      {/* App Info */}
      <View style={{
        alignItems: 'center',
        marginBottom: LAYOUT.SPACING.LG,
      }}>
        <Text style={{
          fontSize: TYPOGRAPHY.FONT_SIZE.SM,
          color: COLORS.textSecondary,
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