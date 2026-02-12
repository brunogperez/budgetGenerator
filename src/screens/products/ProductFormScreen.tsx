// ===============================
// PRODUCT FORM SCREEN - PRESUPUESTOS APP
// ===============================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';

// Components
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loading from '../../components/common/Loading';

// Services
import * as productService from '../../services/productService';

// Types
import { Product, ProductStackParamList, CreateProductRequest, ProductFormData } from '../../types';

// Constants
import { COLORS, LAYOUT, TYPOGRAPHY } from '../../constants/config';

// ===============================
// TYPES
// ===============================

type ProductFormScreenProps = StackScreenProps<ProductStackParamList, 'ProductForm'>;

// ===============================
// PRODUCT FORM SCREEN
// ===============================

const ProductFormScreen: React.FC<ProductFormScreenProps> = ({ route, navigation }) => {
  // ===============================
  // PARAMS
  // ===============================

  const productId = route.params?.productId;
  const isEditing = Boolean(productId);

  // ===============================
  // STATE
  // ===============================

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    sku: '',
    imageUrl: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<string[]>([]);

  // ===============================
  // EFFECTS
  // ===============================

  useEffect(() => {
    loadCategories();
    if (isEditing && productId) {
      loadProduct(productId);
    }
  }, [isEditing, productId]);

  // ===============================
  // HANDLERS
  // ===============================

  const loadCategories = async () => {
    try {
      const categoriesData = await productService.getProductCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProduct = async (id: string) => {
    try {
      setIsLoading(true);
      const product = await productService.getProductById(id);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        stock: product.stock.toString(),
        category: product.category,
        sku: product.sku || '',
        imageUrl: product.imageUrl || '',
      });
    } catch (err: any) {
      setError(err.message || 'Error cargando producto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Limpiar error general
    if (error) {
      setError('');
    }

    // Auto-generar SKU cuando cambia nombre o categoría
    if (field === 'name' || field === 'category') {
      if (!formData.sku && formData.name && formData.category) {
        const autoSku = productService.generateSKU(
          field === 'name' ? value : formData.name,
          field === 'category' ? value : formData.category
        );
        setFormData(prev => ({ ...prev, sku: autoSku }));
      }
    }
  };

  const validateForm = (): boolean => {
    const productRequest: CreateProductRequest = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price) || 0,
      stock: parseInt(formData.stock) || 0,
      category: formData.category.trim(),
      sku: formData.sku?.trim() || undefined,
      imageUrl: formData.imageUrl?.trim() || undefined,
    };

    const validation = productService.validateProductData(productRequest);
    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);
      setError('');

      const productData: CreateProductRequest = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: formData.category.trim(),
        sku: formData.sku?.trim() || undefined,
        imageUrl: formData.imageUrl?.trim() || undefined,
      };

      let savedProduct: Product;

      if (isEditing && productId) {
        savedProduct = await productService.updateProduct(productId, productData);
        Alert.alert('Éxito', 'Producto actualizado correctamente');
      } else {
        savedProduct = await productService.createProduct(productData);
        Alert.alert('Éxito', 'Producto creado correctamente');
      }

      // Navigate to product detail
      navigation.replace('ProductDetail', { productId: savedProduct._id });

    } catch (err: any) {
      setError(err.message || 'Error guardando producto');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const generateSKU = () => {
    if (formData.name && formData.category) {
      const generatedSKU = productService.generateSKU(formData.name, formData.category);
      handleInputChange('sku', generatedSKU);
    }
  };

  // ===============================
  // LOADING STATE
  // ===============================

  if (isLoading) {
    return <Loading message={isEditing ? 'Cargando producto...' : 'Preparando formulario...'} />;
  }

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
        contentContainerStyle={{ padding: LAYOUT.SPACING.LG }}
        keyboardShouldPersistTaps="handled"
      >
        <Card variant="outlined" padding="lg">
          {/* Header */}
          <View style={{ marginBottom: LAYOUT.SPACING.LG }}>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.XL,
              fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
              color: COLORS.text,
              textAlign: 'center',
              marginBottom: LAYOUT.SPACING.SM,
            }}>
              {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
            </Text>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.MD,
              color: COLORS.textSecondary,
              textAlign: 'center',
            }}>
              {isEditing ? 'Modifica los datos del producto' : 'Completa la información del producto'}
            </Text>
          </View>

          {/* General Error */}
          {error && (
            <ErrorMessage
              message={error}
              variant="inline"
              onDismiss={() => setError('')}
              style={{ marginBottom: LAYOUT.SPACING.MD }}
            />
          )}

          {/* Name Input */}
          <Input
            label="Nombre del producto"
            placeholder="Ej: Laptop HP Pavilion"
            value={formData.name}
            onChangeText={(text) => handleInputChange('name', text)}
            error={errors.name}
            required
            leftIcon={
              <Text style={{ fontSize: 16, color: COLORS.textSecondary }}>
                📦
              </Text>
            }
          />

          {/* Description Input */}
          <Input
            label="Descripción"
            placeholder="Describe las características del producto"
            value={formData.description}
            onChangeText={(text) => handleInputChange('description', text)}
            error={errors.description}
            required
            multiline
            numberOfLines={3}
            style={{ textAlignVertical: 'top' }}
            leftIcon={
              <Text style={{ fontSize: 16, color: COLORS.textSecondary, marginTop: LAYOUT.SPACING.SM }}>
                📝
              </Text>
            }
          />

          {/* Price and Stock Row */}
          <View style={{ flexDirection: 'row', gap: LAYOUT.SPACING.MD }}>
            <View style={{ flex: 1 }}>
              <Input
                label="Precio"
                placeholder="0.00"
                value={formData.price}
                onChangeText={(text) => handleInputChange('price', text)}
                error={errors.price}
                keyboardType="numeric"
                required
                leftIcon={
                  <Text style={{ fontSize: 16, color: COLORS.textSecondary }}>
                    💰
                  </Text>
                }
              />
            </View>

            <View style={{ flex: 1 }}>
              <Input
                label="Stock"
                placeholder="0"
                value={formData.stock}
                onChangeText={(text) => handleInputChange('stock', text)}
                error={errors.stock}
                keyboardType="numeric"
                required
                leftIcon={
                  <Text style={{ fontSize: 16, color: COLORS.textSecondary }}>
                    📊
                  </Text>
                }
              />
            </View>
          </View>

          {/* Category Input */}
          <Input
            label="Categoría"
            placeholder="Ej: Electrónicos, Computación"
            value={formData.category}
            onChangeText={(text) => handleInputChange('category', text)}
            error={errors.category}
            required
            leftIcon={
              <Text style={{ fontSize: 16, color: COLORS.textSecondary }}>
                🏷️
              </Text>
            }
          />

          {/* Popular Categories */}
          {categories.length > 0 && (
            <View style={{ marginBottom: LAYOUT.SPACING.MD }}>
              <Text style={{
                fontSize: TYPOGRAPHY.FONT_SIZE.SM,
                color: COLORS.textSecondary,
                marginBottom: LAYOUT.SPACING.SM,
              }}>
                Categorías populares:
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: LAYOUT.SPACING.SM }}>
                {categories.slice(0, 6).map((category) => (
                  <Button
                    key={category}
                    title={category}
                    variant="ghost"
                    size="sm"
                    onPress={() => handleInputChange('category', category)}
                    style={{
                      backgroundColor: formData.category === category ? COLORS.primaryLight + '20' : COLORS.backgroundSecondary,
                      borderColor: formData.category === category ? COLORS.primary : COLORS.border,
                    }}
                  />
                ))}
              </View>
            </View>
          )}

          {/* SKU Input */}
          <Input
            label="SKU (opcional)"
            placeholder="Código único del producto"
            value={formData.sku}
            onChangeText={(text) => handleInputChange('sku', text)}
            error={errors.sku}
            leftIcon={
              <Text style={{ fontSize: 16, color: COLORS.textSecondary }}>
                🏷️
              </Text>
            }
            rightIcon={
              <Button
                title="Auto"
                variant="ghost"
                size="sm"
                onPress={generateSKU}
                disabled={!formData.name || !formData.category}
              />
            }
            helperText="Se genera automáticamente si se deja vacío"
          />

          {/* Image URL Input */}
          <Input
            label="URL de imagen (opcional)"
            placeholder="https://ejemplo.com/imagen.jpg"
            value={formData.imageUrl}
            onChangeText={(text) => handleInputChange('imageUrl', text)}
            error={errors.imageUrl}
            keyboardType="url"
            autoCapitalize="none"
            leftIcon={
              <Text style={{ fontSize: 16, color: COLORS.textSecondary }}>
                🖼️
              </Text>
            }
          />

          {/* Actions */}
          <View style={{
            flexDirection: 'row',
            gap: LAYOUT.SPACING.MD,
            marginTop: LAYOUT.SPACING.LG,
          }}>
            <Button
              title="Cancelar"
              variant="outline"
              onPress={handleCancel}
              style={{ flex: 1 }}
              disabled={isSaving}
            />

            <Button
              title={isEditing ? 'Actualizar' : 'Crear'}
              onPress={handleSubmit}
              loading={isSaving}
              disabled={isSaving}
              style={{ flex: 2 }}
            />
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ProductFormScreen;