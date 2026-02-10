// ===============================
// PAYMENT SUCCESS SCREEN - PRESUPUESTOS APP
// ===============================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
  Easing,
  Share,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';

// Components
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

// Services
import * as paymentService from '../../services/paymentService';
import * as quoteService from '../../services/quoteService';

// Types
import { Payment, Quote, PaymentStackParamList } from '../../types';

// Constants
import { COLORS, LAYOUT, TYPOGRAPHY } from '../../constants/config';

// ===============================
// TYPES
// ===============================

type PaymentSuccessScreenProps = StackScreenProps<PaymentStackParamList, 'PaymentSuccess'>;

// ===============================
// PAYMENT SUCCESS SCREEN
// ===============================

const PaymentSuccessScreen: React.FC<PaymentSuccessScreenProps> = ({ route, navigation }) => {
  // ===============================
  // PARAMS
  // ===============================

  const { paymentId, quoteId } = route.params;

  // ===============================
  // STATE
  // ===============================

  const [payment, setPayment] = useState<Payment | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Animation values
  const [scaleAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));

  // ===============================
  // EFFECTS
  // ===============================

  useEffect(() => {
    loadPaymentData();
  }, [paymentId, quoteId]);

  useEffect(() => {
    // Start success animation
    if (payment && quote) {
      startSuccessAnimation();
    }
  }, [payment, quote]);

  // ===============================
  // HANDLERS
  // ===============================

  const loadPaymentData = async () => {
    try {
      setError('');
      setIsLoading(true);

      const [paymentData, quoteData] = await Promise.all([
        paymentService.getPaymentById(paymentId),
        quoteService.getQuoteById(quoteId),
      ]);

      setPayment(paymentData);
      setQuote(quoteData);
    } catch (err: any) {
      setError(err.message || 'Error cargando información del pago');
    } finally {
      setIsLoading(false);
    }
  };

  const startSuccessAnimation = () => {
    // Reset animations
    scaleAnim.setValue(0);
    fadeAnim.setValue(0);

    // Start scale animation for checkmark
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      }),
    ]).start();

    // Start fade animation for content
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      delay: 400,
      useNativeDriver: true,
    }).start();
  };

  const handleViewQuote = () => {
    if (!quote) return;
    navigation.navigate('QuoteDetail', { quoteId: quote.id });
  };

  const handleCreateNewQuote = () => {
    navigation.navigate('CreateQuote');
  };

  const handleBackToQuotes = () => {
    navigation.navigate('QuoteList');
  };

  const handleShareReceipt = async () => {
    if (!payment || !quote) return;

    try {
      const receipt = paymentService.generatePaymentReceipt(payment, quote);
      await Share.share({
        message: receipt.text,
        title: `Comprobante de Pago - ${quote.quoteNumber}`,
      });
    } catch (err: any) {
      console.error('Error sharing receipt:', err);
    }
  };

  // ===============================
  // LOADING STATE
  // ===============================

  if (isLoading) {
    return <Loading message="Cargando información del pago..." />;
  }

  // ===============================
  // ERROR STATE
  // ===============================

  if (error || !payment || !quote) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>
        <ErrorMessage
          message={error || 'Información del pago no disponible'}
          variant="card"
          onRetry={loadPaymentData}
          style={{ margin: LAYOUT.SPACING.LG }}
        />
      </View>
    );
  }

  // ===============================
  // RENDER
  // ===============================

  const paymentDate = new Date(payment.paidAt || payment.updatedAt);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      contentContainerStyle={{ padding: LAYOUT.SPACING.LG }}
    >
      {/* Success Animation */}
      <View style={{
        alignItems: 'center',
        marginBottom: LAYOUT.SPACING.XXL,
        paddingVertical: LAYOUT.SPACING.XL,
      }}>
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            marginBottom: LAYOUT.SPACING.LG,
          }}
        >
          <View style={{
            width: 120,
            height: 120,
            backgroundColor: COLORS.success,
            borderRadius: 60,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: COLORS.success,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 8,
          }}>
            <Text style={{ fontSize: 48, color: COLORS.background }}>✓</Text>
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
          <Text style={{
            fontSize: TYPOGRAPHY.FONT_SIZE.XXL,
            fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
            color: COLORS.success,
            marginBottom: LAYOUT.SPACING.SM,
            textAlign: 'center',
          }}>
            ¡Pago Exitoso!
          </Text>

          <Text style={{
            fontSize: TYPOGRAPHY.FONT_SIZE.LG,
            color: COLORS.text,
            textAlign: 'center',
            marginBottom: LAYOUT.SPACING.SM,
          }}>
            Tu pago ha sido procesado correctamente
          </Text>

          <Text style={{
            fontSize: TYPOGRAPHY.FONT_SIZE.MD,
            color: COLORS.textSecondary,
            textAlign: 'center',
          }}>
            Recibirás un comprobante por email
          </Text>
        </Animated.View>
      </View>

      {/* Payment Summary */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <Card variant="outlined" padding="lg" style={{ marginBottom: LAYOUT.SPACING.LG }}>
          <Text style={{
            fontSize: TYPOGRAPHY.FONT_SIZE.LG,
            fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
            color: COLORS.text,
            marginBottom: LAYOUT.SPACING.MD,
            textAlign: 'center',
          }}>
            📋 Resumen de la Transacción
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
              Presupuesto
            </Text>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.MD,
              fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
              color: COLORS.text,
            }}>
              {quote.quoteNumber}
            </Text>
          </View>

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
              Cliente
            </Text>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.MD,
              color: COLORS.text,
            }}>
              {quote.customer.name}
            </Text>
          </View>

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
              Fecha del pago
            </Text>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.MD,
              color: COLORS.text,
            }}>
              {paymentDate.toLocaleDateString('es-AR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>

          {payment.transactionId && (
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
                ID de Transacción
              </Text>
              <Text style={{
                fontSize: TYPOGRAPHY.FONT_SIZE.SM,
                fontFamily: 'monospace',
                color: COLORS.textTertiary,
              }}>
                {payment.transactionId}
              </Text>
            </View>
          )}

          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: LAYOUT.SPACING.MD,
            borderTopWidth: 2,
            borderTopColor: COLORS.success,
          }}>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.XL,
              fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
              color: COLORS.text,
            }}>
              Total Pagado
            </Text>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.XXL,
              fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
              color: COLORS.success,
            }}>
              ${payment.amount.toLocaleString('es-AR')}
            </Text>
          </View>
        </Card>

        {/* Quote Details */}
        <Card variant="outlined" padding="lg" style={{ marginBottom: LAYOUT.SPACING.LG }}>
          <Text style={{
            fontSize: TYPOGRAPHY.FONT_SIZE.LG,
            fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
            color: COLORS.text,
            marginBottom: LAYOUT.SPACING.MD,
          }}>
            📦 Productos Incluidos
          </Text>

          {quote.items.slice(0, 3).map((item, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: LAYOUT.SPACING.SM,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: TYPOGRAPHY.FONT_SIZE.MD,
                  color: COLORS.text,
                  marginBottom: LAYOUT.SPACING.XS,
                }}>
                  {item.product.name}
                </Text>
                <Text style={{
                  fontSize: TYPOGRAPHY.FONT_SIZE.SM,
                  color: COLORS.textSecondary,
                }}>
                  {quoteService.formatPrice(item.unitPrice)} × {item.quantity}
                </Text>
              </View>

              <Text style={{
                fontSize: TYPOGRAPHY.FONT_SIZE.MD,
                fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
                color: COLORS.text,
              }}>
                {quoteService.formatPrice(item.subtotal)}
              </Text>
            </View>
          ))}

          {quote.items.length > 3 && (
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.SM,
              color: COLORS.textTertiary,
              fontStyle: 'italic',
              textAlign: 'center',
              marginTop: LAYOUT.SPACING.SM,
            }}>
              y {quote.items.length - 3} producto{quote.items.length - 3 !== 1 ? 's' : ''} más...
            </Text>
          )}
        </Card>

        {/* Success Message */}
        <Card
          variant="filled"
          padding="lg"
          style={{
            marginBottom: LAYOUT.SPACING.LG,
            backgroundColor: COLORS.successLight + '20',
            borderWidth: 1,
            borderColor: COLORS.success,
          }}
        >
          <View style={{ alignItems: 'center' }}>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.LG,
              fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
              color: COLORS.success,
              marginBottom: LAYOUT.SPACING.SM,
              textAlign: 'center',
            }}>
              🎉 ¡Gracias por tu compra!
            </Text>

            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.MD,
              color: COLORS.success,
              textAlign: 'center',
              lineHeight: 22,
            }}>
              Hemos recibido tu pago correctamente. El comprobante fue enviado a{' '}
              {quote.customer.email || 'tu email registrado'}.
            </Text>
          </View>
        </Card>

        {/* Actions */}
        <View style={{ gap: LAYOUT.SPACING.MD }}>
          <Button
            title="Ver Presupuesto Completo"
            onPress={handleViewQuote}
            fullWidth
            leftIcon={<Text style={{ fontSize: 16, marginRight: LAYOUT.SPACING.SM }}>📋</Text>}
          />

          <Button
            title="Compartir Comprobante"
            variant="outline"
            onPress={handleShareReceipt}
            fullWidth
            leftIcon={<Text style={{ fontSize: 16, marginRight: LAYOUT.SPACING.SM }}>📤</Text>}
          />

          <View style={{
            flexDirection: 'row',
            gap: LAYOUT.SPACING.MD,
            marginTop: LAYOUT.SPACING.MD,
          }}>
            <Button
              title="Nuevo Presupuesto"
              variant="outline"
              onPress={handleCreateNewQuote}
              style={{ flex: 1 }}
            />

            <Button
              title="Ver Todos"
              variant="ghost"
              onPress={handleBackToQuotes}
              style={{ flex: 1 }}
            />
          </View>
        </View>

        {/* Footer Note */}
        <View style={{ marginTop: LAYOUT.SPACING.XXL }}>
          <Text style={{
            fontSize: TYPOGRAPHY.FONT_SIZE.SM,
            color: COLORS.textTertiary,
            textAlign: 'center',
            lineHeight: 18,
          }}>
            💡 Si tienes alguna pregunta sobre tu compra,{'\n'}
            no dudes en contactarnos.
          </Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

export default PaymentSuccessScreen;