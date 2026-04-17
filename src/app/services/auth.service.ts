import { api } from './api';

export const authService = {
  login: async (email: string, password: string) => {
    const res = await api.post('/Authentication/login', {
      email,
      password,
    });

    return res.data;
  },
};