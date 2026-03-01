import { API_ENDPOINTS } from '../constants/api';
import { ApiResponse, LoginParams, LoginResponseData, RegisterParams, SendCodeParams, SendCodeResponseData, SocialLoginParams } from '../types/auth';
import client from './client';

export const authApi = {
  // 账号密码登录
  login: (data: LoginParams): Promise<ApiResponse<LoginResponseData>> => {
    return client.post(API_ENDPOINTS.auth.login, data);
  },

  // 发送验证码
  sendCode: (data: SendCodeParams): Promise<ApiResponse<SendCodeResponseData>> => {
    return client.post(API_ENDPOINTS.auth.sendCode, data);
  },

  // 注册
  register: (data: RegisterParams): Promise<ApiResponse<LoginResponseData>> => {
    return client.post(API_ENDPOINTS.auth.register, data);
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

  // 退出登录
  logout: (): Promise<ApiResponse<null>> => {
    return client.post(API_ENDPOINTS.auth.logout);
  },
};
