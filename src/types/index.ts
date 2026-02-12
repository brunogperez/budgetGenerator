// ===============================
// TYPES - SISTEMA DE PRESUPUESTOS
// ===============================

// ===============================
// ENTIDADES PRINCIPALES
// ===============================

export interface User {
  _id: string;
  id?: string;
  email: string;
  name: string;
  role: 'admin' | 'seller';
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  _id: string;
  id?: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  sku?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Customer {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface QuoteItem {
  product: Product;
  productSnapshot: {
    name: string;
    price: number;
  };
  quantity: number;
  subtotal: number;
}

export interface Quote {
  _id: string;
  id?: string;
  quoteNumber: string;
  customer: Customer;
  items: QuoteItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'pending' | 'paid' | 'cancelled' | 'expired';
  paymentId?: string;
  expiresAt: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  id?: string;
  quote: string;
  mercadopagoId?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  amount: number;
  paymentMethod?: string;
  qrCode?: string;
  qrCodeData?: string;
  initPoint?: string;
  preferenceId?: string;
  externalReference?: string;
  expiresAt?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ===============================
// DTOs Y REQUESTS
// ===============================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: 'admin' | 'seller';
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  sku?: string;
  imageUrl?: string;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export interface CreateQuoteRequest {
  customer: Customer;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  discount?: number;
  tax?: number;
  notes?: string;
}

export interface CreatePaymentRequest {
  quoteId: string;
}

export interface CreatePaymentResponse {
  paymentId: string;
  preferenceId: string;
  qrCode: string;
  qrCodeData: string;
  initPoint: string;
  amount: number;
  expiresAt: string;
}

// ===============================
// API RESPONSES
// ===============================

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code?: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductsResponse {
  items: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface QuotesResponse {
  items: Quote[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface PaymentsResponse {
  payments: Payment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ===============================
// NAVIGATION TYPES
// ===============================

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Loading: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Products: undefined;
  Quotes: undefined;
  Profile: undefined;
};

export type ProductStackParamList = {
  ProductList: undefined;
  ProductDetail: { productId: string };
  ProductForm: { productId?: string };
  ProductSearch: undefined;
};

export type QuoteStackParamList = {
  QuoteList: undefined;
  CreateQuote: { quoteId?: string } | undefined;
  QuoteDetail: { quoteId: string };
  PaymentQR: { paymentId: string };
  PaymentSuccess: { paymentId: string; quoteId: string };
  CustomerForm: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  ProfileSettings: undefined;
  ChangePassword: undefined;
};

// ===============================
// HOOK TYPES
// ===============================

export interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export interface UseProductsReturn {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: (params?: ProductFilters) => Promise<void>;
  createProduct: (product: CreateProductRequest) => Promise<Product>;
  updateProduct: (id: string, product: UpdateProductRequest) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
}

export interface UseQuotesReturn {
  quotes: Quote[];
  isLoading: boolean;
  error: string | null;
  fetchQuotes: (params?: QuoteFilters) => Promise<void>;
  createQuote: (quote: CreateQuoteRequest) => Promise<Quote>;
  getQuote: (id: string) => Promise<Quote>;
  cancelQuote: (id: string) => Promise<void>;
}

export interface UsePaymentReturn {
  payments: Payment[];
  isLoading: boolean;
  error: string | null;
  createPayment: (quoteId: string) => Promise<CreatePaymentResponse>;
  getPaymentStatus: (paymentId: string) => Promise<Payment>;
  cancelPayment: (paymentId: string) => Promise<void>;
}

// ===============================
// CART/CARRITO TYPES
// ===============================

export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  total: number;
  itemCount: number;
}

export interface UseCartReturn {
  cart: Cart;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalAmount: () => number;
}

// ===============================
// FILTERS Y QUERIES
// ===============================

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sortBy?: 'name' | 'price' | 'stock' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  isActive?: boolean;
}

export interface QuoteFilters {
  page?: number;
  limit?: number;
  status?: Quote['status'];
  customerSearch?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'createdAt' | 'total' | 'quoteNumber';
  sortOrder?: 'asc' | 'desc';
}

export interface PaymentFilters {
  page?: number;
  limit?: number;
  status?: Payment['status'];
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'createdAt' | 'amount';
  sortOrder?: 'asc' | 'desc';
}

// ===============================
// ESTADÍSTICAS
// ===============================

export interface QuoteStats {
  total: number;
  pending: number;
  paid: number;
  cancelled: number;
  expired: number;
  totalValue: number;
  averageValue: number;
  conversionRate: number;
  topProducts?: Array<{
    _id: string;
    count: number;
    totalValue: number;
  }>;
}

export interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  averageAmount: number;
  approvedPayments: number;
  rejectedPayments: number;
  pendingPayments: number;
  approvalRate: number;
  paymentMethods?: Array<{
    _id: string;
    count: number;
    amount: number;
  }>;
}

// ===============================
// CONTEXT TYPES
// ===============================

export interface AuthContextData extends UseAuthReturn {}

export interface CartContextData extends UseCartReturn {}

export interface AppContextData {
  isOnline: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  showMessage: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

// ===============================
// COMPONENT PROPS
// ===============================

export interface ProductCardProps {
  product: Product;
  onPress?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  showActions?: boolean;
}

export interface QuoteCardProps {
  quote: Quote;
  onPress?: (quote: Quote) => void;
  onCancel?: (quote: Quote) => void;
  onPay?: (quote: Quote) => void;
  showActions?: boolean;
}

export interface PaymentStatusProps {
  payment: Payment;
  onRefresh?: () => void;
}

export interface QRCodeDisplayProps {
  qrCode: string;
  qrCodeData: string;
  amount: number;
  expiresAt: string;
  onPaymentComplete?: () => void;
}

// ===============================
// FORM TYPES
// ===============================

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  sku?: string;
  imageUrl?: string;
}

export interface CustomerFormData {
  name: string;
  email?: string;
  phone?: string;
}

export interface QuoteFormData {
  customer: CustomerFormData;
  discount?: string;
  tax?: string;
  notes?: string;
}

// ===============================
// UTILITY TYPES
// ===============================

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormError {
  [key: string]: string;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// ===============================
// STORAGE KEYS
// ===============================

export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_data',
  CART: 'shopping_cart',
  THEME: 'app_theme',
  ONBOARDING: 'has_completed_onboarding',
} as const;

// ===============================
// API ENDPOINTS
// ===============================

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  PRODUCTS: {
    LIST: '/products',
    CREATE: '/products',
    UPDATE: (id: string) => `/products/${id}`,
    DELETE: (id: string) => `/products/${id}`,
    GET: (id: string) => `/products/${id}`,
    CATEGORIES: '/products/categories',
    LOW_STOCK: '/products/low-stock',
  },
  QUOTES: {
    LIST: '/quotes',
    CREATE: '/quotes',
    GET: (id: string) => `/quotes/${id}`,
    CANCEL: (id: string) => `/quotes/${id}/cancel`,
    STATS: '/quotes/stats',
    BY_CUSTOMER: (email: string) => `/quotes/customer/${email}`,
  },
  PAYMENTS: {
    CREATE: '/payments/create',
    STATUS: (id: string) => `/payments/${id}/status`,
    CANCEL: (id: string) => `/payments/${id}/cancel`,
    LIST: '/payments',
    STATS: '/payments/stats',
    WEBHOOK: '/payments/webhook',
  },
} as const;

export default {};