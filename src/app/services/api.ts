import axios from 'axios';
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const timeout = Number(import.meta.env.VITE_API_TIMEOUT) || 5000;

export const api = axios.create({
  baseURL,
  timeout,
});