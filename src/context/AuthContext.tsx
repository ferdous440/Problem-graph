import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserNotification } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  notifications: UserNotification[];
  unreadCount: number;
  login: (email: string, role?: string) => Promise<void>;
  register: (data: { full_name: string; email: string; phone?: string; district?: string; area?: string }) => Promise<void>;
  logout: () => void;
  switchDemoRole: (role: 'user' | 'admin' | 'super_admin') => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('problemgraph_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);

  useEffect(() => {
    async function initAuth() {
      const storedToken = localStorage.getItem('problemgraph_token');
      if (storedToken) {
        try {
          const res = await api.getMe();
          setUser(res.user);
        } catch (e) {
          console.warn('Auto-login failed, falling back to default user');
          // Auto login as default demo user for seamless test experience
          await loginWithRole('user');
        }
      } else {
        // Default login as General User for immediate interactive experience
        await loginWithRole('user');
      }
      setIsLoading(false);
    }

    initAuth();
  }, []);

  useEffect(() => {
    if (user) {
      refreshNotifications();
    } else {
      setNotifications([]);
    }
  }, [user]);

  const refreshNotifications = async () => {
    if (!localStorage.getItem('problemgraph_token')) return;
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications || []);
    } catch (e) {
      // ignore
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) {
      // ignore
    }
  };

  const loginWithRole = async (role: 'user' | 'admin' | 'super_admin') => {
    try {
      const demoEmails: Record<string, string> = {
        user: 'user@problemgraph.bd',
        admin: 'admin@problemgraph.bd',
        super_admin: 'superadmin@problemgraph.bd'
      };
      const res = await api.login(demoEmails[role], role);
      localStorage.setItem('problemgraph_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } catch (e) {
      console.error('Role login error:', e);
    }
  };

  const login = async (email: string, role?: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, role);
      localStorage.setItem('problemgraph_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { full_name: string; email: string; phone?: string; district?: string; area?: string }) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      localStorage.setItem('problemgraph_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('problemgraph_token');
    setToken(null);
    setUser(null);
    setNotifications([]);
  };

  const switchDemoRole = async (role: 'user' | 'admin' | 'super_admin') => {
    setIsLoading(true);
    await loginWithRole(role);
    setIsLoading(false);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        notifications,
        unreadCount,
        login,
        register,
        logout,
        switchDemoRole,
        refreshNotifications,
        markAsRead
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
