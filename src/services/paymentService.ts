// ===============================
// PAYMENT SERVICE - PRESUPUESTOS APP
// ===============================

import {
  Payment,
  CreatePaymentRequest,
  CreatePaymentResponse,
  PaymentsResponse,
  PaymentFilters,
  PaymentStats,
  Quote,
  ApiResponse
} from '../types';
import { get, post } from './api';
import { API_ENDPOINTS } from '../types';

// ===============================
// PAYMENT SERVICE FUNCTIONS
// ===============================

/**
 * Crear orden de pago
 */
export const createPayment = async (
  quoteId: string
): Promise<CreatePaymentResponse> => {
  try {
    const requestData: CreatePaymentRequest = { quoteId };
    const response: ApiResponse<CreatePaymentResponse> = await post(
      API_ENDPOINTS.PAYMENTS.CREATE,
      requestData
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error creando orden de pago');
    }

    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Error creando orden de pago');
  }
};

/**
 * Obtener estado del pago
 */
export const getPaymentStatus = async (paymentId: string): Promise<{
  payment: Payment;
  quote: Quote;
}> => {
  try {
    const response: ApiResponse<{ payment: Payment; quote: Quote }> = await get(
      API_ENDPOINTS.PAYMENTS.STATUS(paymentId)
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error obteniendo estado del pago');
    }

    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Error obteniendo estado del pago');
  }
};

/**
 * Cancelar pago
 */
export const cancelPayment = async (paymentId: string): Promise<void> => {
  try {
    const response: ApiResponse = await post(API_ENDPOINTS.PAYMENTS.CANCEL(paymentId));

    if (!response.success) {
      throw new Error(response.message || 'Error cancelando pago');
    }
  } catch (error: any) {
    throw new Error(error.message || 'Error cancelando pago');
  }
};

/**
 * Obtener lista de pagos (solo admin)
 */
export const getPayments = async (
  filters?: PaymentFilters
): Promise<PaymentsResponse> => {
  try {
    const queryParams = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const url = `${API_ENDPOINTS.PAYMENTS.LIST}?${queryParams.toString()}`;
    const response: ApiResponse<PaymentsResponse> = await get(url);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error obteniendo pagos');
    }

    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Error obteniendo pagos');
  }
};

/**
 * Obtener estadísticas de pagos (solo admin)
 */
export const getPaymentStats = async (
  dateFrom?: string,
  dateTo?: string
): Promise<PaymentStats> => {
  try {
    const queryParams = new URLSearchParams();

    if (dateFrom) queryParams.append('dateFrom', dateFrom);
    if (dateTo) queryParams.append('dateTo', dateTo);

    const url = `${API_ENDPOINTS.PAYMENTS.STATS}?${queryParams.toString()}`;
    const response: ApiResponse<PaymentStats> = await get(url);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error obteniendo estadísticas de pagos');
    }

    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Error obteniendo estadísticas de pagos');
  }
};

/**
 * Validar datos de pago
 */
