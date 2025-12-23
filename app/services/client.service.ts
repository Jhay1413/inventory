import {
  ClientListResponseSchema,
  ClientResponseSchema,
  type ClientFilters,
  type ClientListResponse,
  type ClientResponse,
  type CreateClientRequest,
  type UpdateClientRequest,
} from '@/types/client';
import { z } from 'zod';

class ClientService {
  private baseUrl = '/api/clients';

  async getAllClients(filters: ClientFilters = {}): Promise<ClientListResponse> {
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
      throw new Error(errorData.error || 'Failed to fetch clients');
    }

    const data = await response.json();
    return ClientListResponseSchema.parse(data);
  }

  async getClientById(id: string): Promise<ClientResponse> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch client');
    }

    const data = await response.json();
    return ClientResponseSchema.parse(data);
  }

  async createClient(clientData: CreateClientRequest): Promise<ClientResponse> {
    const response = await fetch('/api/clients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to create client');
    }

    const data = await response.json();
    return ClientResponseSchema.parse(data);
  }

  async updateClient(id: string, clientData: UpdateClientRequest): Promise<ClientResponse> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to update client');
    }

    const data = await response.json();
    return ClientResponseSchema.parse(data);
  }

  async deleteClient(id: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to delete client');
    }

    const data = await response.json();
    return z.object({ message: z.string() }).parse(data);
  }
}

export const clientService = new ClientService();
