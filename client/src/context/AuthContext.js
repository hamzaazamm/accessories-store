'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Initialize user from stored token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('gd_token');
    const storedUser = localStorage.getItem('gd_user');

    if (storedToken) {
      setToken(storedToken);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Error parsing stored user:', e);
        }
      }
      // Verify token with backend
      api
        .getMe()
        .then((data) => {
          if (data?.user) {
            setUser(data.user);
            localStorage.setItem('gd_user', JSON.stringify(data.user));
          }
        })
        .catch(() => {
          // Token invalid or expired
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    if (data?.token && data?.user) {
      localStorage.setItem('gd_token', data.token);
      localStorage.setItem('gd_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const register = async (userData) => {
    const data = await api.register(userData);
    if (data?.token && data?.user) {
      localStorage.setItem('gd_token', data.token);
      localStorage.setItem('gd_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('gd_token');
    localStorage.removeItem('gd_user');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (userData) => {
    const data = await api.updateProfile(userData);
    if (data?.user) {
      setUser(data.user);
      localStorage.setItem('gd_user', JSON.stringify(data.user));
    }
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
