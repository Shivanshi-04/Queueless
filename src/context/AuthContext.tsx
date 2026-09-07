import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, AuthContextType, LoginCredentials, RegisterCredentials, UserRole } from '../types/auth';
import { api } from '../services/api';

const TOKEN_KEY = 'queueless_auth_token';
const USER_KEY = 'queueless_auth_user';

const DEMO_ACCOUNTS: Record<UserRole, { id: string; email: string; password: string; name: string }> = {
  Customer: { id: 'usr-customer-demo', email: 'customer@demo.com', password: 'password123', name: 'Alex Johnson (Customer)' },
  Admin: { id: 'usr-admin-demo', email: 'admin@demo.com', password: 'password123', name: 'Sarah Miller (Admin)' },
  LoungeManager: { id: 'usr-lounge-demo', email: 'lounge@demo.com', password: 'password123', name: 'Lounge Display Operator' },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.error('Failed to parse saved user from storage', e);
      }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY) || null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate session on mount
  useEffect(() => {
    const verifyUserSession = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (response.data?.user) {
          setUser(response.data.user);
          localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
        }
      } catch (err) {
        console.warn('Session token validation failed or backend offline. Using cached session.');
      } finally {
        setIsLoading(false);
      }
    };

    verifyUserSession();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const response = await api.post('/auth/login', credentials);
      const { token: receivedToken, user: receivedUser } = response.data;

      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem(TOKEN_KEY, receivedToken);
      localStorage.setItem(USER_KEY, JSON.stringify(receivedUser));

      return { success: true };
    } catch (err: any) {
      // Check if credentials match a demo account fallback
      const matchingDemo = Object.values(DEMO_ACCOUNTS).find(
        (acc) => acc.email.toLowerCase() === credentials.email.toLowerCase() && acc.password === credentials.password
      );

      if (matchingDemo) {
        const role = matchingDemo.email.includes('admin')
          ? 'Admin'
          : matchingDemo.email.includes('lounge')
          ? 'LoungeManager'
          : 'Customer';

        const fallbackUser: User = {
          id: matchingDemo.id,
          name: matchingDemo.name,
          email: matchingDemo.email,
          role: role as UserRole,
        };
        const fallbackToken = `jwt-${role.toLowerCase()}-${Date.now()}`;

        setToken(fallbackToken);
        setUser(fallbackUser);
        localStorage.setItem(TOKEN_KEY, fallbackToken);
        localStorage.setItem(USER_KEY, JSON.stringify(fallbackUser));

        return { success: true };
      }

      const errorMsg = err.response?.data?.message || err.message || 'Login failed. Please check credentials.';
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const response = await api.post('/auth/register', credentials);
      const { token: receivedToken, user: receivedUser } = response.data;

      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem(TOKEN_KEY, receivedToken);
      localStorage.setItem(USER_KEY, JSON.stringify(receivedUser));

      return { success: true };
    } catch (err: any) {
      // Fallback local registration if backend is offline
      const fallbackUser: User = {
        id: `usr-${Date.now()}`,
        name: credentials.name,
        email: credentials.email,
        role: credentials.role,
      };
      const fallbackToken = `jwt-${credentials.role.toLowerCase()}-${Date.now()}`;

      setToken(fallbackToken);
      setUser(fallbackUser);
      localStorage.setItem(TOKEN_KEY, fallbackToken);
      localStorage.setItem(USER_KEY, JSON.stringify(fallbackUser));

      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  // Instant one-click demo login: immediately updates state & storage, then background syncs
  const quickLoginAs = async (role: UserRole) => {
    const target = DEMO_ACCOUNTS[role];

    // 1. Immediately establish session synchronously for instantaneous navigation
    const instantUser: User = {
      id: target.id,
      name: target.name,
      email: target.email,
      role: role,
    };
    const instantToken = `jwt-${role.toLowerCase()}-${Date.now()}`;

    setUser(instantUser);
    setToken(instantToken);
    localStorage.setItem(TOKEN_KEY, instantToken);
    localStorage.setItem(USER_KEY, JSON.stringify(instantUser));

    // 2. Background sync with backend without blocking UI navigation
    try {
      const res = await api.post('/auth/login', { email: target.email, password: target.password });
      if (res.data?.token && res.data?.user) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem(TOKEN_KEY, res.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
      }
    } catch {
      // Backend may be starting or offline; instant session is already active
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        quickLoginAs,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
