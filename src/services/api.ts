import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('remember_me_token');
      // Redirect to login will be handled by the app
    }
    return Promise.reject(error);
  }
);

// Types
export interface RegisterData {
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface VerifyEmailData {
  token: string;
}

export interface Tenant {
  id: number;
  name: string;
  has_paid: boolean;
  is_admin: boolean;
  issuer_business_id?: number;
  issuer_business?: {
    id: number;
    business_name: string;
    fiscal_number?: string;
  };
  created_at?: string;
  updated_at?: string;
  users?: User[];
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    roles: string[];
    is_active: boolean;
    tenant: Tenant | null;
  };
  remember_me_token?: string | null;
}

export interface User {
  id: number;
  email: string;
  roles: string[];
  email_verified: boolean;
  is_active: boolean;
  tenant: Tenant | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  roles?: string[];
  email_verified?: boolean;
  is_active?: boolean;
  tenant_id?: number;
}

export interface InviteUserData {
  email: string;
  roles?: string[];
  tenant_id?: number;
}

export interface UpdateUserData {
  email?: string;
  password?: string;
  roles?: string[];
  is_active?: boolean;
  tenant_id?: number;
}

export interface AcceptInvitationData {
  token: string;
  password: string;
}

export interface Business {
  id: number;
  business_name: string;
  trade_name?: string;
  business_type?: string;
  unique_identifier_number?: string;
  business_number?: string;
  fiscal_number?: string;
  number_of_employees?: number;
  registration_date?: string;
  municipality?: string;
  address?: string;
  phone?: string;
  email?: string;
  capital?: string;
  arbk_status?: string;
  created_by_id: number;
  tenant_id: number;
  created_at?: string;
  updated_at?: string;
  created_by?: {
    id: number;
    email: string;
  };
  tenant?: {
    id: number;
    name: string;
  };
}

export interface CreateBusinessData {
  business_name: string;
  trade_name?: string;
  business_type?: string;
  unique_identifier_number?: string;
  business_number?: string;
  fiscal_number?: string;
  number_of_employees?: number;
  registration_date?: string;
  municipality?: string;
  address?: string;
  phone?: string;
  email?: string;
  capital?: string;
  arbk_status?: string;
}

export interface UpdateBusinessData extends Partial<CreateBusinessData> {}

export interface Article {
  id: number;
  name: string;
  description?: string;
  unit_price: string;
  unit?: string;
  business_id: number;
  created_at?: string;
  updated_at?: string;
  business?: {
    id: number;
    business_name: string;
  };
}

export interface CreateArticleData {
  name: string;
  description?: string;
  unit_price: number | string;
  unit?: string;
}

export interface UpdateArticleData extends Partial<CreateArticleData> {}

export interface Tax {
  id: number;
  rate: string | null; // null for exempted
  name: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface InvoiceItem {
  id: number;
  invoice_id: number;
  article_id?: number | null;
  tax_id?: number | null;
  description: string;
  quantity: string;
  unit_price: string;
  subtotal: string;
  tax_amount: string;
  total: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
  article?: Article | null;
  tax?: Tax | null;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  subtotal: string;
  total: string;
  issuer_id: number;
  receiver_id: number;
  created_at?: string;
  updated_at?: string;
  issuer?: Business;
  receiver?: Business;
  items?: InvoiceItem[];
}

export interface CreateInvoiceData {
  receiver_id: number;
  invoice_date: string;
  due_date: string;
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  items: CreateInvoiceItemData[];
}

export interface CreateInvoiceItemData {
  description: string;
  quantity: number | string;
  unit_price: number | string;
  article_id?: number | null;
  tax_id?: number | null;
  tax_rate?: number | null; // Alternative to tax_id
  sort_order?: number;
}

export interface UpdateInvoiceData extends Partial<CreateInvoiceData> {
  items?: CreateInvoiceItemData[];
}

// API methods
export const authApi = {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<{ message: string; email: string }> {
    const response = await api.post('/register', data);
    return response.data;
  },

  /**
   * Login user
   */
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post('/login', data);
    const authData: AuthResponse = response.data;
    
    // Store token and user data
    localStorage.setItem('auth_token', authData.token);
    localStorage.setItem('user', JSON.stringify(authData.user));
    
    // Store remember me token if provided
    if (authData.remember_me_token) {
      localStorage.setItem('remember_me_token', authData.remember_me_token);
    }
    
    return authData;
  },

