// ===============================
// PRODUCT SERVICE - PRESUPUESTOS APP
// ===============================

import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductsResponse,
  ProductFilters,
  ApiResponse,
  PaginatedResponse
} from '../types';
import { get, post, put, del } from './api';
import { API_ENDPOINTS } from '../types';

// ===============================
// PRODUCT SERVICE FUNCTIONS
// ===============================

/**
 * Obtener lista de productos con filtros
 */
export const getProducts = async (
  filters?: ProductFilters
): Promise<ProductsResponse> => {
  try {
    const queryParams = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const url = `${API_ENDPOINTS.PRODUCTS.LIST}?${queryParams.toString()}`;
    const response: ApiResponse<ProductsResponse> = await get(url);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error obteniendo productos');
    }

    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Error obteniendo productos');
  }
};

/**
 * Obtener producto por ID
 */
export const getProductById = async (id: string): Promise<Product> => {
  try {
    const response: ApiResponse<Product> = await get(
      API_ENDPOINTS.PRODUCTS.GET(id)
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error obteniendo producto');
    }

    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Error obteniendo producto');
  }
};

/**
 * Crear nuevo producto
 */
export const createProduct = async (
  productData: CreateProductRequest
): Promise<Product> => {
  try {
    const response: ApiResponse<Product> = await post(
      API_ENDPOINTS.PRODUCTS.CREATE,
      productData
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error creando producto');
    }

    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Error creando producto');
  }
};

/**
 * Actualizar producto existente
 */
export const updateProduct = async (
  id: string,
  productData: UpdateProductRequest
): Promise<Product> => {
  try {
    const response: ApiResponse<Product> = await put(
      API_ENDPOINTS.PRODUCTS.UPDATE(id),
      productData
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error actualizando producto');
    }

    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Error actualizando producto');
  }
};

/**
 * Eliminar producto (soft delete)
 */
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    const response: ApiResponse = await del(API_ENDPOINTS.PRODUCTS.DELETE(id));

    if (!response.success) {
      throw new Error(response.message || 'Error eliminando producto');
    }
  } catch (error: any) {
    throw new Error(error.message || 'Error eliminando producto');
  }
};

/**
 * Obtener categorías de productos
 */
export const getProductCategories = async (): Promise<string[]> => {
  try {
    const response: ApiResponse<string[]> = await get(
      API_ENDPOINTS.PRODUCTS.CATEGORIES
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error obteniendo categorías');
    }

    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Error obteniendo categorías');
  }
};

/**
 * Obtener productos con stock bajo
 */
export const getLowStockProducts = async (): Promise<Product[]> => {
  try {
    const response: ApiResponse<Product[]> = await get(
      API_ENDPOINTS.PRODUCTS.LOW_STOCK
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error obteniendo productos con stock bajo');
    }

    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Error obteniendo productos con stock bajo');
  }
};

/**
 * Buscar productos por texto
 */
export const searchProducts = async (
  query: string,
  filters?: Omit<ProductFilters, 'search'>
): Promise<Product[]> => {
  try {
    const searchFilters: ProductFilters = {
      ...filters,
      search: query,
    };

    const result = await getProducts(searchFilters);
    return result.products;
  } catch (error: any) {
    throw new Error(error.message || 'Error buscando productos');
  }
};

/**
 * Validar datos del producto
 */
