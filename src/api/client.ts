import axios, { AxiosError } from 'axios';
import { Alert } from 'react-native';
import { API_BASE_URL } from '../constants/api';
import { storage } from '../utils/storage';

// 响应类型
export interface ApiResponse<T = any> {
  code: number;
  msg?: string;
  message?: string;
  data: T;
}

function getResponseMessage(payload: any): string {
  if (!payload) return '请求失败，请稍后重试';
  return (
    payload.message ||
    payload.msg ||
    payload.error ||
    payload.errMsg ||
    '请求失败，请稍后重试'
  );
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
  (response): any => {
    // 打印响应日志
    console.log('=== Response ===');
    console.log(`URL: ${response.config.baseURL}${response.config.url}`);
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    console.log('===============');

    // 约定：HTTP status=200 才算“请求成功”
    if (response.status !== 200) {
      const msg = getResponseMessage(response.data);
      Alert.alert('请求失败', msg);
      return Promise.reject(new Error(msg));
    }

    // 约定：业务 code=20000 才算”业务成功”
    const payload = response.data as ApiResponse;
    if (payload && payload.code !== 20000) {
      const msg = getResponseMessage(payload);
      return Promise.reject(new Error(msg));
    }

    return payload.data;
  },
  async (error: AxiosError) => {
    // 打印错误响应日志
    console.log('=== Response Error ===');
    console.log(`URL: ${error.config?.baseURL}${error.config?.url}`);
    console.log('Status:', error.response?.status);
    console.log('Data:', error.response?.data);
    console.log('Message:', error.message);
    console.log('====================');

    const status = error.response?.status;
    const payload: any = error.response?.data;

    // 请求失败统一提示（HTTP 非 200）
    if (typeof status === 'number' && status !== 200) {
      const msg = getResponseMessage(payload) || error.message;
      Alert.alert('请求失败', msg);
    } else if (!error.response) {
      // 网络/超时/DNS 等无响应场景
      Alert.alert('网络错误', error.message || '网络异常，请检查网络后重试');
    }

    if (status === 403) {
      // Token 过期，清除本地存储
      await storage.clearAuth();
    }
    return Promise.reject(error);
  }
);

export default client;
