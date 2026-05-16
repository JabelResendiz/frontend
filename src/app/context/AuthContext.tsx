import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth.service';
import { setAccessToken, clearAccessToken } from '../services/token-manager';
import { registerLogoutHandler } from '../services/api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'Admin' | 'MedicalReviewer' | 'SectionResponsible';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const parseJwt = <T extends Record<string, any>>(token: string): T | null => {
  try {
    const base64Payload = token.split('.')[1];
    const payload = atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(
      payload.split('').map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`).join('')
    ));
  } catch {
    return null;
  }
};

const getUserFromToken = (token: string): User | null => {
  const payload = parseJwt<Record<string, any>>(token);
  if (!payload) return null;

  const roleClaim = payload.role || payload.roles || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
  const role = Array.isArray(roleClaim)
    ? roleClaim[0]
    : typeof roleClaim === 'string'
    ? roleClaim
    : undefined;

  const user: User = {
    id: payload.sub || payload.nameid || payload.uid || '',
    email: payload.email || payload.unique_name || '',
    name: payload.given_name || payload.name || payload.email || 'Usuario',
    role: role === 'Admin'
      ? 'Admin'
      : role === 'SectionResponsible'
      ? 'SectionResponsible'
      : 'MedicalReviewer',
  };

  return user;
};

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Ignorar errores en el logout, el estado local debe limpiarse de todas formas
    }

    clearAccessToken();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    registerLogoutHandler(handleLogout);
  }, [handleLogout]);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await authService.refreshToken();
        setAccessToken(token);

        const restoredUser = getUserFromToken(token);
        if (restoredUser) {
          setUser(restoredUser);
          setIsAuthenticated(true);
        }
      } catch {
        clearAccessToken();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authService.login(email, password);
    const token = data.token || data.accessToken;

    if (!token) {
      throw new Error('No se recibió access token del backend');
    }

    setAccessToken(token);

    const loggedUser = data.id && data.userName && data.userRole
      ? {
          id: data.id.toString(),
          name: data.userName,
          email,
          role: data.userRole as User['role'],
        }
      : getUserFromToken(token);

    if (!loggedUser) {
      throw new Error('No se pudo obtener información del usuario desde el token');
    }

    setUser(loggedUser);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await handleLogout();
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
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