  /**
   * Verify email with token
   */
  async verifyEmail(data: VerifyEmailData): Promise<{ message: string; email: string }> {
    const response = await api.post('/verify-email', data);
    return response.data;
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    const response = await api.get('/user');
    return response.data;
  },

  /**
   * Logout user (clear local storage)
   */
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('remember_me_token');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  },

  /**
   * Get stored user data
   */
  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },
};

// Tenant API methods
export const tenantsApi = {
  /**
   * Get all tenants (admin tenants see all, regular users see only their own)
   */
  async getTenants(): Promise<Tenant[]> {
    const response = await api.get('/tenants');
    return response.data;
  },

  /**
   * Get a single tenant by ID
   */
  async getTenant(id: number): Promise<Tenant> {
    const response = await api.get(`/tenants/${id}`);
    return response.data;
  },

  /**
   * Update a tenant
   */
  async updateTenant(id: number, data: Partial<Tenant>): Promise<Tenant> {
    const response = await api.put(`/tenants/${id}`, data);
    return response.data;
  },

  /**
   * Delete a tenant (admin only)
   */
  async deleteTenant(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/tenants/${id}`);
    return response.data;
  },
};

// User API methods
export const usersApi = {
  /**
   * Get all users (admin users see their tenant's users, admin tenant users see all)
   */
  async getUsers(tenantId?: number): Promise<User[]> {
    const params = tenantId ? { tenant_id: tenantId } : {};
    const response = await api.get('/users', { params });
    return response.data;
  },

  /**
   * Get a single user by ID
   */
  async getUser(id: number): Promise<User> {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  /**
   * Create a user directly (for admins)
   */
  async createUser(data: CreateUserData): Promise<User> {
    const response = await api.post('/users', data);
    return response.data;
  },

  /**
   * Invite a user via email
   */
  async inviteUser(data: InviteUserData): Promise<{ message: string; user: User }> {
    const response = await api.post('/users/invite', data);
    return response.data;
  },

  /**
   * Update a user
   */
  async updateUser(id: number, data: UpdateUserData): Promise<User> {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  /**
   * Delete a user
   */
  async deleteUser(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  /**
   * Accept invitation and set password
   */
  async acceptInvitation(data: AcceptInvitationData): Promise<{ message: string; user: User }> {
    const response = await api.post('/users/accept-invitation', data);
    return response.data;
  },
};

// Business API methods
export const businessesApi = {
  /**
   * Get all businesses (admin tenants see all, regular users see only their tenant's businesses)
   */
  async getBusinesses(): Promise<Business[]> {
    const response = await api.get('/businesses');
    return response.data;
  },

  /**
   * Get a single business by ID
   */
  async getBusiness(id: number): Promise<Business> {
    const response = await api.get(`/businesses/${id}`);
    return response.data;
  },

  /**
   * Create a new business
   */
  async createBusiness(data: CreateBusinessData): Promise<Business> {
    const response = await api.post('/businesses', data);
    return response.data;
  },

  /**
   * Update a business
   */
  async updateBusiness(id: number, data: UpdateBusinessData): Promise<Business> {
    const response = await api.put(`/businesses/${id}`, data);
    return response.data;
  },

  /**
   * Delete a business
   */
  async deleteBusiness(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/businesses/${id}`);
    return response.data;
  },
};

// Article API methods
export const articlesApi = {
  /**
   * Get all articles for a business
   */
  async getArticles(businessId: number): Promise<Article[]> {
    const response = await api.get(`/businesses/${businessId}/articles`);
    return response.data;
  },

  /**
   * Get a single article by ID
   */
  async getArticle(businessId: number, id: number): Promise<Article> {
    const response = await api.get(`/businesses/${businessId}/articles/${id}`);
    return response.data;
  },

  /**
   * Create a new article
   */
  async createArticle(businessId: number, data: CreateArticleData): Promise<Article> {
    const response = await api.post(`/businesses/${businessId}/articles`, data);
    return response.data;
  },

  /**
   * Update an article
   */
  async updateArticle(businessId: number, id: number, data: UpdateArticleData): Promise<Article> {
    const response = await api.put(`/businesses/${businessId}/articles/${id}`, data);
    return response.data;
  },

  /**
   * Delete an article
   */
  async deleteArticle(businessId: number, id: number): Promise<{ message: string }> {
    const response = await api.delete(`/businesses/${businessId}/articles/${id}`);
    return response.data;
  },
};

