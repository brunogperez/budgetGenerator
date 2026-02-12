// ===============================
// QUOTE DETAIL SCREEN - PRESUPUESTOS APP
// ===============================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
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
import * as quoteService from '../../services/quoteService';
import * as paymentService from '../../services/paymentService';
import * as productService from '../../services/productService';

// Types
import { Quote, QuoteItem, QuoteStackParamList } from '../../types';

// Constants
import { COLORS, LAYOUT, TYPOGRAPHY } from '../../constants/config';

// ===============================
// TYPES
// ===============================

type QuoteDetailScreenProps = StackScreenProps<QuoteStackParamList, 'QuoteDetail'>;

// ===============================
// QUOTE DETAIL SCREEN
// ===============================

const QuoteDetailScreen: React.FC<QuoteDetailScreenProps> = ({ route, navigation }) => {
  // ===============================
  // PARAMS
  // ===============================

  const { quoteId } = route.params;

  // ===============================
  // HOOKS
  // ===============================

  const { user } = useAuth();

  // ===============================
  // STATE
  // ===============================

  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGeneratingPayment, setIsGeneratingPayment] = useState(false);

  // ===============================
  // EFFECTS
  // ===============================

  useEffect(() => {
    loadQuote();
  }, [quoteId]);

  // ===============================
  // HANDLERS
  // ===============================

  const loadQuote = async () => {
    try {
      setError('');
      setIsLoading(true);
      const quoteData = await quoteService.getQuoteById(quoteId);
      setQuote(quoteData);
    } catch (err: any) {
      setError(err.message || 'Error cargando presupuesto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditQuote = () => {
    if (!quote) return;
    // Navigate to edit (could be same CreateQuote screen with edit mode)
    navigation.navigate('CreateQuote', { quoteId: quote._id } as any);
  };

  const handleDeleteQuote = () => {
    if (!quote) return;

    Alert.alert(
      'Eliminar Presupuesto',
      `¿Estás seguro que quieres eliminar el presupuesto ${quote.quoteNumber}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: confirmDeleteQuote,
        },
      ]
    );
  };

  const confirmDeleteQuote = async () => {
    if (!quote) return;

    try {
      setIsDeleting(true);
      await quoteService.cancelQuote(quote._id);
      Alert.alert(
        'Exito',
        'Presupuesto cancelado correctamente',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Error eliminando presupuesto');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGeneratePayment = async () => {
    if (!quote) return;

    try {
      setIsGeneratingPayment(true);
      const payment = await paymentService.createPayment(quote._id);

      // Navigate to QR screen
      navigation.navigate('PaymentQR', { paymentId: payment.paymentId });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Error generando pago');
    } finally {
      setIsGeneratingPayment(false);
    }
  };

  const handleShareQuote = async () => {
    if (!quote) return;

    try {
      const text = `Presupuesto ${quote.quoteNumber}\nCliente: ${quote.customer.name}\nTotal: ${productService.formatPrice(quote.total)}\nEstado: ${quoteService.formatQuoteStatus(quote.status).label}`;
      await Share.share({
        message: text,
        title: `Presupuesto ${quote.quoteNumber}`,
      });
    } catch (err: any) {
      console.error('Error sharing quote:', err);
    }
  };

  const canManageQuotes = user?.role === 'admin' || user?.role === 'seller';

  // ===============================
  // LOADING STATE
  // ===============================

  if (isLoading) {
    return <Loading message="Cargando presupuesto..." />;
  }

  // ===============================
  // ERROR STATE
  // ===============================

  if (error || !quote) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>
        <ErrorMessage
          message={error || 'Presupuesto no encontrado'}
          variant="card"
          onRetry={loadQuote}
          style={{ margin: LAYOUT.SPACING.LG }}
        />
      </View>
    );
  }

  // ===============================
  // RENDER FUNCTIONS
  // ===============================

  const renderQuoteItem = (item: QuoteItem, index: number) => (
    <View
      key={index}
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: LAYOUT.SPACING.MD,
        borderBottomWidth: index < (quote.items?.length || 0) - 1 ? 1 : 0,
        borderBottomColor: COLORS.border,
      }}
    >
      <View style={{ flex: 1, marginRight: LAYOUT.SPACING.MD }}>
        <Text style={{
          fontSize: TYPOGRAPHY.FONT_SIZE.MD,
          fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
          color: COLORS.text,
          marginBottom: LAYOUT.SPACING.XS,
        }}>
          {item.product.name}
        </Text>

        {item.product.description && (
          <Text style={{
            fontSize: TYPOGRAPHY.FONT_SIZE.SM,
            color: COLORS.textSecondary,
            marginBottom: LAYOUT.SPACING.XS,
          }} numberOfLines={2}>
            {item.product.description}
          </Text>
        )}

        <Text style={{
          fontSize: TYPOGRAPHY.FONT_SIZE.SM,
          color: COLORS.textTertiary,
        }}>
          {productService.formatPrice(item.productSnapshot.price)} x {item.quantity}
        </Text>
      </View>

      <Text style={{
        fontSize: TYPOGRAPHY.FONT_SIZE.LG,
        fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
        color: COLORS.primary,
      }}>
        {productService.formatPrice(item.subtotal)}
      </Text>
    </View>
  );

  const statusInfo = quoteService.formatQuoteStatus(quote.status);
  const timeInfo = quoteService.getTimeUntilExpiration(quote);
  const isExpired = timeInfo.expired;
  const isExpiringSoon = timeInfo.urgency === 'high' && !isExpired;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      contentContainerStyle={{ padding: LAYOUT.SPACING.LG }}
    >
      {/* Header Card */}
      <Card variant="outlined" padding="lg" style={{ marginBottom: LAYOUT.SPACING.LG }}>
        <View style={{ marginBottom: LAYOUT.SPACING.MD }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: LAYOUT.SPACING.SM,
          }}>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.XXL,
              fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
              color: COLORS.text,
              flex: 1,
            }}>
              {quote.quoteNumber}
            </Text>

            <View style={{
              backgroundColor: statusInfo.color + '20',
              paddingHorizontal: LAYOUT.SPACING.MD,
              paddingVertical: LAYOUT.SPACING.SM,
              borderRadius: LAYOUT.BORDER_RADIUS.MD,
              borderWidth: 1,
              borderColor: statusInfo.color,
            }}>
              <Text style={{
                fontSize: TYPOGRAPHY.FONT_SIZE.SM,
                fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
                color: statusInfo.color,
              }}>
                {statusInfo.label}
              </Text>
            </View>
          </View>

          <Text style={{
            fontSize: TYPOGRAPHY.FONT_SIZE.MD,
            color: COLORS.textSecondary,
            marginBottom: LAYOUT.SPACING.XS,
          }}>
            Creado el {new Date(quote.createdAt).toLocaleDateString('es-AR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>

          {quote.expiresAt && (
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.SM,
              color: isExpired ? COLORS.error : isExpiringSoon ? COLORS.warning : COLORS.textTertiary,
              fontWeight: (isExpired || isExpiringSoon) ? TYPOGRAPHY.FONT_WEIGHT.MEDIUM : TYPOGRAPHY.FONT_WEIGHT.REGULAR,
            }}>
              {isExpired ? '❌ Expirado' : `Válido hasta: ${new Date(quote.expiresAt).toLocaleDateString('es-AR')}`}
              {isExpiringSoon && ` (${timeInfo.timeLeft})`}
            </Text>
          )}
        </View>
      </Card>

      {/* Expiration Warning */}
      {isExpired && (
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
            ❌ Este presupuesto ha expirado
          </Text>
        </Card>
      )}

      {isExpiringSoon && (
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
            ⏰ Expira en {timeInfo.timeLeft}
          </Text>
        </Card>
      )}

      {/* Customer Info */}
      <Card variant="outlined" padding="lg" style={{ marginBottom: LAYOUT.SPACING.LG }}>
        <Text style={{
          fontSize: TYPOGRAPHY.FONT_SIZE.LG,
          fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
          color: COLORS.text,
          marginBottom: LAYOUT.SPACING.MD,
        }}>
          👤 Cliente
        </Text>

        <View style={{ marginBottom: LAYOUT.SPACING.SM }}>
          <Text style={{
            fontSize: TYPOGRAPHY.FONT_SIZE.MD,
            fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
            color: COLORS.text,
          }}>
            {quote.customer.name}
          </Text>
        </View>

        {quote.customer.email && (
          <View style={{ marginBottom: LAYOUT.SPACING.SM }}>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.SM,
              color: COLORS.textSecondary,
            }}>
              📧 {quote.customer.email}
            </Text>
          </View>
        )}

        {quote.customer.phone && (
          <View style={{ marginBottom: LAYOUT.SPACING.SM }}>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.SM,
              color: COLORS.textSecondary,
            }}>
              📞 {quote.customer.phone}
            </Text>
          </View>
        )}

        {quote.customer.address && (
          <View>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.SM,
              color: COLORS.textSecondary,
            }}>
              📍 {quote.customer.address}
            </Text>
          </View>
        )}
      </Card>

      {/* Items */}
      <Card variant="outlined" padding="lg" style={{ marginBottom: LAYOUT.SPACING.LG }}>
        <Text style={{
          fontSize: TYPOGRAPHY.FONT_SIZE.LG,
          fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
          color: COLORS.text,
          marginBottom: LAYOUT.SPACING.MD,
        }}>
          📦 Productos ({quote.items?.length || 0})
        </Text>

        {quote.items?.map((item, index) => (
          <View key={item.product?._id || index}>
            {renderQuoteItem(item, index)}
          </View>
        ))}
      </Card>

      {/* Totals */}
      <Card variant="outlined" padding="lg" style={{ marginBottom: LAYOUT.SPACING.LG }}>
        <Text style={{
          fontSize: TYPOGRAPHY.FONT_SIZE.LG,
          fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
          color: COLORS.text,
          marginBottom: LAYOUT.SPACING.MD,
        }}>
          💰 Totales
        </Text>

        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: LAYOUT.SPACING.SM,
        }}>
          <Text style={{
            fontSize: TYPOGRAPHY.FONT_SIZE.MD,
            color: COLORS.textSecondary,
          }}>
            Subtotal
          </Text>
          <Text style={{
            fontSize: TYPOGRAPHY.FONT_SIZE.MD,
            color: COLORS.text,
          }}>
            {productService.formatPrice(quote.subtotal)}
          </Text>
        </View>

        {quote.discount && quote.discount > 0 && (
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: LAYOUT.SPACING.SM,
          }}>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.MD,
              color: COLORS.success,
            }}>
              Descuento
            </Text>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.MD,
              color: COLORS.success,
            }}>
              -{productService.formatPrice(quote.discount)}
            </Text>
          </View>
        )}

        {quote.tax && quote.tax > 0 && (
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: LAYOUT.SPACING.SM,
          }}>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.MD,
              color: COLORS.textSecondary,
            }}>
              Impuestos
            </Text>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.MD,
              color: COLORS.text,
            }}>
              +{productService.formatPrice(quote.tax)}
            </Text>
          </View>
        )}

        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: LAYOUT.SPACING.MD,
          borderTopWidth: 2,
          borderTopColor: COLORS.primary,
        }}>
          <Text style={{
            fontSize: TYPOGRAPHY.FONT_SIZE.XL,
            fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
            color: COLORS.text,
          }}>
            Total
          </Text>
          <Text style={{
            fontSize: TYPOGRAPHY.FONT_SIZE.XXL,
            fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
            color: COLORS.primary,
          }}>
            {productService.formatPrice(quote.total)}
          </Text>
        </View>
      </Card>

      {/* Notes */}
      {quote.notes && (
        <Card variant="outlined" padding="lg" style={{ marginBottom: LAYOUT.SPACING.LG }}>
          <Text style={{
            fontSize: TYPOGRAPHY.FONT_SIZE.LG,
            fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
            color: COLORS.text,
            marginBottom: LAYOUT.SPACING.MD,
          }}>
            📝 Notas
          </Text>
          <Text style={{
            fontSize: TYPOGRAPHY.FONT_SIZE.MD,
            color: COLORS.textSecondary,
            lineHeight: 22,
          }}>
            {quote.notes}
          </Text>
        </Card>
      )}

      {/* Actions */}
      <View style={{ gap: LAYOUT.SPACING.MD }}>
        {/* Share Button */}
        <Button
          title="Compartir Presupuesto"
          variant="outline"
          onPress={handleShareQuote}
          fullWidth
          leftIcon={<Text style={{ fontSize: 16, marginRight: LAYOUT.SPACING.SM }}>📤</Text>}
        />

        {/* Payment Button */}
        {quote.status === 'pending' && !isExpired && canManageQuotes && (
          <Button
            title="Generar Código QR de Pago"
            onPress={handleGeneratePayment}
            loading={isGeneratingPayment}
            disabled={isGeneratingPayment}
            fullWidth
            leftIcon={<Text style={{ fontSize: 16, marginRight: LAYOUT.SPACING.SM }}>💳</Text>}
          />
        )}

        {/* Admin Actions */}
        {canManageQuotes && (
          <View style={{ gap: LAYOUT.SPACING.SM }}>
            <Button
              title="Editar Presupuesto"
              variant="outline"
              onPress={handleEditQuote}
              fullWidth
              disabled={quote.status !== 'pending' || isExpired}
              leftIcon={<Text style={{ fontSize: 16, marginRight: LAYOUT.SPACING.SM }}>✏️</Text>}
            />

            <Button
              title="Eliminar Presupuesto"
              variant="danger"
              onPress={handleDeleteQuote}
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

export default QuoteDetailScreen;