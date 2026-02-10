// ===============================
// QUOTE SERVICE - PRESUPUESTOS APP
// ===============================

import {
  Quote,
  CreateQuoteRequest,
  QuotesResponse,
  QuoteFilters,
  QuoteStats,
  Customer,
  Product,
  ApiResponse
} from '../types';
import { get, post, put } from './api';
import { API_ENDPOINTS } from '../types';

// ===============================
// QUOTE SERVICE FUNCTIONS
// ===============================

/**
 * Obtener lista de presupuestos con filtros
 */
export const getQuotes = async (filters?: QuoteFilters): Promise<QuotesResponse> => {
  try {
    const queryParams = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const url = `${API_ENDPOINTS.QUOTES.LIST}?${queryParams.toString()}`;
    const response: ApiResponse<QuotesResponse> = await get(url);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error obteniendo presupuestos');
    }

    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Error obteniendo presupuestos');
  }
};

/**
 * Obtener presupuesto por ID
 */
export const getQuoteById = async (id: string): Promise<Quote> => {
  try {
    const response: ApiResponse<Quote> = await get(API_ENDPOINTS.QUOTES.GET(id));

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error obteniendo presupuesto');
    }

    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Error obteniendo presupuesto');
  }
};

/**
 * Crear nuevo presupuesto
 */
export const createQuote = async (quoteData: CreateQuoteRequest): Promise<Quote> => {
  try {
    const response: ApiResponse<Quote> = await post(
      API_ENDPOINTS.QUOTES.CREATE,
      quoteData
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error creando presupuesto');
    }

    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Error creando presupuesto');
  }
};

/**
 * Cancelar presupuesto
 */
export const cancelQuote = async (id: string): Promise<void> => {
  try {
    const response: ApiResponse = await put(API_ENDPOINTS.QUOTES.CANCEL(id));

    if (!response.success) {
      throw new Error(response.message || 'Error cancelando presupuesto');
    }
  } catch (error: any) {
    throw new Error(error.message || 'Error cancelando presupuesto');
  }
};

/**
 * Obtener estadísticas de presupuestos
 */
export const getQuoteStats = async (): Promise<QuoteStats> => {
  try {
    const response: ApiResponse<QuoteStats> = await get(API_ENDPOINTS.QUOTES.STATS);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error obteniendo estadísticas');
    }

    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Error obteniendo estadísticas');
  }
};

/**
 * Obtener presupuestos por cliente
 */
export const getQuotesByCustomer = async (email: string): Promise<Quote[]> => {
  try {
    const response: ApiResponse<Quote[]> = await get(
      API_ENDPOINTS.QUOTES.BY_CUSTOMER(email)
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error obteniendo presupuestos del cliente');
    }

    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Error obteniendo presupuestos del cliente');
  }
};

/**
 * Validar datos del presupuesto
 */
export const validateQuoteData = (data: CreateQuoteRequest): {
  isValid: boolean;
  errors: Record<string, string>;
} => {
  const errors: Record<string, string> = {};

  // Validar datos del cliente
  if (!data.customer.name || data.customer.name.trim().length < 2) {
    errors.customerName = 'El nombre del cliente es obligatorio';
  }

  if (data.customer.email && !validateEmail(data.customer.email)) {
    errors.customerEmail = 'El email no es válido';
  }

  if (data.customer.phone && !validatePhone(data.customer.phone)) {
    errors.customerPhone = 'El teléfono no es válido';
  }

  // Validar items
  if (!data.items || data.items.length === 0) {
    errors.items = 'Debe agregar al menos un producto';
  }

  if (data.items && data.items.length > 0) {
    data.items.forEach((item, index) => {
      if (!item.productId) {
        errors[`item${index}Product`] = 'Producto requerido';
      }

      if (!item.quantity || item.quantity <= 0) {
        errors[`item${index}Quantity`] = 'La cantidad debe ser mayor a 0';
      }

      if (item.quantity > 1000) {
        errors[`item${index}Quantity`] = 'La cantidad máxima es 1000';
      }
    });
  }

  // Validar descuento
  if (data.discount && (data.discount < 0 || data.discount > 100)) {
    errors.discount = 'El descuento debe estar entre 0 y 100';
  }

  // Validar impuesto
  if (data.tax && (data.tax < 0 || data.tax > 100)) {
    errors.tax = 'El impuesto debe estar entre 0 y 100';
  }

  // Validar notas
  if (data.notes && data.notes.length > 500) {
    errors.notes = 'Las notas no pueden superar los 500 caracteres';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validar email
 */
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validar teléfono
 */
const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

/**
 * Calcular totales del presupuesto
 */
export const calculateQuoteTotals = (
  items: Array<{ product: Product; quantity: number }>,
  discount = 0,
  tax = 0
): {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
} => {
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.product.price * item.quantity);
  }, 0);

  const discountAmount = (subtotal * discount) / 100;
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = (afterDiscount * tax) / 100;
  const total = afterDiscount + taxAmount;

  return {
    subtotal,
    discountAmount,
    taxAmount,
    total,
  };
};

/**
 * Generar número de presupuesto
 */
export const generateQuoteNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');

  return `Q-${year}${month}${day}-${random}`;
};

/**
 * Formatear estado del presupuesto
 */
