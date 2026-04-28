import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'Admin' | 'MedicalReviewer' | 'SectionResponsible';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authService.login(email, password);

    const user: User = {
      id: data.id.toString(),
      name: data.userName,
      email,
      role: data.userRole as User['role'],
    };

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(user));

    setUser(user);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }

  return context;
};
