// ===============================
// PAYMENT QR SCREEN - PRESUPUESTOS APP
// ===============================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  Share,
  Linking,
} from 'react-native';
import * as ExpoClipboard from 'expo-clipboard';
import { StackScreenProps } from '@react-navigation/stack';

// Components
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

// Services
import * as paymentService from '../../services/paymentService';

// Types
import { Payment, Quote, QuoteStackParamList } from '../../types';

// Constants
import { COLORS, LAYOUT, TYPOGRAPHY } from '../../constants/config';

// ===============================
// TYPES
// ===============================

type PaymentQRScreenProps = StackScreenProps<QuoteStackParamList, 'PaymentQR'>;

// ===============================
// PAYMENT QR SCREEN
// ===============================

const PaymentQRScreen: React.FC<PaymentQRScreenProps> = ({ route, navigation }) => {
  // ===============================
  // PARAMS
  // ===============================

  const { paymentId } = route.params;

  // ===============================
  // STATE
  // ===============================

  const [payment, setPayment] = useState<Payment | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [lastStatusCheck, setLastStatusCheck] = useState<Date>(new Date());

  // ===============================
  // EFFECTS
  // ===============================

  useEffect(() => {
    loadPaymentData();
  }, [paymentId]);

  useEffect(() => {
    // Check payment status every 10 seconds if payment is pending
    const interval = setInterval(() => {
      if (payment?.status === 'pending') {
        checkPaymentStatus();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [payment]);

  // ===============================
  // HANDLERS
  // ===============================

  const loadPaymentData = async () => {
    try {
      setError('');
      setIsLoading(true);

      const result = await paymentService.getPaymentStatus(paymentId);

      setPayment(result.payment);
      setQuote(result.quote);

      // If payment is already completed, navigate to success
      if (result.payment.status === 'approved') {
        navigation.replace('PaymentSuccess', {
          paymentId: result.payment.id,
          quoteId: result.quote?.id || '',
        });
      }
    } catch (err: any) {
      setError(err.message || 'Error cargando informacion de pago');
    } finally {
      setIsLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!payment || isCheckingStatus) return;

    try {
      setIsCheckingStatus(true);
      const result = await paymentService.getPaymentStatus(payment.id);
      setPayment(result.payment);
      setQuote(result.quote);
      setLastStatusCheck(new Date());

      if (result.payment.status === 'approved') {
        // Payment completed successfully
        navigation.replace('PaymentSuccess', {
          paymentId: result.payment.id,
          quoteId: result.quote?.id || '',
        });
      } else if (result.payment.status === 'rejected' || result.payment.status === 'cancelled') {
        // Payment failed
        Alert.alert(
          'Pago Rechazado',
          'El pago no se pudo procesar. Por favor, intenta nuevamente.',
          [
            {
              text: 'Volver',
              onPress: () => navigation.goBack(),
            },
            {
              text: 'Reintentar',
              onPress: loadPaymentData,
            },
          ]
        );
      }
    } catch (err: any) {
      console.error('Error checking payment status:', err);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleCopyQRData = async () => {
    if (!payment?.qrCodeData) return;

    try {
      await ExpoClipboard.setStringAsync(payment.qrCodeData);
      Alert.alert('Copiado', 'Datos del QR copiados al portapapeles');
    } catch (err: any) {
      console.error('Error copying QR data:', err);
    }
  };

  const handleSharePayment = async () => {
    if (!payment || !quote) return;

    try {
      const text = `Pago - ${quote.quoteNumber}\nMonto: $${payment.amount.toLocaleString('es-AR')}\nEstado: ${paymentService.formatPaymentStatus(payment.status).label}`;
      await Share.share({
        message: text,
        title: `Pago - ${quote.quoteNumber}`,
      });
    } catch (err: any) {
      console.error('Error sharing payment:', err);
    }
  };

  const handleOpenMercadoPago = () => {
    if (!payment?.initPoint) return;

    Linking.openURL(payment.initPoint).catch(() => {
      Alert.alert('Error', 'No se pudo abrir MercadoPago');
    });
  };

  const handleManualRefresh = () => {
    checkPaymentStatus();
  };

  const handleCancelPayment = () => {
    Alert.alert(
      'Cancelar Pago',
      'Estas seguro que quieres cancelar este pago?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Si, cancelar',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  // ===============================
  // LOADING STATE
  // ===============================

  if (isLoading) {
    return <Loading message="Cargando codigo QR..." />;
  }

  // ===============================
  // ERROR STATE
  // ===============================

  if (error || !payment || !quote) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>
        <ErrorMessage
          message={error || 'Pago no encontrado'}
          variant="card"
          onRetry={loadPaymentData}
          style={{ margin: LAYOUT.SPACING.LG }}
        />
      </View>
    );
  }

  // ===============================
  // RENDER FUNCTIONS
  // ===============================

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'hace unos segundos';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `hace ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
    const hours = Math.floor(minutes / 60);
    return `hace ${hours} hora${hours !== 1 ? 's' : ''}`;
  };

  const paymentStatusInfo = paymentService.formatPaymentStatus(payment.status);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      contentContainerStyle={{ padding: LAYOUT.SPACING.LG }}
    >
      {/* Header */}
      <Card variant="outlined" padding="lg" style={{ marginBottom: LAYOUT.SPACING.LG }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{
            fontSize: TYPOGRAPHY.FONT_SIZE.XXL,
            fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
            color: COLORS.text,
            marginBottom: LAYOUT.SPACING.SM,
            textAlign: 'center',
          }}>
            Codigo QR de Pago
          </Text>

          <View style={{
            backgroundColor: paymentStatusInfo.color + '20',
            paddingHorizontal: LAYOUT.SPACING.MD,
            paddingVertical: LAYOUT.SPACING.SM,
            borderRadius: LAYOUT.BORDER_RADIUS.MD,
            borderWidth: 1,
            borderColor: paymentStatusInfo.color,
          }}>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.SM,
              fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
              color: paymentStatusInfo.color,
            }}>
              {paymentStatusInfo.label}
            </Text>
          </View>
        </View>
      </Card>

      {/* QR Code */}
      <Card variant="outlined" padding="xl" style={{ marginBottom: LAYOUT.SPACING.LG }}>
        <View style={{ alignItems: 'center' }}>
          {/* QR Code Placeholder */}
          <View style={{
            width: 250,
            height: 250,
            backgroundColor: COLORS.backgroundSecondary,
            borderRadius: LAYOUT.BORDER_RADIUS.LG,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: LAYOUT.SPACING.LG,
            borderWidth: 2,
            borderColor: COLORS.border,
          }}>
            <Text style={{ fontSize: 48 }}>QR</Text>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.MD,
              color: COLORS.textSecondary,
              textAlign: 'center',
              marginTop: LAYOUT.SPACING.SM,
            }}>
              Codigo QR
            </Text>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.SM,
              color: COLORS.textTertiary,
              textAlign: 'center',
            }}>
              (Se mostraria aqui)
            </Text>
          </View>

          <Text style={{
            fontSize: TYPOGRAPHY.FONT_SIZE.LG,
            fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
            color: COLORS.text,
            textAlign: 'center',
            marginBottom: LAYOUT.SPACING.SM,
          }}>
            Escaneá el codigo con MercadoPago
          </Text>

          <Text style={{
            fontSize: TYPOGRAPHY.FONT_SIZE.MD,
            color: COLORS.textSecondary,
            textAlign: 'center',
            lineHeight: 22,
          }}>
            Abrí la app de MercadoPago, tocá "Pagar con QR" y escaneá este codigo
          </Text>
        </View>
      </Card>

      {/* Payment Details */}
      <Card variant="outlined" padding="lg" style={{ marginBottom: LAYOUT.SPACING.LG }}>
        <Text style={{
          fontSize: TYPOGRAPHY.FONT_SIZE.LG,
          fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
          color: COLORS.text,
          marginBottom: LAYOUT.SPACING.MD,
        }}>
          Detalles del Pago
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
          paddingTop: LAYOUT.SPACING.MD,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
        }}>
          <Text style={{
            fontSize: TYPOGRAPHY.FONT_SIZE.LG,
            fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
            color: COLORS.text,
          }}>
            Total a pagar
          </Text>
          <Text style={{
            fontSize: TYPOGRAPHY.FONT_SIZE.XXL,
            fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
            color: COLORS.primary,
          }}>
            ${payment.amount.toLocaleString('es-AR')}
          </Text>
        </View>
      </Card>

      {/* Status Check */}
      <Card variant="filled" padding="md" style={{
        marginBottom: LAYOUT.SPACING.LG,
        backgroundColor: COLORS.backgroundSecondary,
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.SM,
              color: COLORS.textSecondary,
              marginBottom: LAYOUT.SPACING.XS,
            }}>
              Estado del pago
            </Text>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.MD,
              fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
              color: COLORS.text,
            }}>
              {isCheckingStatus ? 'Verificando...' : `Ultima verificacion: ${formatTimeAgo(lastStatusCheck)}`}
            </Text>
          </View>

          <Button
            title="Actualizar"
            variant="ghost"
            size="sm"
            onPress={handleManualRefresh}
            loading={isCheckingStatus}
            disabled={isCheckingStatus}
          />
        </View>
      </Card>

      {/* Instructions */}
      <Card variant="outlined" padding="lg" style={{ marginBottom: LAYOUT.SPACING.LG }}>
        <Text style={{
          fontSize: TYPOGRAPHY.FONT_SIZE.LG,
          fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
          color: COLORS.text,
          marginBottom: LAYOUT.SPACING.MD,
        }}>
          Instrucciones
        </Text>

        <Text style={{
          fontSize: TYPOGRAPHY.FONT_SIZE.MD,
          color: COLORS.text,
          lineHeight: 22,
          marginBottom: LAYOUT.SPACING.SM,
        }}>
          1. Abrí la aplicacion de MercadoPago
        </Text>

        <Text style={{
          fontSize: TYPOGRAPHY.FONT_SIZE.MD,
          color: COLORS.text,
          lineHeight: 22,
          marginBottom: LAYOUT.SPACING.SM,
        }}>
          2. Tocá "Pagar con QR" o el icono de la camara
        </Text>

        <Text style={{
          fontSize: TYPOGRAPHY.FONT_SIZE.MD,
          color: COLORS.text,
          lineHeight: 22,
          marginBottom: LAYOUT.SPACING.SM,
        }}>
          3. Escaneá este codigo QR
        </Text>

        <Text style={{
          fontSize: TYPOGRAPHY.FONT_SIZE.MD,
          color: COLORS.text,
          lineHeight: 22,
        }}>
          4. Confirmá el pago en tu aplicacion
        </Text>
      </Card>

      {/* Actions */}
      <View style={{ gap: LAYOUT.SPACING.MD }}>
        {/* Open MercadoPago */}
        {payment.initPoint && (
          <Button
            title="Abrir en MercadoPago"
            onPress={handleOpenMercadoPago}
            fullWidth
            leftIcon={<Text style={{ fontSize: 16, marginRight: LAYOUT.SPACING.SM }}>{'🔗'}</Text>}
          />
        )}

        {/* Share Payment */}
        <Button
          title="Compartir Codigo"
          variant="outline"
          onPress={handleSharePayment}
          fullWidth
          leftIcon={<Text style={{ fontSize: 16, marginRight: LAYOUT.SPACING.SM }}>{'📤'}</Text>}
        />

        {/* Copy QR Data */}
        {payment.qrCodeData && (
          <Button
            title="Copiar Datos QR"
            variant="outline"
            onPress={handleCopyQRData}
            fullWidth
            leftIcon={<Text style={{ fontSize: 16, marginRight: LAYOUT.SPACING.SM }}>{'📋'}</Text>}
          />
        )}

        {/* Cancel Payment */}
        <Button
          title="Cancelar"
          variant="ghost"
          onPress={handleCancelPayment}
          fullWidth
          style={{ marginTop: LAYOUT.SPACING.MD }}
        />
      </View>

      {/* Auto-refresh notice */}
      <View style={{ marginTop: LAYOUT.SPACING.LG }}>
        <Text style={{
          fontSize: TYPOGRAPHY.FONT_SIZE.SM,
          color: COLORS.textTertiary,
          textAlign: 'center',
          lineHeight: 18,
        }}>
          Esta pantalla se actualiza automaticamente cada 10 segundos.
          {'\n'}
          Una vez confirmado el pago, serás redirigido automaticamente.
        </Text>
      </View>
    </ScrollView>
  );
};

export default PaymentQRScreen;
