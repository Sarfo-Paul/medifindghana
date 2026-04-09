import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Fetch user data
      fetchUserData();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const fetchUserData = async () => {
    try {
      // In a real app, you would have an endpoint to get user data
      // For now, we'll decode the token to get user info
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          id: payload.id,
          name: payload.name || 'User',
          email: payload.email,
          phone: payload.phone || null,
          role: payload.role || 'USER'
        });
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Trim email and password to avoid accidental whitespace issues
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();

      const response = await axios.post('http://localhost:3001/api/auth/login', {
        email: cleanEmail,
        password: cleanPassword
      });
      
      const { user, token } = response.data;
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    try {
      const response = await axios.post('http://localhost:3001/api/auth/register', {
        name,
        email: email.trim().toLowerCase(),
        password: password.trim(),
        phone
      });
      
      const { user, token } = response.data;
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const isAdmin = !!user && (user.role === 'ADMIN' || user.role === 'PHARMACY_OWNER');

  return (
    <AuthContext.Provider value={{ user, token, isAdmin, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};