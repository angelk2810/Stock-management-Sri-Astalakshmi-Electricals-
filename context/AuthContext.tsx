
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';
import { callBackend } from '../services/api';

interface AuthContextType extends AuthState {
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('vf_user');
    if (savedUser) {
      setState({
        user: JSON.parse(savedUser),
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (email: string, pass: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await callBackend<{ user: User }>('login', { email, password: pass });
      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
      localStorage.setItem('vf_user', JSON.stringify(response.user));
    } catch (err) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw err;
    }
  };

  const logout = () => {
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    localStorage.removeItem('vf_user');
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
