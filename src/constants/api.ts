// API 地址配置
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    socialLogin: '/auth/social/login',
    refresh: '/auth/refresh',
  },
  user: {
    info: '/user/info',
    update: '/user/update',
  },
};
