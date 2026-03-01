// API 地址配置
export const API_BASE_URL = 'http://192.168.31.183:8080';

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    sendCode: '/auth/sendCode',
    socialLogin: '/auth/social/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
  },
  user: {
    info: '/user/info',
    update: '/user/update',
  },
};
