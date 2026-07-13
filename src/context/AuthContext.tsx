import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, UserRole, AuthContextType } from '../types';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'business_nexus_user';
const TOKEN_STORAGE_KEY = 'business_nexus_token';
const RESET_TOKEN_KEY = 'business_nexus_reset_token';

const API_URL = 'http://localhost:5000/api/auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // REAL login function - connects to backend
  const login = async (email: string, password: string, role: UserRole): Promise<void> => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      const loggedInUser: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.name)}&background=random`,
        bio: '',
        isOnline: true,
        createdAt: new Date().toISOString(),
      };

      setUser(loggedInUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      toast.success('Successfully logged in!');
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // REAL register function - connects to backend
  const register = async (name: string, email: string, password: string, role: UserRole): Promise<void> => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      const newUser: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.name)}&background=random`,
        bio: '',
        isOnline: true,
        createdAt: new Date().toISOString(),
      };

      setUser(newUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      toast.success('Account created successfully!');
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password (still mock - backend feature coming later)
  const forgotPassword = async (email: string): Promise<void> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const resetToken = Math.random().toString(36).substring(2, 15);
      localStorage.setItem(RESET_TOKEN_KEY, resetToken);
      toast.success('Password reset instructions sent to your email');
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    }
  };

  // Reset password (still mock - backend feature coming later)
  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const storedToken = localStorage.getItem(RESET_TOKEN_KEY);
      if (token !== storedToken) {
        throw new Error('Invalid or expired reset token');
      }
      localStorage.removeItem(RESET_TOKEN_KEY);
      toast.success('Password reset successfully');
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    }
  };

  const logout = (): void => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    toast.success('Logged out successfully');
  };

  // Update profile (still mock - backend feature coming later)
  const updateProfile = async (userId: string, updates: Partial<User>): Promise<void> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (user?.id === userId) {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      }
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    isAuthenticated: !!user,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};