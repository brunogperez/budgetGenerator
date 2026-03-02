// ===============================
// CREATE QUOTE SCREEN - PRESUPUESTOS APP
// ===============================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StackScreenProps } from '@react-navigation/stack';

// Components
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loading from '../../components/common/Loading';

// Services
import * as productService from '../../services/productService';
import * as quoteService from '../../services/quoteService';

// Types
import { Product, Quote, QuoteStackParamList, CreateQuoteRequest, CustomerFormData } from '../../types';

// Constants
import { COLORS, LAYOUT, TYPOGRAPHY } from '../../constants/config';

// Theme
import { useTheme } from '../../context/ThemeContext';

// ===============================
// TYPES
// ===============================

type CreateQuoteScreenProps = StackScreenProps<QuoteStackParamList, 'CreateQuote'>;

interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

interface QuoteFormData {
  customer: CustomerFormData;
  items: CartItem[];
  discount: string;
  tax: string;
  notes: string;
}

// ===============================
// CREATE QUOTE SCREEN
// ===============================

const CreateQuoteScreen: React.FC<CreateQuoteScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();

  // ===============================
  // STATE
  // ===============================

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProductPicker, setShowProductPicker] = useState(false);

  const [formData, setFormData] = useState<QuoteFormData>({
    customer: {
      name: '',
      email: '',
      phone: '',
    },
    items: [],
    discount: '0',
    tax: '21',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
        limit: 100,
        sortBy: 'name',
        sortOrder: 'asc',
        isActive: true,
      });
      setProducts(response.items.filter(p => p.stock > 0));
    } catch (err: any) {
      setError(err.message || 'Error cargando productos');
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleInputChange = (section: keyof QuoteFormData | 'form', field: string, value: string) => {
    if (section === 'customer') {
      setFormData(prev => ({
        ...prev,
        customer: { ...prev.customer, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }

    // Limpiar errores
    const errorKey = section === 'customer' ? `customer${field.charAt(0).toUpperCase() + field.slice(1)}` : field;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
    }

    if (error) {
      setError('');
    }
  };

  const addProductToQuote = (product: Product) => {
    const existingItemIndex = formData.items.findIndex(item => item.product._id === product._id);

    if (existingItemIndex >= 0) {
      // Incrementar cantidad si ya existe
      updateItemQuantity(existingItemIndex, formData.items[existingItemIndex].quantity + 1);
    } else {
      // Agregar nuevo item
      const newItem: CartItem = {
        product,
        quantity: 1,
        subtotal: product.price,
      };

      setFormData(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }));
    }

    setShowProductPicker(false);
  };

  const updateItemQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(index);
      return;
    }

    const item = formData.items[index];
    const stockCheck = productService.checkStockAvailability(item.product, newQuantity);

    if (!stockCheck.available) {
      Alert.alert('Stock insuficiente', stockCheck.message);
      return;
    }

    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index
          ? { ...item, quantity: newQuantity, subtotal: item.product.price * newQuantity }
          : item
      )
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.subtotal, 0);
    const discountAmount = (subtotal * parseFloat(formData.discount || '0')) / 100;
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = (afterDiscount * parseFloat(formData.tax || '0')) / 100;
    const total = afterDiscount + taxAmount;

    return {
      subtotal,
      discountAmount,
      taxAmount,
      total,
    };
  };

  const validateForm = (): boolean => {
    console.log('🔍 ValidateForm called');

    const requestData: CreateQuoteRequest = {
      customer: formData.customer,
      items: formData.items?.map(item => ({
        productId: item.product._id,
        quantity: item.quantity,
      })) || [],
      discount: parseFloat(formData.discount || '0'),
      tax: parseFloat(formData.tax || '0'),
      ...(formData.notes.trim() && { notes: formData.notes.trim() }),
    };

    console.log('📋 Request data for validation:', requestData);

    const validation = quoteService.validateQuoteData(requestData);
    console.log('📊 Validation result:', validation);

    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleSubmit = async () => {
    console.log('🚀 HandleSubmit called');
    console.log('📝 Form data:', formData);
    console.log('📦 Items count:', formData.items?.length || 0);
    console.log('💾 Is saving:', isSaving);

    if (!validateForm()) {
      console.log('❌ Validation failed');
      console.log('💥 Validation errors:', errors);
      return;
    }

    console.log('✅ Validation passed');

    try {
      setIsSaving(true);
      setError('');

      const quoteData: CreateQuoteRequest = {
        customer: formData.customer,
        items: formData.items.map(item => ({
          productId: item.product._id,
          quantity: item.quantity,
        })),
        discount: parseFloat(formData.discount || '0'),
        tax: parseFloat(formData.tax || '0'),
        ...(formData.notes.trim() && { notes: formData.notes.trim() }),
      };

      console.log('📋 Quote data completo:', JSON.stringify(quoteData, null, 2));

      const savedQuote = await quoteService.createQuote(quoteData);

      Alert.alert(
        'Éxito',
        'Presupuesto creado correctamente',
        [
          {
            text: 'Ver presupuesto',
            onPress: () => {
              navigation.replace('QuoteDetail', { quoteId: savedQuote._id });
            },
          },
        ]
      );

    } catch (err: any) {
      console.log('❌ Error completo:', err);
      console.log('❌ Error response:', err.response?.data);
      console.log('❌ Error details:', err.response?.data?.error?.details);
      setError(err.message || 'Error creando presupuesto');
    } finally {
      setIsSaving(false);
    }
  };

  const totals = calculateTotals();

  // ===============================
  // RENDER FUNCTIONS
  // ===============================

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      onPress={() => addProductToQuote(item)}
      style={{
        flexDirection: 'row',
        padding: LAYOUT.SPACING.MD,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        alignItems: 'center',
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: TYPOGRAPHY.FONT_SIZE.MD,
          fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
          color: colors.text,
        }}>
          {item.name}
        </Text>
        <Text style={{
          fontSize: TYPOGRAPHY.FONT_SIZE.SM,
          color: colors.textSecondary,
        }}>
          Stock: {item.stock} • ${item.price.toLocaleString('es-AR')}
        </Text>
      </View>
      <MaterialCommunityIcons name="plus" size={20} color={colors.primary} />
    </TouchableOpacity>
  );

  const renderCartItem = ({ item, index }: { item: CartItem; index: number }) => (
    <Card variant="outlined" padding="md" style={{ marginBottom: LAYOUT.SPACING.MD }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: TYPOGRAPHY.FONT_SIZE.MD,
            fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
            color: colors.text,
          }}>
            {item.product.name}
          </Text>
          <Text style={{
            fontSize: TYPOGRAPHY.FONT_SIZE.SM,
            color: colors.textSecondary,
          }}>
            ${item.product.price.toLocaleString('es-AR')} c/u
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: LAYOUT.SPACING.SM }}>
          <TouchableOpacity
            onPress={() => updateItemQuantity(index, item.quantity - 1)}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: colors.backgroundSecondary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 18, color: colors.text }}>−</Text>
          </TouchableOpacity>

          <Text style={{
            fontSize: TYPOGRAPHY.FONT_SIZE.MD,
            fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
            color: colors.text,
            minWidth: 32,
            textAlign: 'center',
          }}>
            {item.quantity}
          </Text>

          <TouchableOpacity
            onPress={() => updateItemQuantity(index, item.quantity + 1)}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 18, color: colors.background }}>+</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => removeItem(index)}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: COLORS.errorLight + '20',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: LAYOUT.SPACING.SM,
            }}
          >
            <MaterialCommunityIcons name="delete-outline" size={16} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: LAYOUT.SPACING.SM,
        paddingTop: LAYOUT.SPACING.SM,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}>
        <Text style={{
          fontSize: TYPOGRAPHY.FONT_SIZE.SM,
          color: colors.textSecondary,
        }}>
          Subtotal:
        </Text>
        <Text style={{
          fontSize: TYPOGRAPHY.FONT_SIZE.MD,
          fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
          color: colors.primary,
        }}>
          ${item.subtotal.toLocaleString('es-AR')}
        </Text>
      </View>
    </Card>
  );

  // ===============================
  // LOADING STATE
  // ===============================

  if (isLoading) {
    return <Loading message="Cargando productos..." />;
  }


  // ===============================
  // MAIN FORM
  // ===============================

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {showProductPicker ? (
        // Render product picker modal outside ScrollView
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          {/* Header */}
          <View style={{
            paddingHorizontal: LAYOUT.SPACING.LG,
            paddingTop: LAYOUT.SPACING.LG,
            paddingBottom: LAYOUT.SPACING.MD,
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: LAYOUT.SPACING.MD,
            }}>
              <Text style={{
                fontSize: TYPOGRAPHY.FONT_SIZE.LG,
                fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
                color: colors.text,
              }}>
                Seleccionar Producto
              </Text>
              <Button
                title="Cerrar"
                variant="secondary"
                size="sm"
                onPress={() => setShowProductPicker(false)}
              />
            </View>

            <Input
              placeholder="Buscar productos..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              leftIcon={
                <MaterialCommunityIcons name="magnify" size={20} color={colors.textSecondary} />
              }
            />
          </View>

          {/* Products List */}
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item._id}
            renderItem={renderProductItem}
            ListEmptyComponent={
              <View style={{ padding: LAYOUT.SPACING.XL, alignItems: 'center' }}>
                <Text style={{
                  fontSize: TYPOGRAPHY.FONT_SIZE.MD,
                  color: colors.textSecondary,
                  textAlign: 'center',
                }}>
                  {searchQuery ? 'No se encontraron productos' : 'No hay productos disponibles'}
                </Text>
              </View>
            }
          />
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1, backgroundColor: colors.background }}
          contentContainerStyle={{ padding: LAYOUT.SPACING.LG }}
          keyboardShouldPersistTaps="handled"
        >
        {/* General Error */}
        {error && (
          <ErrorMessage
            message={error}
            variant="inline"
            onDismiss={() => setError('')}
            style={{ marginBottom: LAYOUT.SPACING.MD }}
          />
        )}

        {/* Customer Information */}
        <Card variant="outlined" padding="lg" style={{ marginBottom: LAYOUT.SPACING.LG }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: LAYOUT.SPACING.MD }}>
            <MaterialCommunityIcons name="account-outline" size={20} color={colors.text} style={{ marginRight: 8 }} />
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.LG,
              fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
              color: colors.text,
            }}>
              Información del Cliente
            </Text>
          </View>

          <Input
            label="Nombre completo"
            placeholder="Nombre del cliente"
            value={formData.customer.name}
            onChangeText={(text) => handleInputChange('customer', 'name', text)}
            error={errors.customerName}
            required
            leftIcon={
              <MaterialCommunityIcons name="account-outline" size={20} color={colors.textSecondary} />
            }
          />

          <Input
            label="Email"
            placeholder="cliente@email.com"
            value={formData.customer.email}
            onChangeText={(text) => handleInputChange('customer', 'email', text)}
            error={errors.customerEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={
              <MaterialCommunityIcons name="email-outline" size={20} color={colors.textSecondary} />
            }
          />

          <Input
            label="Teléfono"
            placeholder="+54 9 11 1234-5678"
            value={formData.customer.phone}
            onChangeText={(text) => handleInputChange('customer', 'phone', text)}
            error={errors.customerPhone}
            keyboardType="phone-pad"
            leftIcon={
              <MaterialCommunityIcons name="phone-outline" size={20} color={colors.textSecondary} />
            }
          />
        </Card>

        {/* Products Section */}
        <Card variant="outlined" padding="lg" style={{ marginBottom: LAYOUT.SPACING.LG }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: LAYOUT.SPACING.MD,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="package-variant" size={20} color={colors.text} style={{ marginRight: 8 }} />
              <Text style={{
                fontSize: TYPOGRAPHY.FONT_SIZE.LG,
                fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
                color: colors.text,
              }}>
                Productos ({formData.items?.length || 0})
              </Text>
            </View>

            <Button
              title="Agregar"
              variant="outline"
              size="sm"
              onPress={() => setShowProductPicker(true)}
              leftIcon={<MaterialCommunityIcons name="plus" size={14} color={colors.primary} style={{ marginRight: 4 }} />}
            />
          </View>

          {(formData.items?.length || 0) === 0 ? (
            <View style={{
              padding: LAYOUT.SPACING.XL,
              alignItems: 'center',
              backgroundColor: colors.backgroundSecondary,
              borderRadius: LAYOUT.BORDER_RADIUS.MD,
            }}>
              <Text style={{
                fontSize: TYPOGRAPHY.FONT_SIZE.MD,
                color: colors.textSecondary,
                textAlign: 'center',
              }}>
                No hay productos agregados{'\n'}
                Toca "Agregar" para seleccionar productos
              </Text>
            </View>
          ) : (
            <View key="cart-items-container">
              {formData.items?.map((item, index) => (
                <View key={`cart-item-${item.product?._id || 'unknown'}-${index}`}>
                  {renderCartItem({ item, index })}
                </View>
              ))}
            </View>
          )}

          {errors.items && (
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.SM,
              color: colors.error,
              marginTop: LAYOUT.SPACING.SM,
            }}>
              {errors.items}
            </Text>
          )}
        </Card>

        {/* Pricing Section */}
        <Card variant="outlined" padding="lg" style={{ marginBottom: LAYOUT.SPACING.LG }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: LAYOUT.SPACING.MD }}>
            <MaterialCommunityIcons name="currency-usd" size={20} color={colors.text} style={{ marginRight: 8 }} />
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.LG,
              fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
              color: colors.text,
            }}>
              Precios y Totales
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: LAYOUT.SPACING.MD }}>
            <View style={{ flex: 1 }}>
              <Input
                label="Descuento (%)"
                placeholder="0"
                value={formData.discount}
                onChangeText={(text) => handleInputChange('form', 'discount', text)}
                error={errors.discount}
                keyboardType="numeric"
                leftIcon={
                  <MaterialCommunityIcons name="tag-outline" size={20} color={colors.textSecondary} />
                }
              />
            </View>

            <View style={{ flex: 1 }}>
              <Input
                label="Impuesto (%)"
                placeholder="21"
                value={formData.tax}
                onChangeText={(text) => handleInputChange('form', 'tax', text)}
                error={errors.tax}
                keyboardType="numeric"
                leftIcon={
                  <MaterialCommunityIcons name="chart-bar" size={20} color={colors.textSecondary} />
                }
              />
            </View>
          </View>

          {/* Totals Summary */}
          <View style={{
            backgroundColor: colors.backgroundSecondary,
            padding: LAYOUT.SPACING.MD,
            borderRadius: LAYOUT.BORDER_RADIUS.MD,
            marginTop: LAYOUT.SPACING.MD,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: LAYOUT.SPACING.XS }}>
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE.MD, color: colors.textSecondary }}>Subtotal:</Text>
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE.MD, color: colors.text }}>${totals.subtotal.toLocaleString('es-AR')}</Text>
            </View>

            {totals.discountAmount > 0 && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: LAYOUT.SPACING.XS }}>
                <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE.MD, color: colors.textSecondary }}>Descuento:</Text>
                <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE.MD, color: colors.error }}>-${totals.discountAmount.toLocaleString('es-AR')}</Text>
              </View>
            )}

            {totals.taxAmount > 0 && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: LAYOUT.SPACING.XS }}>
                <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE.MD, color: colors.textSecondary }}>Impuesto:</Text>
                <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE.MD, color: colors.text }}>+${totals.taxAmount.toLocaleString('es-AR')}</Text>
              </View>
            )}

            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingTop: LAYOUT.SPACING.SM,
              marginTop: LAYOUT.SPACING.SM,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}>
              <Text style={{
                fontSize: TYPOGRAPHY.FONT_SIZE.LG,
                fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
                color: colors.text,
              }}>
                Total:
              </Text>
              <Text style={{
                fontSize: TYPOGRAPHY.FONT_SIZE.LG,
                fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
                color: colors.primary,
              }}>
                ${totals.total.toLocaleString('es-AR')}
              </Text>
            </View>
          </View>
        </Card>

        {/* Notes Section */}
        <Card variant="outlined" padding="lg" style={{ marginBottom: LAYOUT.SPACING.LG }}>
          <Input
            label="Notas adicionales"
            placeholder="Información adicional sobre el presupuesto..."
            value={formData.notes}
            onChangeText={(text) => handleInputChange('form', 'notes', text)}
            error={errors.notes}
            multiline
            numberOfLines={3}
            style={{ textAlignVertical: 'top' }}
            leftIcon={
              <MaterialCommunityIcons name="note-text-outline" size={20} color={colors.textSecondary} style={{ marginTop: LAYOUT.SPACING.SM }} />
            }
          />
        </Card>

        {/* Actions */}
        <View style={{
          flexDirection: 'row',
          gap: LAYOUT.SPACING.MD,
          marginBottom: LAYOUT.SPACING.XL,
        }}>
          <Button
            title="Cancelar"
            variant="outline"
            onPress={() => navigation.goBack()}
            style={{ flex: 1 }}
            disabled={isSaving}
          />

          <Button
            title="Crear Presupuesto"
            onPress={handleSubmit}
            loading={isSaving}
            disabled={isSaving || (formData.items?.length || 0) === 0}
            style={{
              flex: 2,
              opacity: (isSaving || (formData.items?.length || 0) === 0) ? 0.5 : 1
            }}
          />
        </View>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
};

export default CreateQuoteScreen;