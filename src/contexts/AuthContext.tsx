import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, User, RegisterData, LoginData, VerifyEmailData } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<{ message: string; email: string }>;
  verifyEmail: (data: VerifyEmailData) => Promise<{ message: string; email: string }>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First, try to get user from localStorage
        const storedUser = authApi.getStoredUser();
        if (storedUser && authApi.isAuthenticated()) {
          setUser(storedUser);
          
          // Verify token is still valid by fetching current user
          try {
            const currentUser = await authApi.getCurrentUser();
            setUser(currentUser);
            // Update stored user with latest data
            localStorage.setItem('user', JSON.stringify(currentUser));
          } catch {
            // Token invalid, clear auth
            authApi.logout();
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        authApi.logout();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (data: LoginData) => {
    await authApi.login(data);
    const currentUser = await authApi.getCurrentUser();
    setUser(currentUser);
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  const register = async (data: RegisterData) => {
    const response = await authApi.register(data);
    return response;
  };

  const verifyEmail = async (data: VerifyEmailData) => {
    const response = await authApi.verifyEmail(data);
    return response;
  };

  const refreshUser = async () => {
    try {
      if (authApi.isAuthenticated()) {
        const currentUser = await authApi.getCurrentUser();
        setUser(currentUser);
        localStorage.setItem('user', JSON.stringify(currentUser));
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      authApi.logout();
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && authApi.isAuthenticated(),
    isLoading,
    login,
    logout,
    register,
    verifyEmail,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
