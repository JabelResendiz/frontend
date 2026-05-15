import { authApi } from './api';
import { setAccessToken, clearAccessToken } from './token-manager';

interface AuthResponse {
  token: string;
  accessToken?: string;
  id?: string;
  userName?: string;
  userRole?: string;
  email?: string;
}

const getTokenFromResponse = (data: AuthResponse) => data.token || data.accessToken || '';

export const authService = {
  login: async (email: string, password: string) => {
    const res = await authApi.post<AuthResponse>('/Authentication/login', {
      email,
      password,
    });

    return res.data;
  },

  refreshToken: async () => {
    const res = await authApi.post<AuthResponse>('/Authentication/refresh');
    const token = getTokenFromResponse(res.data);
    if (!token) {
      clearAccessToken();
      throw new Error('No se recibió access token en refresh');
    }
    return token;
  },

  logout: async () => {
    await authApi.post('/Authentication/logout');
  },
};