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
import { StackScreenProps } from '@react-navigation/stack';

// Components
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

// Context
import { useAuth } from '../../context/AuthContext';

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
      setProducts(response.products);
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
    navigation.navigate('ProductDetail', { productId: product.id });
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
              color: COLORS.text,
              marginBottom: LAYOUT.SPACING.XS,
            }}>
              {item.name}
            </Text>

            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.SM,
              color: COLORS.textSecondary,
              marginBottom: LAYOUT.SPACING.SM,
              lineHeight: 18,
            }} numberOfLines={2}>
              {item.description}
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{
                fontSize: TYPOGRAPHY.FONT_SIZE.LG,
                fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
                color: COLORS.primary,
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
                  color: COLORS.textTertiary,
                  backgroundColor: COLORS.backgroundSecondary,
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
              backgroundColor: COLORS.backgroundSecondary,
              borderRadius: LAYOUT.BORDER_RADIUS.MD,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Text style={{ fontSize: 24 }}>📦</Text>
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
      <Text style={{ fontSize: 48, marginBottom: LAYOUT.SPACING.MD }}>📦</Text>
      <Text style={{
        fontSize: TYPOGRAPHY.FONT_SIZE.LG,
        fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
        color: COLORS.text,
        marginBottom: LAYOUT.SPACING.SM,
        textAlign: 'center',
      }}>
        {searchQuery ? 'No se encontraron productos' : 'No hay productos'}
      </Text>
      <Text style={{
        fontSize: TYPOGRAPHY.FONT_SIZE.MD,
        color: COLORS.textSecondary,
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
            backgroundColor: COLORS.primary,
            paddingHorizontal: LAYOUT.SPACING.LG,
            paddingVertical: LAYOUT.SPACING.MD,
            borderRadius: LAYOUT.BORDER_RADIUS.MD,
          }}
        >
          <Text style={{
            color: COLORS.background,
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
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Search Header */}
      <View style={{
        paddingHorizontal: LAYOUT.SPACING.LG,
        paddingVertical: LAYOUT.SPACING.MD,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
      }}>
        <Input
          placeholder="Buscar productos..."
          value={searchQuery}
          onChangeText={handleSearchChange}
          leftIcon={
            <Text style={{ fontSize: 16, color: COLORS.textSecondary }}>
              🔍
            </Text>
          }
          rightIcon={searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={{ fontSize: 16, color: COLORS.textSecondary }}>
                ✕
              </Text>
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
        keyExtractor={(item) => item.id}
        renderItem={renderProductCard}
        contentContainerStyle={{
          padding: LAYOUT.SPACING.LG,
          flexGrow: 1,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default ProductListScreen;