export const formatQuoteStatus = (status: Quote['status']): {
  label: string;
  color: string;
} => {
  const statusMap: Record<Quote['status'], { label: string; color: string }> = {
    pending: { label: 'Pendiente', color: '#FF9500' },
    paid: { label: 'Pagado', color: '#34C759' },
    cancelled: { label: 'Cancelado', color: '#FF3B30' },
    expired: { label: 'Expirado', color: '#8E8E93' },
  };

  return statusMap[status] || { label: status, color: '#8E8E93' };
};

/**
 * Verificar si el presupuesto está expirado
 */
export const isQuoteExpired = (quote: Quote): boolean => {
  return new Date() > new Date(quote.expiresAt);
};

/**
 * Calcular tiempo restante hasta expiración
 */
export const getTimeUntilExpiration = (quote: Quote): {
  expired: boolean;
  timeLeft: string;
  urgency: 'low' | 'medium' | 'high';
} => {
  const now = new Date();
  const expirationDate = new Date(quote.expiresAt);
  const diffMs = expirationDate.getTime() - now.getTime();

  if (diffMs <= 0) {
    return {
      expired: true,
      timeLeft: 'Expirado',
      urgency: 'high',
    };
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  let timeLeft = '';
  let urgency: 'low' | 'medium' | 'high' = 'low';

  if (days > 0) {
    timeLeft = `${days} día${days > 1 ? 's' : ''}`;
    urgency = days <= 1 ? 'high' : days <= 3 ? 'medium' : 'low';
  } else if (hours > 0) {
    timeLeft = `${hours} hora${hours > 1 ? 's' : ''}`;
    urgency = 'high';
  } else {
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
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
 * Filtrar presupuestos por múltiples criterios
 */
export const filterQuotes = (
  quotes: Quote[],
  filters: {
    search?: string;
    status?: Quote['status'];
    dateFrom?: string;
    dateTo?: string;
    minAmount?: number;
    maxAmount?: number;
  }
): Quote[] => {
  return quotes.filter(quote => {
    // Filtro por búsqueda
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch =
        quote.quoteNumber.toLowerCase().includes(searchTerm) ||
        quote.customer.name.toLowerCase().includes(searchTerm) ||
        quote.customer.email?.toLowerCase().includes(searchTerm) ||
        quote.notes?.toLowerCase().includes(searchTerm);

      if (!matchesSearch) return false;
    }

    // Filtro por estado
    if (filters.status && quote.status !== filters.status) {
      return false;
    }

    // Filtro por fecha desde
    if (filters.dateFrom) {
      const quoteDate = new Date(quote.createdAt);
      const fromDate = new Date(filters.dateFrom);
      if (quoteDate < fromDate) return false;
    }

    // Filtro por fecha hasta
    if (filters.dateTo) {
      const quoteDate = new Date(quote.createdAt);
      const toDate = new Date(filters.dateTo);
      if (quoteDate > toDate) return false;
    }

    // Filtro por monto mínimo
    if (filters.minAmount && quote.total < filters.minAmount) {
      return false;
    }

    // Filtro por monto máximo
    if (filters.maxAmount && quote.total > filters.maxAmount) {
      return false;
    }

    return true;
  });
};

/**
 * Ordenar presupuestos
 */
export const sortQuotes = (
  quotes: Quote[],
  sortBy: 'createdAt' | 'total' | 'quoteNumber' | 'customerName' = 'createdAt',
  order: 'asc' | 'desc' = 'desc'
): Quote[] => {
  return [...quotes].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      case 'total':
        aValue = a.total;
        bValue = b.total;
        break;
      case 'quoteNumber':
        aValue = a.quoteNumber;
        bValue = b.quoteNumber;
        break;
      case 'customerName':
        aValue = a.customer.name.toLowerCase();
        bValue = b.customer.name.toLowerCase();
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
 * Obtener resumen del presupuesto
 */
export const getQuoteSummary = (quote: Quote): {
  itemCount: number;
  avgItemPrice: number;
  discountPercentage: number;
  taxPercentage: number;
  profitMargin: number;
} => {
  const itemCount = quote.items.length;
  const totalQuantity = quote.items.reduce((sum, item) => sum + item.quantity, 0);
  const avgItemPrice = itemCount > 0 ? quote.subtotal / totalQuantity : 0;

  const discountPercentage = quote.subtotal > 0 ? (quote.discount / quote.subtotal) * 100 : 0;
  const afterDiscount = quote.subtotal - quote.discount;
  const taxPercentage = afterDiscount > 0 ? (quote.tax / afterDiscount) * 100 : 0;

  // Cálculo simplificado del margen de ganancia (asumiendo costo del 70%)
  const estimatedCost = quote.subtotal * 0.7;
  const profit = quote.total - estimatedCost;
  const profitMargin = quote.total > 0 ? (profit / quote.total) * 100 : 0;

  return {
    itemCount,
    avgItemPrice,
    discountPercentage,
    taxPercentage,
    profitMargin,
  };
};

export default {
  getQuotes,
  getQuoteById,
  createQuote,
  cancelQuote,
  getQuoteStats,
  getQuotesByCustomer,
  validateQuoteData,
  calculateQuoteTotals,
  generateQuoteNumber,
  formatQuoteStatus,
  isQuoteExpired,
  getTimeUntilExpiration,
  filterQuotes,
  sortQuotes,
  getQuoteSummary,
};