import {
  ProductListResponseSchema,
  ProductResponseSchema,
  type CreateProductRequest,
  type ProductFilters,
  type ProductListResponse,
  type ProductResponse,
  type UpdateProductRequest,
} from '@/types/product';
import { z } from 'zod';

class ProductService {
  private baseUrl = '/api/products';

  async getAllProducts(filters: ProductFilters = {}): Promise<ProductListResponse> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());

    const url = `${this.baseUrl}${params.toString() ? `?${params.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch products');
    }

    const data = await response.json();
    return ProductListResponseSchema.parse(data);
  }

  async getProductById(id: string): Promise<ProductResponse> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch product');
    }

    const data = await response.json();
    return ProductResponseSchema.parse(data);
  }

  async createProduct(productData: CreateProductRequest): Promise<ProductResponse> {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to create product');
    }

    const data = await response.json();
    return ProductResponseSchema.parse(data);
  }

  async updateProduct(id: string, productData: UpdateProductRequest): Promise<ProductResponse> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to update product');
    }

    const data = await response.json();
    return ProductResponseSchema.parse(data);
  }

  async deleteProduct(id: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to delete product');
    }

    const data = await response.json();
    return z.object({ message: z.string() }).parse(data);
  }
}

export const productService = new ProductService();
