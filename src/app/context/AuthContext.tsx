import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: number;
  email: string;
  userName: string;
  userRole: 'Physician' | 'Admin';
  role?: 'doctor' | 'admin'; // Mapeado para compatibilidad
}

interface LoginResponse {
  id: number;
  userName: string;
  email: string;
  userRole: 'Physician' | 'Admin';
  token: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, userName: string, userRole: 'Physician' | 'Admin') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = 'http://0.0.0.0:5137/api/Authentication';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error('Email o contraseña inválidos');
      }

      const data: LoginResponse = await response.json();

      // Mapear el rol de backend a nuestro sistema
      const mappedUser: User = {
        id: data.id,
        email: data.email,
        userName: data.userName,
        userRole: data.userRole,
        role: data.userRole === 'Physician' ? 'doctor' : 'admin',
      };

      setUser(mappedUser);
      setIsAuthenticated(true);
      
      // Guardar token en sessionStorage (se limpia al cerrar la pestaña)
      sessionStorage.setItem('token', data.token);
    } catch (error) {
      throw error instanceof Error ? error : new Error('Error en el inicio de sesión');
    }
  };

  const register = async (email: string, password: string, name: string, userName: string, userRole: 'Physician' | 'Admin') => {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          userName,
          email,
          password,
          userRole,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al registrarse');
      }

      // El registro no devuelve token, solo el mensaje de éxito
      // No guardamos nada en el frontend
      const data = await response.json();
      console.log('Registro exitoso:', data.message);
    } catch (error) {
      throw error instanceof Error ? error : new Error('Error al registrarse');
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    sessionStorage.removeItem('token');
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
