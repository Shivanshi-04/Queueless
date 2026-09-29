import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, AuthContextType, LoginCredentials, RegisterCredentials, UserRole } from '../types/auth';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

interface ProfileRow {
  id: string;
  name?: string | null;
  full_name?: string | null;
  role: string | null;
  created_at?: string;
  updated_at?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to fetch user profile from public.profiles and construct application User object
const fetchUserProfile = async (authUser: SupabaseAuthUser): Promise<User> => {
  try {
    // 1. Supabase authenticated user
    console.log('[AUTH] Supabase user:', authUser);

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle<ProfileRow>();

    if (error) {
      console.warn('[AUTH] Error reading profile from public.profiles:', error.message, error);
    }

    // 2. Profile returned from Supabase
    console.log('[AUTH] Profile:', profile);

    const candidateRole = profile?.role || authUser.user_metadata?.role || authUser.app_metadata?.role;
    let role: UserRole = 'Customer';
    if (candidateRole) {
      const rawRole = candidateRole.toString().trim().toLowerCase();
      if (rawRole === 'admin') {
        role = 'Admin';
      } else if (rawRole === 'loungemanager' || rawRole === 'lounge_manager' || rawRole === 'lounge') {
        role = 'LoungeManager';
      } else if (rawRole === 'customer') {
        role = 'Customer';
      } else if (candidateRole === 'Admin' || candidateRole === 'LoungeManager' || candidateRole === 'Customer') {
        role = candidateRole as UserRole;
      }
    }

    const applicationUser: User = {
      id: authUser.id,
      email: authUser.email || '',
      name: profile?.name || profile?.full_name || authUser.user_metadata?.name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
      role,
      createdAt: profile?.created_at || authUser.created_at,
    };

    // 3. Final AuthContext user object
    console.log('[AUTH] Final application user:', applicationUser);

    return applicationUser;
  } catch (err) {
    console.error('[AUTH] Failed to resolve profile for user:', err);
    const candidateRole = authUser.user_metadata?.role || authUser.app_metadata?.role;
    let role: UserRole = 'Customer';
    if (candidateRole) {
      const rawRole = candidateRole.toString().trim().toLowerCase();
      if (rawRole === 'admin') role = 'Admin';
      else if (rawRole === 'loungemanager' || rawRole === 'lounge_manager' || rawRole === 'lounge') role = 'LoungeManager';
    }

    const fallbackUser: User = {
      id: authUser.id,
      email: authUser.email || '',
      name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
      role,
      createdAt: authUser.created_at,
    };

    console.log('[AUTH] Final application user:', fallbackUser);

    return fallbackUser;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session and subscribe to auth state changes
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.warn('[AUTH DEBUG] Error getting Supabase session:', sessionError.message);
        }

        if (session?.user && isMounted) {
          const { data: userData } = await supabase.auth.getUser();
          const authUser = userData?.user || session.user;
          const appUser = await fetchUserProfile(authUser);
          if (isMounted) {
            setUser(appUser);
            setToken(session.access_token);
            localStorage.setItem('queueless_auth_token', session.access_token);
            localStorage.setItem('queueless_auth_user', JSON.stringify(appUser));
          }
        } else if (isMounted) {
          setUser(null);
          setToken(null);
          localStorage.removeItem('queueless_auth_token');
          localStorage.removeItem('queueless_auth_user');
        }
      } catch (err) {
        console.warn('[AUTH DEBUG] Error during session initialization:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const { data: userData } = await supabase.auth.getUser();
          const authUser = userData?.user || session.user;
          const appUser = await fetchUserProfile(authUser);
          if (isMounted) {
            setUser(appUser);
            setToken(session.access_token);
            localStorage.setItem('queueless_auth_token', session.access_token);
            localStorage.setItem('queueless_auth_user', JSON.stringify(appUser));
            setIsLoading(false);
          }
        } else {
          if (isMounted) {
            setUser(null);
            setToken(null);
            localStorage.removeItem('queueless_auth_token');
            localStorage.removeItem('queueless_auth_user');
            setIsLoading(false);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      setIsLoading(true);

      if (!credentials.email || !credentials.password) {
        return { success: false, error: 'Please provide both email and password.' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email.trim(),
        password: credentials.password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user || !data.session) {
        return { success: false, error: 'Login failed. No active session returned.' };
      }

      const { data: userData } = await supabase.auth.getUser();
      const authUser = userData?.user || data.user;

      const appUser = await fetchUserProfile(authUser);
      const sessionToken = data.session.access_token;

      setUser(appUser);
      setToken(sessionToken);
      localStorage.setItem('queueless_auth_token', sessionToken);
      localStorage.setItem('queueless_auth_user', JSON.stringify(appUser));

      return { success: true, user: appUser };
    } catch (err: any) {
      const errorMsg = err.message || 'Login failed. Please check credentials.';
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      setIsLoading(true);

      if (!credentials.email || !credentials.password) {
        return { success: false, error: 'Please provide both email and password.' };
      }

      // Security requirement: public registration must strictly enforce Customer role
      const name = credentials.name?.trim() || '';

      const { data, error } = await supabase.auth.signUp({
        email: credentials.email.trim(),
        password: credentials.password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Registration failed. No user returned.' };
      }

      // Explicitly insert or ensure Customer profile exists in public.profiles using name
      try {
        await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            name: name || data.user.email?.split('@')[0] || 'Customer',
            role: 'Customer',
          });
      } catch (profileErr) {
        console.warn('Profile synchronization notice:', profileErr);
      }

      const { data: userData } = await supabase.auth.getUser();
      const authUser = userData?.user || data.user;
      const appUser = await fetchUserProfile(authUser);
      const sessionToken = data.session?.access_token || null;

      setUser(appUser);
      setToken(sessionToken);

      if (sessionToken) {
        localStorage.setItem('queueless_auth_token', sessionToken);
      }
      localStorage.setItem('queueless_auth_user', JSON.stringify(appUser));

      return { success: true, user: appUser };
    } catch (err: any) {
      const errorMsg = err.message || 'An unexpected registration error occurred.';
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('queueless_auth_token');
    localStorage.removeItem('queueless_auth_user');

    supabase.auth.signOut().catch((err) => {
      console.warn('Error signing out of Supabase:', err);
    });
  };

  const resetPasswordForEmail = async (
    email: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'http://localhost:5173/reset-password',
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to send password reset email.' };
    }
  };

  const updatePassword = async (
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update password.' };
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
        resetPasswordForEmail,
        updatePassword,
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
