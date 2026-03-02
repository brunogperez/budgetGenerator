// ===============================
// PRODUCT LIST SCREEN - PRESUPUESTOS APP
// ===============================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StackScreenProps } from '@react-navigation/stack';

// Components
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

// Context
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

// Services
import * as productService from '../../services/productService';

// Types
import { Product, ProductStackParamList } from '../../types';

// Constants
import { COLORS, LAYOUT, TYPOGRAPHY } from '../../constants/config';

// ===============================
// TYPES
// ===============================

type ProductListScreenProps = StackScreenProps<ProductStackParamList, 'ProductList'>;

// ===============================
// PRODUCT LIST SCREEN
// ===============================

const ProductListScreen: React.FC<ProductListScreenProps> = ({ navigation }) => {
  // ===============================
  // HOOKS
  // ===============================

  const { user } = useAuth();
  const { colors } = useTheme();

  // ===============================
  // STATE
  // ===============================

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // ===============================
  // EFFECTS
  // ===============================

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery]);

  // ===============================
  // HANDLERS
  // ===============================

  const loadProducts = async () => {
    try {
      setError('');
      const response = await productService.getProducts({
        page: 1,
        limit: 50,
        sortBy: 'name',
        sortOrder: 'asc',
      });
      console.log('📦 Products loaded:', response.items?.length || 0, 'items');
      console.log('📦 First product:', response.items?.[0]);
      setProducts(response.items);
    } catch (err: any) {
      setError(err.message || 'Error cargando productos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadProducts();
    setIsRefreshing(false);
  }, []);

  const filterProducts = () => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
      return;
    }

    const filtered = productService.filterProducts(products, {
      search: searchQuery.trim(),
    });
    setFilteredProducts(filtered);
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { productId: product._id });
  };

  const handleAddProduct = () => {
    navigation.navigate('ProductForm' as any);
  };

  const canManageProducts = user?.role === 'admin' || user?.role === 'seller';

  // ===============================
  // RENDER FUNCTIONS
  // ===============================

  const renderProductCard = ({ item }: { item: Product }) => {
    const stockStatus = productService.getStockStatus(item.stock);

    return (
      <Card
        variant="outlined"
        padding="md"
        onPress={() => handleProductPress(item)}
        style={{ marginBottom: LAYOUT.SPACING.MD }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1, marginRight: LAYOUT.SPACING.MD }}>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.LG,
              fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
              color: colors.text,
              marginBottom: LAYOUT.SPACING.XS,
            }}>
              {item.name}
            </Text>

            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.SM,
              color: colors.textSecondary,
              marginBottom: LAYOUT.SPACING.SM,
              lineHeight: 18,
            }} numberOfLines={2}>
              {item.description}
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{
                fontSize: TYPOGRAPHY.FONT_SIZE.LG,
                fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
                color: colors.primary,
              }}>
                {productService.formatPrice(item.price)}
              </Text>

              <View style={{
                backgroundColor: stockStatus.color + '20',
                paddingHorizontal: LAYOUT.SPACING.SM,
                paddingVertical: LAYOUT.SPACING.XS,
                borderRadius: LAYOUT.BORDER_RADIUS.SM,
              }}>
                <Text style={{
                  fontSize: TYPOGRAPHY.FONT_SIZE.XS,
                  fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
                  color: stockStatus.color,
                }}>
                  Stock: {item.stock}
                </Text>
              </View>
            </View>

            {item.category && (
              <View style={{
                marginTop: LAYOUT.SPACING.SM,
                alignSelf: 'flex-start',
              }}>
                <Text style={{
                  fontSize: TYPOGRAPHY.FONT_SIZE.XS,
                  color: colors.textTertiary,
                  backgroundColor: colors.backgroundSecondary,
                  paddingHorizontal: LAYOUT.SPACING.SM,
                  paddingVertical: LAYOUT.SPACING.XS,
                  borderRadius: LAYOUT.BORDER_RADIUS.SM,
                }}>
                  {item.category}
                </Text>
              </View>
            )}
          </View>

          {item.imageUrl && (
            <View style={{
              width: 60,
              height: 60,
              backgroundColor: colors.backgroundSecondary,
              borderRadius: LAYOUT.BORDER_RADIUS.MD,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <MaterialCommunityIcons name="package-variant" size={24} color={colors.textSecondary} />
            </View>
          )}
        </View>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: LAYOUT.SPACING.XXL,
    }}>
      <MaterialCommunityIcons name="package-variant" size={48} color={colors.primary} style={{ marginBottom: LAYOUT.SPACING.MD }} />
      <Text style={{
        fontSize: TYPOGRAPHY.FONT_SIZE.LG,
        fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
        color: colors.text,
        marginBottom: LAYOUT.SPACING.SM,
        textAlign: 'center',
      }}>
        {searchQuery ? 'No se encontraron productos' : 'No hay productos'}
      </Text>
      <Text style={{
        fontSize: TYPOGRAPHY.FONT_SIZE.MD,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: LAYOUT.SPACING.LG,
        paddingHorizontal: LAYOUT.SPACING.LG,
      }}>
        {searchQuery
          ? 'Intenta con otros términos de búsqueda'
          : 'Agrega productos para empezar a crear presupuestos'
        }
      </Text>

      {!searchQuery && canManageProducts && (
        <TouchableOpacity
          onPress={handleAddProduct}
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: LAYOUT.SPACING.LG,
            paddingVertical: LAYOUT.SPACING.MD,
            borderRadius: LAYOUT.BORDER_RADIUS.MD,
          }}
        >
          <Text style={{
            color: colors.background,
            fontSize: TYPOGRAPHY.FONT_SIZE.MD,
            fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
          }}>
            Agregar primer producto
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // ===============================
  // LOADING STATE
  // ===============================

  if (isLoading) {
    return <Loading message="Cargando productos..." />;
  }

  // ===============================
  // RENDER
  // ===============================

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Search Header */}
      <View style={{
        paddingHorizontal: LAYOUT.SPACING.LG,
        paddingVertical: LAYOUT.SPACING.MD,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
        <Input
          placeholder="Buscar productos..."
          value={searchQuery}
          onChangeText={handleSearchChange}
          leftIcon={
            <MaterialCommunityIcons name="magnify" size={20} color={colors.textSecondary} />
          }
          rightIcon={searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : undefined}
          onRightIconPress={searchQuery ? () => setSearchQuery('') : undefined}
        />
      </View>

      {/* Error Message */}
      {error && (
        <ErrorMessage
          message={error}
          variant="banner"
          onRetry={loadProducts}
        />
      )}

      {/* Products List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => {
          console.log('🔑 ProductList keyExtractor called for:', item.name, '- _id:', item._id);
          return item._id;
        }}
        renderItem={renderProductCard}
        contentContainerStyle={{
          padding: LAYOUT.SPACING.LG,
          flexGrow: 1,
        }}
        // Temporarily disabled to debug VirtualizedList warning
        // refreshControl={
        //   <RefreshControl
        //     refreshing={isRefreshing}
        //     onRefresh={handleRefresh}
        //     colors={[COLORS.primary]}
        //     tintColor={COLORS.primary}
        //   />
        // }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default ProductListScreen;