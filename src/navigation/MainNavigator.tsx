// ===============================
// MAIN NAVIGATOR - PRESUPUESTOS APP
// ===============================

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Text, View } from 'react-native';

// Context
import { useAuth } from '../context/AuthContext';

// Screens - Products
import ProductListScreen from '../screens/products/ProductListScreen';
import ProductDetailScreen from '../screens/products/ProductDetailScreen';
import ProductFormScreen from '../screens/products/ProductFormScreen';

// Screens - Quotes
import QuoteListScreen from '../screens/quotes/QuoteListScreen';
import CreateQuoteScreen from '../screens/quotes/CreateQuoteScreen';
import QuoteDetailScreen from '../screens/quotes/QuoteDetailScreen';

// Screens - Payments
import PaymentQRScreen from '../screens/payments/PaymentQRScreen';
import PaymentSuccessScreen from '../screens/payments/PaymentSuccessScreen';

// Screens - Profile
import ProfileScreen from '../screens/ProfileScreen';

// Types
import {
  MainTabParamList,
  ProductStackParamList,
  QuoteStackParamList,
} from '../types';

// Constants
import { COLORS, LAYOUT, TYPOGRAPHY } from '../constants/config';

// ===============================
// NAVIGATORS
// ===============================

const Tab = createBottomTabNavigator<MainTabParamList>();
const ProductStack = createStackNavigator<ProductStackParamList>();
const QuoteStack = createStackNavigator<QuoteStackParamList>();

// ===============================
// COMMON HEADER STYLES
// ===============================

const commonHeaderOptions = {
  headerStyle: {
    backgroundColor: COLORS.background,
    shadowColor: 'transparent',
    elevation: 0,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
};

// ===============================
// PRODUCT STACK NAVIGATOR
// ===============================

const ProductStackNavigator: React.FC = () => {
  const { user } = useAuth();
  const canManageProducts = user?.role === 'admin' || user?.role === 'seller';

  return (
    <ProductStack.Navigator
      initialRouteName="ProductList"
      screenOptions={commonHeaderOptions}
    >
      <ProductStack.Screen
        name="ProductList"
        component={ProductListScreen}
        options={({ navigation }) => ({
          title: 'Productos',
          headerRight: () => canManageProducts ? (
            <TouchableOpacity
              onPress={() => navigation.navigate('ProductForm' as any)}
              style={{
                marginRight: LAYOUT.SPACING.MD,
                backgroundColor: COLORS.primary,
                paddingHorizontal: LAYOUT.SPACING.MD,
                paddingVertical: LAYOUT.SPACING.SM,
                borderRadius: LAYOUT.BORDER_RADIUS.MD,
              }}
            >
              <Text style={{
                color: COLORS.background,
                fontSize: TYPOGRAPHY.FONT_SIZE.SM,
                fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
              }}>
                + Nuevo
              </Text>
            </TouchableOpacity>
          ) : null,
        })}
      />

      <ProductStack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={({ route, navigation }) => ({
          title: 'Detalle del Producto',
          headerRight: () => canManageProducts ? (
            <TouchableOpacity
              onPress={() => navigation.navigate('ProductForm', {
                productId: route.params.productId,
              })}
              style={{
                marginRight: LAYOUT.SPACING.MD,
                padding: LAYOUT.SPACING.SM,
              }}
            >
              <Text style={{
                color: COLORS.primary,
                fontSize: TYPOGRAPHY.FONT_SIZE.MD,
                fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
              }}>
                Editar
              </Text>
            </TouchableOpacity>
          ) : null,
        })}
      />

      <ProductStack.Screen
        name="ProductForm"
        component={ProductFormScreen}
        options={({ route }) => ({
          title: route.params?.productId ? 'Editar Producto' : 'Nuevo Producto',
        })}
      />
    </ProductStack.Navigator>
  );
};

// ===============================
// QUOTE STACK NAVIGATOR
// ===============================

const QuoteStackNavigator: React.FC = () => {
  const { user } = useAuth();
  const canManageQuotes = user?.role === 'admin' || user?.role === 'seller';

  return (
    <QuoteStack.Navigator
      initialRouteName="QuoteList"
      screenOptions={commonHeaderOptions}
    >
      <QuoteStack.Screen
        name="QuoteList"
        component={QuoteListScreen}
        options={({ navigation }) => ({
          title: 'Presupuestos',
          headerRight: () => canManageQuotes ? (
            <TouchableOpacity
              onPress={() => navigation.navigate('CreateQuote')}
              style={{
                marginRight: LAYOUT.SPACING.MD,
                backgroundColor: COLORS.primary,
                paddingHorizontal: LAYOUT.SPACING.MD,
                paddingVertical: LAYOUT.SPACING.SM,
                borderRadius: LAYOUT.BORDER_RADIUS.MD,
              }}
            >
              <Text style={{
                color: COLORS.background,
                fontSize: TYPOGRAPHY.FONT_SIZE.SM,
                fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
              }}>
                + Nuevo
              </Text>
            </TouchableOpacity>
          ) : null,
        })}
      />

      <QuoteStack.Screen
        name="CreateQuote"
        component={CreateQuoteScreen}
        options={{
          title: 'Nuevo Presupuesto',
        }}
      />

      <QuoteStack.Screen
        name="QuoteDetail"
        component={QuoteDetailScreen}
        options={{
          title: 'Detalle del Presupuesto',
        }}
      />

      <QuoteStack.Screen
        name="PaymentQR"
        component={PaymentQRScreen}
        options={{
          title: 'Código QR de Pago',
          presentation: 'modal',
        }}
      />

      <QuoteStack.Screen
        name="PaymentSuccess"
        component={PaymentSuccessScreen}
        options={{
          title: 'Pago Exitoso',
          headerLeft: () => null, // Prevenir volver atrás
        }}
      />
    </QuoteStack.Navigator>
  );
};

// ===============================
// TAB BAR ICON COMPONENT
// ===============================

interface TabBarIconProps {
  focused: boolean;
  iconName: string;
}

const TabBarIcon: React.FC<TabBarIconProps> = ({ focused, iconName }) => {
  const getIconSymbol = (name: string): string => {
    const iconMap: Record<string, string> = {
      products: '📦',
      quotes: '📋',
      profile: '👤',
    };
    return iconMap[name] || '❓';
  };

  return (
    <View style={{
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Text style={{
        fontSize: 24,
        opacity: focused ? 1 : 0.6,
      }}>
        {getIconSymbol(iconName)}
      </Text>
    </View>
  );
};

// ===============================
// MAIN TAB NAVIGATOR
// ===============================

const MainNavigator: React.FC = () => {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      initialRouteName="Products"
      screenOptions={{
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: LAYOUT.TAB_BAR_HEIGHT,
          paddingBottom: LAYOUT.SPACING.SM,
          paddingTop: LAYOUT.SPACING.SM,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarLabelStyle: {
          fontSize: TYPOGRAPHY.FONT_SIZE.XS,
          fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Products"
        component={ProductStackNavigator}
        options={{
          title: 'Productos',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} iconName="products" />
          ),
        }}
      />

      <Tab.Screen
        name="Quotes"
        component={QuoteStackNavigator}
        options={{
          title: 'Presupuestos',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} iconName="quotes" />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} iconName="profile" />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;