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

// 请求拦截器 - 添加 Token + 日志
client.interceptors.request.use(
  async (config) => {
    // 打印请求日志
    console.log('=== Request ===');
    console.log(`URL: ${config.baseURL}${config.url}`);
    console.log(`Method: ${config.method?.toUpperCase()}`);
    console.log('Params:', config.params);
    console.log('Data:', config.data);
    console.log('===============');

    const token = await storage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器 - 统一错误处理 + 日志
client.interceptors.response.use(
  (response) => {
    // 打印响应日志
    console.log('=== Response ===');
    console.log(`URL: ${response.config.baseURL}${response.config.url}`);
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    console.log('===============');
    return response.data;
  },
  async (error: AxiosError) => {
    // 打印错误响应日志
    console.log('=== Response Error ===');
    console.log(`URL: ${error.config?.baseURL}${error.config?.url}`);
    console.log('Status:', error.response?.status);
    console.log('Data:', error.response?.data);
    console.log('Message:', error.message);
    console.log('====================');

    if (error.response?.status === 401) {
      // Token 过期，清除本地存储
      await storage.clearAuth();
    }
    return Promise.reject(error);
  }
);

export default client;
