// ===============================
// PRODUCT DETAIL SCREEN - PRESUPUESTOS APP
// ===============================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';

// Components
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
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

type ProductDetailScreenProps = StackScreenProps<ProductStackParamList, 'ProductDetail'>;

// ===============================
// PRODUCT DETAIL SCREEN
// ===============================

const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({ route, navigation }) => {
  // ===============================
  // PARAMS
  // ===============================

  const { productId } = route.params;

  // ===============================
  // HOOKS
  // ===============================

  const { user } = useAuth();

  // ===============================
  // STATE
  // ===============================

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);

  // ===============================
  // EFFECTS
  // ===============================

  useEffect(() => {
    loadProduct();
  }, [productId]);

  // ===============================
  // HANDLERS
  // ===============================

  const loadProduct = async () => {
    try {
      setError('');
      setIsLoading(true);
      const productData = await productService.getProductById(productId);
      setProduct(productData);
    } catch (err: any) {
      setError(err.message || 'Error cargando producto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProduct = () => {
    if (!product) return;
    navigation.navigate('ProductForm', { productId: product._id });
  };

  const handleDeleteProduct = () => {
    if (!product) return;

    Alert.alert(
      'Eliminar Producto',
      `¿Estás seguro que quieres eliminar "${product.name}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: confirmDeleteProduct,
        },
      ]
    );
  };

  const confirmDeleteProduct = async () => {
    if (!product) return;

    try {
      setIsDeleting(true);
      await productService.deleteProduct(product._id);
      Alert.alert(
        'Éxito',
        'Producto eliminado correctamente',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Error eliminando producto');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddToQuote = () => {
    Alert.alert('Info', 'Funcionalidad en desarrollo');
  };

  const canManageProducts = user?.role === 'admin' || user?.role === 'seller';

  // ===============================
  // LOADING STATE
  // ===============================

  if (isLoading) {
    return <Loading message="Cargando producto..." />;
  }

  // ===============================
  // ERROR STATE
  // ===============================

  if (error || !product) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>
        <ErrorMessage
          message={error || 'Producto no encontrado'}
          variant="card"
          onRetry={loadProduct}
          style={{ margin: LAYOUT.SPACING.LG }}
        />
      </View>
    );
  }

  // ===============================
  // RENDER FUNCTIONS
  // ===============================

  const stockStatus = productService.getStockStatus(product.stock);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      contentContainerStyle={{ padding: LAYOUT.SPACING.LG }}
    >
      {/* Product Image Placeholder */}
      <Card variant="outlined" padding="xl" style={{ marginBottom: LAYOUT.SPACING.LG }}>
        <View style={{
          alignItems: 'center',
          justifyContent: 'center',
          height: 200,
          backgroundColor: COLORS.backgroundSecondary,
          borderRadius: LAYOUT.BORDER_RADIUS.LG,
        }}>
          <Text style={{ fontSize: 64 }}>📦</Text>
          {product.imageUrl && (
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.SM,
              color: COLORS.textSecondary,
              marginTop: LAYOUT.SPACING.SM,
            }}>
              Imagen disponible
            </Text>
          )}
        </View>
      </Card>

      {/* Product Info */}
      <Card variant="outlined" padding="lg" style={{ marginBottom: LAYOUT.SPACING.LG }}>
        <Text style={{
          fontSize: TYPOGRAPHY.FONT_SIZE.XXL,
          fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
          color: COLORS.text,
          marginBottom: LAYOUT.SPACING.SM,
        }}>
          {product.name}
        </Text>

        <Text style={{
          fontSize: TYPOGRAPHY.FONT_SIZE.MD,
          color: COLORS.textSecondary,
          lineHeight: 22,
          marginBottom: LAYOUT.SPACING.LG,
        }}>
          {product.description}
        </Text>

        {/* Price */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: LAYOUT.SPACING.MD,
        }}>
          <Text style={{
            fontSize: TYPOGRAPHY.FONT_SIZE.MD,
            color: COLORS.textSecondary,
          }}>
            Precio
          </Text>
          <Text style={{
            fontSize: TYPOGRAPHY.FONT_SIZE.XXL,
            fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
            color: COLORS.primary,
          }}>
            {productService.formatPrice(product.price)}
          </Text>
        </View>

        {/* Stock */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: LAYOUT.SPACING.MD,
        }}>
          <Text style={{
            fontSize: TYPOGRAPHY.FONT_SIZE.MD,
            color: COLORS.textSecondary,
          }}>
            Stock disponible
          </Text>
          <View style={{
            backgroundColor: stockStatus.color + '20',
            paddingHorizontal: LAYOUT.SPACING.MD,
            paddingVertical: LAYOUT.SPACING.SM,
            borderRadius: LAYOUT.BORDER_RADIUS.MD,
            borderWidth: 1,
            borderColor: stockStatus.color,
          }}>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.MD,
              fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
              color: stockStatus.color,
            }}>
              {product.stock} unidades
            </Text>
          </View>
        </View>

        {/* Category */}
        {product.category && (
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: LAYOUT.SPACING.MD,
          }}>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.MD,
              color: COLORS.textSecondary,
            }}>
              Categoría
            </Text>
            <View style={{
              backgroundColor: COLORS.backgroundSecondary,
              paddingHorizontal: LAYOUT.SPACING.MD,
              paddingVertical: LAYOUT.SPACING.SM,
              borderRadius: LAYOUT.BORDER_RADIUS.MD,
            }}>
              <Text style={{
                fontSize: TYPOGRAPHY.FONT_SIZE.MD,
                color: COLORS.text,
              }}>
                {product.category}
              </Text>
            </View>
          </View>
        )}

        {/* SKU */}
        {product.sku && (
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: LAYOUT.SPACING.MD,
          }}>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.MD,
              color: COLORS.textSecondary,
            }}>
              SKU
            </Text>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.MD,
              fontFamily: 'monospace',
              color: COLORS.text,
            }}>
              {product.sku}
            </Text>
          </View>
        )}

        {/* Created Date */}
        {product.createdAt && (
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: LAYOUT.SPACING.MD,
            borderTopWidth: 1,
            borderTopColor: COLORS.border,
          }}>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.SM,
              color: COLORS.textSecondary,
            }}>
              Creado el
            </Text>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.SM,
              color: COLORS.textSecondary,
            }}>
              {new Date(product.createdAt).toLocaleDateString('es-AR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
        )}
      </Card>

      {/* Stock Alert */}
      {product.stock <= 5 && product.stock > 0 && (
        <Card
          variant="filled"
          padding="md"
          style={{
            marginBottom: LAYOUT.SPACING.LG,
            backgroundColor: COLORS.warningLight + '20',
            borderWidth: 1,
            borderColor: COLORS.warning,
          }}
        >
          <Text style={{
            fontSize: TYPOGRAPHY.FONT_SIZE.MD,
            color: COLORS.warning,
            fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
            textAlign: 'center',
          }}>
            ⚠️ Stock bajo: Solo quedan {product.stock} unidades
          </Text>
        </Card>
      )}

      {/* Out of Stock Alert */}
      {product.stock === 0 && (
        <Card
          variant="filled"
          padding="md"
          style={{
            marginBottom: LAYOUT.SPACING.LG,
            backgroundColor: COLORS.errorLight + '20',
            borderWidth: 1,
            borderColor: COLORS.error,
          }}
        >
          <Text style={{
            fontSize: TYPOGRAPHY.FONT_SIZE.MD,
            color: COLORS.error,
            fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
            textAlign: 'center',
          }}>
            ❌ Producto sin stock
          </Text>
        </Card>
      )}

      {/* Actions */}
      <View style={{ gap: LAYOUT.SPACING.MD }}>
        {/* Add to Quote Button */}
        {product.stock > 0 && (
          <Button
            title="Agregar a Presupuesto"
            onPress={handleAddToQuote}
            fullWidth
            leftIcon={<Text style={{ fontSize: 16, marginRight: LAYOUT.SPACING.SM }}>📋</Text>}
          />
        )}

        {/* Admin Actions */}
        {canManageProducts && (
          <View style={{ gap: LAYOUT.SPACING.SM }}>
            <Button
              title="Editar Producto"
              variant="outline"
              onPress={handleEditProduct}
              fullWidth
              leftIcon={<Text style={{ fontSize: 16, marginRight: LAYOUT.SPACING.SM }}>✏️</Text>}
            />

            <Button
              title="Eliminar Producto"
              variant="danger"
              onPress={handleDeleteProduct}
              loading={isDeleting}
              disabled={isDeleting}
              fullWidth
              leftIcon={<Text style={{ fontSize: 16, marginRight: LAYOUT.SPACING.SM }}>🗑️</Text>}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default ProductDetailScreen;