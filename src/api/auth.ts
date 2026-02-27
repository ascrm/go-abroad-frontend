import { API_ENDPOINTS } from '../constants/api';
import { ApiResponse, LoginParams, LoginResponseData, SocialLoginParams } from '../types/auth';
import client from './client';

export const authApi = {
  // 账号密码登录
  login: (data: LoginParams): Promise<ApiResponse<LoginResponseData>> => {
    return client.post(API_ENDPOINTS.auth.login, data);
  },

  // 第三方登录
  socialLogin: (data: SocialLoginParams): Promise<ApiResponse<LoginResponseData>> => {
    return client.post(API_ENDPOINTS.auth.socialLogin, data);
  },

  // 刷新 Token
  refreshToken: (refreshToken: string): Promise<ApiResponse<LoginResponseData>> => {
    return client.post(
      API_ENDPOINTS.auth.refresh,
      {},
      {
        headers: {
          'Refresh-Token': refreshToken,
        },
      }
    );
  },
};