// Tax API methods
export const taxesApi = {
  /**
   * Get all taxes (all authenticated users)
   */
  async getTaxes(): Promise<Tax[]> {
    const response = await api.get('/taxes');
    return response.data;
  },

  /**
   * Get a single tax by ID
   */
  async getTax(id: number): Promise<Tax> {
    const response = await api.get(`/taxes/${id}`);
    return response.data;
  },

  /**
   * Create a new tax (only admins of admin tenants)
   */
  async createTax(data: { rate: number | null; name?: string }): Promise<Tax> {
    const response = await api.post('/taxes', data);
    return response.data;
  },

  /**
   * Update a tax (only admins of admin tenants)
   */
  async updateTax(id: number, data: { rate?: number | null; name?: string }): Promise<Tax> {
    const response = await api.put(`/taxes/${id}`, data);
    return response.data;
  },

  /**
   * Delete a tax (only admins of admin tenants)
   */
  async deleteTax(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/taxes/${id}`);
    return response.data;
  },
};

// Invoice API methods
export const invoicesApi = {
  /**
   * Get all invoices for a business (as issuer)
   */
  async getInvoices(businessId: number): Promise<Invoice[]> {
    const response = await api.get(`/businesses/${businessId}/invoices`);
    return response.data;
  },

  /**
   * Get all invoices (admin tenants only)
   */
  async getAllInvoices(): Promise<Invoice[]> {
    const response = await api.get('/invoices');
    return response.data;
  },

  /**
   * Get a single invoice by ID
   */
  async getInvoice(businessId: number, id: number): Promise<Invoice> {
    const response = await api.get(`/businesses/${businessId}/invoices/${id}`);
    return response.data;
  },

  /**
   * Create a new invoice with items
   */
  async createInvoice(businessId: number, data: CreateInvoiceData): Promise<Invoice> {
    const response = await api.post(`/businesses/${businessId}/invoices`, data);
    return response.data;
  },

  /**
   * Update an invoice and its items
   */
  async updateInvoice(businessId: number, id: number, data: UpdateInvoiceData): Promise<Invoice> {
    const response = await api.put(`/businesses/${businessId}/invoices/${id}`, data);
    return response.data;
  },

  /**
   * Delete an invoice (cascades to items)
   */
  async deleteInvoice(businessId: number, id: number): Promise<{ message: string }> {
    const response = await api.delete(`/businesses/${businessId}/invoices/${id}`);
    return response.data;
  },

  /**
   * Download invoice as PDF
   */
  async downloadInvoicePdf(businessId: number, invoiceId: number): Promise<Blob> {
    const response = await api.get(
      `/businesses/${businessId}/invoices/${invoiceId}/pdf`,
      { responseType: 'blob' }
    );
    return response.data;
  },
};

// InvoiceItem API methods
export const invoiceItemsApi = {
  /**
   * Get all items for an invoice
   */
  async getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]> {
    const response = await api.get(`/invoices/${invoiceId}/items`);
    return response.data;
  },

  /**
   * Get a single invoice item by ID
   */
  async getInvoiceItem(invoiceId: number, id: number): Promise<InvoiceItem> {
    const response = await api.get(`/invoices/${invoiceId}/items/${id}`);
    return response.data;
  },

  /**
   * Create a new invoice item
   */
  async createInvoiceItem(invoiceId: number, data: CreateInvoiceItemData): Promise<InvoiceItem> {
    const response = await api.post(`/invoices/${invoiceId}/items`, data);
    return response.data;
  },

  /**
   * Update an invoice item
   */
  async updateInvoiceItem(invoiceId: number, id: number, data: Partial<CreateInvoiceItemData>): Promise<InvoiceItem> {
    const response = await api.put(`/invoices/${invoiceId}/items/${id}`, data);
    return response.data;
  },

  /**
   * Delete an invoice item
   */
  async deleteInvoiceItem(invoiceId: number, id: number): Promise<{ message: string }> {
    const response = await api.delete(`/invoices/${invoiceId}/items/${id}`);
    return response.data;
  },

  /**
   * Reorder invoice items
   */
  async reorderItems(invoiceId: number, itemIds: number[]): Promise<{ message: string }> {
    const response = await api.post(`/invoices/${invoiceId}/items/reorder`, { item_ids: itemIds });
    return response.data;
  },
};

export default api;
