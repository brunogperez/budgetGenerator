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
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
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

// Theme
import { useTheme } from '../../context/ThemeContext';

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
  // THEME
  // ===============================

  const { colors } = useTheme();

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
          paymentId: result.payment._id,
          quoteId: result.quote?._id || '',
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
      const result = await paymentService.getPaymentStatus(payment._id);
      setPayment(result.payment);
      setQuote(result.quote);
      setLastStatusCheck(new Date());

      if (result.payment.status === 'approved') {
        // Payment completed successfully
        navigation.replace('PaymentSuccess', {
          paymentId: result.payment._id,
          quoteId: result.quote?._id || '',
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
      '¿Estás seguro que quieres cancelar este pago?',
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
    return <Loading message="Cargando código QR..." />;
  }

  // ===============================
  // ERROR STATE
  // ===============================

  if (error || !payment || !quote) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
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
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: LAYOUT.SPACING.LG }}
    >
      {/* Header */}
      <Card variant="outlined" padding="lg" style={{ marginBottom: LAYOUT.SPACING.LG }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{
            fontSize: TYPOGRAPHY.FONT_SIZE.XXL,
            fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
            color: colors.text,
            marginBottom: LAYOUT.SPACING.SM,
            textAlign: 'center',
          }}>
            Código QR de Pago
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
            backgroundColor: colors.backgroundSecondary,
            borderRadius: LAYOUT.BORDER_RADIUS.LG,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: LAYOUT.SPACING.LG,
            borderWidth: 2,
            borderColor: colors.border,
          }}>
            <Text style={{ fontSize: 48 }}>QR</Text>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.MD,
              color: colors.textSecondary,
              textAlign: 'center',
              marginTop: LAYOUT.SPACING.SM,
            }}>
              Código QR
            </Text>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.SM,
              color: colors.textTertiary,
              textAlign: 'center',
            }}>
              (Se mostraría aquí)
            </Text>
          </View>

          <Text style={{
            fontSize: TYPOGRAPHY.FONT_SIZE.LG,
            fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
            color: colors.text,
            textAlign: 'center',
            marginBottom: LAYOUT.SPACING.SM,
          }}>
            Escaneá el código con MercadoPago
          </Text>

          <Text style={{
            fontSize: TYPOGRAPHY.FONT_SIZE.MD,
            color: colors.textSecondary,
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
          color: colors.text,
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
            color: colors.textSecondary,
          }}>
            Presupuesto
          </Text>
          <Text style={{
            fontSize: TYPOGRAPHY.FONT_SIZE.MD,
            fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
            color: colors.text,
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
            color: colors.textSecondary,
          }}>
            Cliente
          </Text>
          <Text style={{
            fontSize: TYPOGRAPHY.FONT_SIZE.MD,
            color: colors.text,
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
          borderTopColor: colors.border,
        }}>
          <Text style={{
            fontSize: TYPOGRAPHY.FONT_SIZE.LG,
            fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
            color: colors.text,
          }}>
            Total a pagar
          </Text>
          <Text style={{
            fontSize: TYPOGRAPHY.FONT_SIZE.XXL,
            fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
            color: colors.primary,
          }}>
            ${payment.amount.toLocaleString('es-AR')}
          </Text>
        </View>
      </Card>

      {/* Status Check */}
      <Card variant="filled" padding="md" style={{
        marginBottom: LAYOUT.SPACING.LG,
        backgroundColor: colors.backgroundSecondary,
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.SM,
              color: colors.textSecondary,
              marginBottom: LAYOUT.SPACING.XS,
            }}>
              Estado del pago
            </Text>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.MD,
              fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
              color: colors.text,
            }}>
              {isCheckingStatus ? 'Verificando...' : `Última verificación: ${formatTimeAgo(lastStatusCheck)}`}
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
          color: colors.text,
          marginBottom: LAYOUT.SPACING.MD,
        }}>
          Instrucciones
        </Text>

        <Text style={{
          fontSize: TYPOGRAPHY.FONT_SIZE.MD,
          color: colors.text,
          lineHeight: 22,
          marginBottom: LAYOUT.SPACING.SM,
        }}>
          1. Abrí la aplicación de MercadoPago
        </Text>

        <Text style={{
          fontSize: TYPOGRAPHY.FONT_SIZE.MD,
          color: colors.text,
          lineHeight: 22,
          marginBottom: LAYOUT.SPACING.SM,
        }}>
          2. Tocá "Pagar con QR" o el icono de la cámara
        </Text>

        <Text style={{
          fontSize: TYPOGRAPHY.FONT_SIZE.MD,
          color: colors.text,
          lineHeight: 22,
          marginBottom: LAYOUT.SPACING.SM,
        }}>
          3. Escaneá este código QR
        </Text>

        <Text style={{
          fontSize: TYPOGRAPHY.FONT_SIZE.MD,
          color: colors.text,
          lineHeight: 22,
        }}>
          4. Confirmá el pago en tu aplicación
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
            leftIcon={<MaterialCommunityIcons name="link-variant" size={18} color="#FFFFFF" style={{ marginRight: LAYOUT.SPACING.SM }} />}
          />
        )}

        {/* Share Payment */}
        <Button
          title="Compartir Código"
          variant="outline"
          onPress={handleSharePayment}
          fullWidth
          leftIcon={<MaterialCommunityIcons name="share-variant-outline" size={18} color={colors.primary} style={{ marginRight: LAYOUT.SPACING.SM }} />}
        />

        {/* Copy QR Data */}
        {payment.qrCodeData && (
          <Button
            title="Copiar Datos QR"
            variant="outline"
            onPress={handleCopyQRData}
            fullWidth
            leftIcon={<MaterialCommunityIcons name="clipboard-text-outline" size={18} color={colors.primary} style={{ marginRight: LAYOUT.SPACING.SM }} />}
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
          color: colors.textTertiary,
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