export const validateProductData = (data: CreateProductRequest): {
  isValid: boolean;
  errors: Record<string, string>;
} => {
  const errors: Record<string, string> = {};

  // Validar nombre
  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'El nombre debe tener al menos 2 caracteres';
  }

  // Validar descripción
  if (!data.description || data.description.trim().length < 10) {
    errors.description = 'La descripción debe tener al menos 10 caracteres';
  }

  // Validar precio
  if (typeof data.price !== 'number' || data.price <= 0) {
    errors.price = 'El precio debe ser mayor a 0';
  }

  // Validar stock
  if (typeof data.stock !== 'number' || data.stock < 0) {
    errors.stock = 'El stock no puede ser negativo';
  }

  // Validar categoría
  if (!data.category || data.category.trim().length < 2) {
    errors.category = 'La categoría es obligatoria';
  }

  // Validar SKU si se proporciona
  if (data.sku && !/^[A-Z0-9\-_]{3,20}$/i.test(data.sku)) {
    errors.sku = 'El SKU debe tener entre 3 y 20 caracteres alfanuméricos';
  }

  // Validar URL de imagen si se proporciona
  if (data.imageUrl && !isValidUrl(data.imageUrl)) {
    errors.imageUrl = 'La URL de la imagen no es válida';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validar URL
 */
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Formatear precio para mostrar
 */
export const formatPrice = (price: number, currency = '$'): string => {
  return `${currency}${price.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Obtener estado del stock
 */
export const getStockStatus = (stock: number): {
  status: 'high' | 'medium' | 'low' | 'out';
  label: string;
  color: string;
} => {
  if (stock <= 0) {
    return {
      status: 'out',
      label: 'Sin stock',
      color: '#FF3B30',
    };
  }

  if (stock <= 5) {
    return {
      status: 'low',
      label: 'Stock bajo',
      color: '#FF9500',
    };
  }

  if (stock <= 20) {
    return {
      status: 'medium',
      label: 'Stock medio',
      color: '#FFCC00',
    };
  }

  return {
    status: 'high',
    label: 'Stock alto',
    color: '#34C759',
  };
};

/**
 * Calcular valor total del inventario
 */
export const calculateInventoryValue = (products: Product[]): number => {
  return products.reduce((total, product) => {
    return total + (product.price * product.stock);
  }, 0);
};

/**
 * Obtener productos más vendidos (simulado)
 */
export const getTopSellingProducts = (products: Product[]): Product[] => {
  // En una implementación real, esto vendría del backend
  return products
    .filter(p => p.stock < 50) // Asumimos que menos stock = más vendido
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5);
};

/**
 * Generar SKU automático
 */
export const generateSKU = (name: string, category: string): string => {
  const namePrefix = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 3);

  const categoryPrefix = category
    .replace(/\s+/g, '')
    .toUpperCase()
    .slice(0, 3);

  const randomSuffix = Math.floor(Math.random() * 999)
    .toString()
    .padStart(3, '0');

  return `${namePrefix}-${categoryPrefix}-${randomSuffix}`;
};

/**
 * Verificar disponibilidad de stock
 */
export const checkStockAvailability = (
  product: Product,
  requestedQuantity: number
): {
  available: boolean;
  availableQuantity: number;
  message: string;
} => {
  const availableQuantity = Math.max(0, product.stock);
  const available = requestedQuantity <= availableQuantity;

  let message = '';
  if (!available) {
    if (availableQuantity === 0) {
      message = 'Producto sin stock';
    } else {
      message = `Solo hay ${availableQuantity} unidades disponibles`;
    }
  }

  return {
    available,
    availableQuantity,
    message,
  };
};

/**
 * Filtrar productos por múltiples criterios
 */
export const filterProducts = (
  products: Product[],
  filters: {
    search?: string;
    category?: string;
    priceMin?: number;
    priceMax?: number;
    inStock?: boolean;
  }
): Product[] => {
  return products.filter(product => {
    // Filtro por búsqueda de texto
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.sku?.toLowerCase().includes(searchTerm);

      if (!matchesSearch) return false;
    }

    // Filtro por categoría
    if (filters.category && product.category !== filters.category) {
      return false;
    }

    // Filtro por precio mínimo
    if (filters.priceMin && product.price < filters.priceMin) {
      return false;
    }

    // Filtro por precio máximo
    if (filters.priceMax && product.price > filters.priceMax) {
      return false;
    }

    // Filtro por stock disponible
    if (filters.inStock && product.stock <= 0) {
      return false;
    }

    return true;
  });
};

export default {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductCategories,
  getLowStockProducts,
  searchProducts,
  validateProductData,
  formatPrice,
  getStockStatus,
  calculateInventoryValue,
  getTopSellingProducts,
  generateSKU,
  checkStockAvailability,
  filterProducts,
};