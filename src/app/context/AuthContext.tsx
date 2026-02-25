import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'doctor' | 'admin' | 'patient';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: 'doctor' | 'admin' | 'patient') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Restaurar sesión desde localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Simulamos una llamada a la API
    // En producción, esto sería una llamada real a tu backend
    const users = JSON.parse(localStorage.getItem('allUsers') || '[]');
    const foundUser = users.find((u: any) => u.email === email && u.password === password);

    if (!foundUser) {
      throw new Error('Email o contraseña inválidos');
    }

    const { password: _, ...userWithoutPassword } = foundUser;
    setUser(userWithoutPassword);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
  };

  const register = async (email: string, password: string, name: string, role: 'doctor' | 'admin' | 'patient') => {
    // Verificar si el usuario ya existe
    const users = JSON.parse(localStorage.getItem('allUsers') || '[]');
    if (users.some((u: any) => u.email === email)) {
      throw new Error('El email ya está registrado');
    }

    const newUser = {
      id: Date.now().toString(),
      email,
      password,
      name,
      role,
    };

    users.push(newUser);
    localStorage.setItem('allUsers', JSON.stringify(users));

    // Auto-login después del registro
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
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
