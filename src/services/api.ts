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

export default api;
