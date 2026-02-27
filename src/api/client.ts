import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '../constants/api';
import { storage } from '../utils/storage';

// 响应类型
export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

// 创建 axios 实例
const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加 Token
client.interceptors.request.use(
  async (config) => {
    const token = await storage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器 - 统一错误处理
client.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token 过期，清除本地存储
      await storage.clearAuth();
    }
    return Promise.reject(error);
  }
);

export default client;