export const validatePaymentData = (quoteId: string): {
  isValid: boolean;
  errors: Record<string, string>;
} => {
  const errors: Record<string, string> = {};

  if (!quoteId || quoteId.trim() === '') {
    errors.quoteId = 'El ID del presupuesto es requerido';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Formatear estado del pago
 */
export const formatPaymentStatus = (status: Payment['status']): {
  label: string;
  color: string;
  icon: string;
} => {
  const statusMap: Record<Payment['status'], { label: string; color: string; icon: string }> = {
    pending: { label: 'Pendiente', color: '#FF9500', icon: 'clock' },
    approved: { label: 'Aprobado', color: '#34C759', icon: 'checkmark-circle' },
    rejected: { label: 'Rechazado', color: '#FF3B30', icon: 'close-circle' },
    cancelled: { label: 'Cancelado', color: '#8E8E93', icon: 'ban' },
  };

  return statusMap[status] || { label: status, color: '#8E8E93', icon: 'help-circle' };
};

/**
 * Verificar si el pago está expirado
 */
export const isPaymentExpired = (payment: Payment): boolean => {
  if (!payment.expiresAt) return false;
  return new Date() > new Date(payment.expiresAt);
};

/**
 * Calcular tiempo restante hasta expiración del pago
 */
export const getPaymentTimeLeft = (payment: Payment): {
  expired: boolean;
  timeLeft: string;
  urgency: 'low' | 'medium' | 'high';
} => {
  if (!payment.expiresAt) {
    return {
      expired: false,
      timeLeft: 'Sin límite',
      urgency: 'low',
    };
  }

  const now = new Date();
  const expirationDate = new Date(payment.expiresAt);
  const diffMs = expirationDate.getTime() - now.getTime();

  if (diffMs <= 0) {
    return {
      expired: true,
      timeLeft: 'Expirado',
      urgency: 'high',
    };
  }

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(minutes / 60);

  let timeLeft = '';
  let urgency: 'low' | 'medium' | 'high' = 'low';

  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    timeLeft = remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours} hora${hours > 1 ? 's' : ''}`;
    urgency = hours <= 1 ? 'high' : hours <= 3 ? 'medium' : 'low';
  } else {
    timeLeft = `${minutes} minuto${minutes > 1 ? 's' : ''}`;
    urgency = 'high';
  }

  return {
    expired: false,
    timeLeft,
    urgency,
  };
};

/**
 * Generar datos para código QR
 */
export const generateQRData = (payment: CreatePaymentResponse): {
  url: string;
  displayText: string;
} => {
  return {
    url: payment.qrCodeData,
    displayText: `Pagar $${payment.amount.toLocaleString('es-AR')}`,
  };
};

/**
 * Validar código QR
 */
export const validateQRCode = (qrCode: string): boolean => {
  try {
    // Verificar si es una URL válida de MercadoPago
    const url = new URL(qrCode);
    return url.hostname.includes('mercadopago.com');
  } catch {
    // Si no es una URL, verificar si es un código QR en base64
    return qrCode.startsWith('data:image/') || qrCode.length > 100;
  }
};

/**
 * Formatear monto de pago
 */
export const formatPaymentAmount = (
  amount: number,
  currency = 'ARS',
  locale = 'es-AR'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Obtener método de pago legible
 */
export const formatPaymentMethod = (method?: string): string => {
  const methodMap: Record<string, string> = {
    credit_card: 'Tarjeta de Crédito',
    debit_card: 'Tarjeta de Débito',
    bank_transfer: 'Transferencia Bancaria',
    digital_wallet: 'Billetera Digital',
    cash: 'Efectivo',
  };

  return methodMap[method || ''] || method || 'No especificado';
};

/**
 * Calcular comisiones de MercadoPago
 */
export const calculateMercadoPagoFees = (amount: number, paymentMethod?: string): {
  fee: number;
  netAmount: number;
  feePercentage: number;
} => {
  // Comisiones aproximadas de MercadoPago Argentina (2024)
  const feeRates: Record<string, number> = {
    credit_card: 0.0499, // 4.99%
    debit_card: 0.0399,  // 3.99%
    bank_transfer: 0.0199, // 1.99%
    digital_wallet: 0.0299, // 2.99%
  };

  const feePercentage = feeRates[paymentMethod || 'credit_card'] || 0.0499;
  const fee = amount * feePercentage;
  const netAmount = amount - fee;

  return {
    fee,
    netAmount,
    feePercentage: feePercentage * 100,
  };
};

/**
 * Filtrar pagos por múltiples criterios
 */
export const filterPayments = (
  payments: Payment[],
  filters: {
    search?: string;
    status?: Payment['status'];
    dateFrom?: string;
    dateTo?: string;
    minAmount?: number;
    maxAmount?: number;
    paymentMethod?: string;
  }
): Payment[] => {
  return payments.filter(payment => {
    // Filtro por búsqueda
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch =
        payment._id.toLowerCase().includes(searchTerm) ||
        payment.mercadopagoId?.toLowerCase().includes(searchTerm) ||
        payment.externalReference?.toLowerCase().includes(searchTerm);

      if (!matchesSearch) return false;
    }

    // Filtro por estado
    if (filters.status && payment.status !== filters.status) {
      return false;
    }

    // Filtro por fecha desde
    if (filters.dateFrom) {
      const paymentDate = new Date(payment.createdAt);
      const fromDate = new Date(filters.dateFrom);
      if (paymentDate < fromDate) return false;
    }

    // Filtro por fecha hasta
    if (filters.dateTo) {
      const paymentDate = new Date(payment.createdAt);
      const toDate = new Date(filters.dateTo);
      if (paymentDate > toDate) return false;
    }

    // Filtro por monto mínimo
    if (filters.minAmount && payment.amount < filters.minAmount) {
      return false;
    }

    // Filtro por monto máximo
    if (filters.maxAmount && payment.amount > filters.maxAmount) {
      return false;
    }

    // Filtro por método de pago
    if (filters.paymentMethod && payment.paymentMethod !== filters.paymentMethod) {
      return false;
    }

    return true;
  });
};

/**
 * Ordenar pagos
 */
export const sortPayments = (
  payments: Payment[],
  sortBy: 'createdAt' | 'amount' | 'status' = 'createdAt',
  order: 'asc' | 'desc' = 'desc'
): Payment[] => {
  return [...payments].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      case 'amount':
        aValue = a.amount;
        bValue = b.amount;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      default:
        aValue = a.createdAt;
        bValue = b.createdAt;
    }

    if (order === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
};

/**
 * Obtener resumen del pago
 */
export const getPaymentSummary = (payment: Payment): {
  processingTime?: string;
  fees: { fee: number; netAmount: number; feePercentage: number };
  isExpired: boolean;
  timeLeft?: string;
} => {
  const fees = calculateMercadoPagoFees(payment.amount, payment.paymentMethod);
  const isExpired = isPaymentExpired(payment);
  const timeInfo = getPaymentTimeLeft(payment);

  let processingTime: string | undefined;
  if (payment.paidAt && payment.createdAt) {
    const created = new Date(payment.createdAt);
    const paid = new Date(payment.paidAt);
    const diffMinutes = Math.floor((paid.getTime() - created.getTime()) / (1000 * 60));

    if (diffMinutes < 1) {
      processingTime = 'Menos de 1 minuto';
    } else if (diffMinutes < 60) {
      processingTime = `${diffMinutes} minutos`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const mins = diffMinutes % 60;
      processingTime = mins > 0 ? `${hours}h ${mins}m` : `${hours} horas`;
    }
  }

  return {
    processingTime,
    fees,
    isExpired,
    timeLeft: timeInfo.timeLeft,
  };
};

export default {
  createPayment,
  getPaymentStatus,
  cancelPayment,
  getPayments,
  getPaymentStats,
  validatePaymentData,
  formatPaymentStatus,
  isPaymentExpired,
  getPaymentTimeLeft,
  generateQRData,
  validateQRCode,
  formatPaymentAmount,
  formatPaymentMethod,
  calculateMercadoPagoFees,
  filterPayments,
  sortPayments,
  getPaymentSummary,
};