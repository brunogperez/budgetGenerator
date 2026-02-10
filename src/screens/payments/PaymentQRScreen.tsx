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
  Clipboard,
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

type PaymentQRScreenProps = StackScreenProps<PaymentStackParamList, 'PaymentQR'>;

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

      const [paymentData, quoteData] = await Promise.all([
        paymentService.getPaymentById(paymentId),
        paymentService.getQuoteByPaymentId(paymentId),
      ]);

      setPayment(paymentData);
      setQuote(quoteData);

      // If payment is already completed, navigate to success
      if (paymentData.status === 'approved') {
        navigation.replace('PaymentSuccess', {
          paymentId: paymentData.id,
          quoteId: quoteData?.id || '',
        });
      }
    } catch (err: any) {
      setError(err.message || 'Error cargando información de pago');
    } finally {
      setIsLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!payment || isCheckingStatus) return;

    try {
      setIsCheckingStatus(true);
      const updatedPayment = await paymentService.getPaymentStatus(payment.id);
      setPayment(updatedPayment);
      setLastStatusCheck(new Date());

      if (updatedPayment.status === 'approved') {
        // Payment completed successfully
        navigation.replace('PaymentSuccess', {
          paymentId: updatedPayment.id,
          quoteId: quote?.id || '',
        });
      } else if (updatedPayment.status === 'rejected' || updatedPayment.status === 'cancelled') {
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
    if (!payment?.qrData) return;

    try {
      await Clipboard.setString(payment.qrData);
      Alert.alert('Copiado', 'Datos del QR copiados al portapapeles');
    } catch (err: any) {
      console.error('Error copying QR data:', err);
    }
  };

  const handleSharePayment = async () => {
    if (!payment || !quote) return;

    try {
      const shareContent = paymentService.generateShareablePayment(payment, quote);
      await Share.share({
        message: shareContent.text,
        title: `Pago - ${quote.quoteNumber}`,
        url: shareContent.url,
      });
    } catch (err: any) {
      console.error('Error sharing payment:', err);
    }
  };

  const handleOpenMercadoPago = () => {
    if (!payment?.paymentUrl) return;

    Linking.openURL(payment.paymentUrl).catch(() => {
      Alert.alert('Error', 'No se pudo abrir MercadoPago');
    });
  };

  const handleManualRefresh = () => {
    checkPaymentStatus();
  };

  const handleCancelPayment = () => {
    Alert.alert(
      'Cancelar Pago',
      '¿Estás seguro que quieres cancelar este pago?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Sí, cancelar',
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
    return <Loading message="Cargando código QR..." />;
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
            💳 Código QR de Pago
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
            <Text style={{ fontSize: 48 }}>📱</Text>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.MD,
              color: COLORS.textSecondary,
              textAlign: 'center',
              marginTop: LAYOUT.SPACING.SM,
            }}>
              Código QR
            </Text>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.SM,
              color: COLORS.textTertiary,
              textAlign: 'center',
            }}>
              (Se mostraría aquí)
            </Text>
          </View>

          <Text style={{
            fontSize: TYPOGRAPHY.FONT_SIZE.LG,
            fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
            color: COLORS.text,
            textAlign: 'center',
            marginBottom: LAYOUT.SPACING.SM,
          }}>
            Escaneá el código con MercadoPago
          </Text>

          <Text style={{
            fontSize: TYPOGRAPHY.FONT_SIZE.MD,
            color: COLORS.textSecondary,
            textAlign: 'center',
            lineHeight: 22,
          }}>
            Abrí la app de MercadoPago, tocá "Pagar con QR" y escaneá este código
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
          📋 Detalles del Pago
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
              {isCheckingStatus ? 'Verificando...' : `Última verificación: ${formatTimeAgo(lastStatusCheck)}`}
            </Text>
          </View>

          <Button
            title="🔄"
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
          💡 Instrucciones
        </Text>

        <Text style={{
          fontSize: TYPOGRAPHY.FONT_SIZE.MD,
          color: COLORS.text,
          lineHeight: 22,
          marginBottom: LAYOUT.SPACING.SM,
        }}>
          1. Abrí la aplicación de MercadoPago
        </Text>

        <Text style={{
          fontSize: TYPOGRAPHY.FONT_SIZE.MD,
          color: COLORS.text,
          lineHeight: 22,
          marginBottom: LAYOUT.SPACING.SM,
        }}>
          2. Tocá "Pagar con QR" o el ícono de la cámara
        </Text>

        <Text style={{
          fontSize: TYPOGRAPHY.FONT_SIZE.MD,
          color: COLORS.text,
          lineHeight: 22,
          marginBottom: LAYOUT.SPACING.SM,
        }}>
          3. Escaneá este código QR
        </Text>

        <Text style={{
          fontSize: TYPOGRAPHY.FONT_SIZE.MD,
          color: COLORS.text,
          lineHeight: 22,
        }}>
          4. Confirmá el pago en tu aplicación
        </Text>
      </Card>

      {/* Actions */}
      <View style={{ gap: LAYOUT.SPACING.MD }}>
        {/* Open MercadoPago */}
        {payment.paymentUrl && (
          <Button
            title="Abrir en MercadoPago"
            onPress={handleOpenMercadoPago}
            fullWidth
            leftIcon={<Text style={{ fontSize: 16, marginRight: LAYOUT.SPACING.SM }}>🔗</Text>}
          />
        )}

        {/* Share Payment */}
        <Button
          title="Compartir Código"
          variant="outline"
          onPress={handleSharePayment}
          fullWidth
          leftIcon={<Text style={{ fontSize: 16, marginRight: LAYOUT.SPACING.SM }}>📤</Text>}
        />

        {/* Copy QR Data */}
        {payment.qrData && (
          <Button
            title="Copiar Datos QR"
            variant="outline"
            onPress={handleCopyQRData}
            fullWidth
            leftIcon={<Text style={{ fontSize: 16, marginRight: LAYOUT.SPACING.SM }}>📋</Text>}
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
          Esta pantalla se actualiza automáticamente cada 10 segundos.
          {'\n'}
          Una vez confirmado el pago, serás redirigido automáticamente.
        </Text>
      </View>
    </ScrollView>
  );
};

export default PaymentQRScreen;