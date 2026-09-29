export type UserRole = 'Customer' | 'Admin' | 'LoungeManager';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; user?: User; error?: string }>;
  register: (credentials: RegisterCredentials) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
  resetPasswordForEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  quickLoginAs?: (role: UserRole) => Promise<void>;
}
