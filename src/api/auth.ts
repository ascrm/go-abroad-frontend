import { API_ENDPOINTS } from '../constants/api';
import { ApiResponse, LoginParams, LoginResponseData, RegisterParams, SendCodeParams, SendCodeResponseData, SocialLoginParams } from '../types/auth';
import client from './client';

export const authApi = {
  // 账号密码登录
  login: (data: LoginParams): Promise<LoginResponseData> => {
    return client.post(API_ENDPOINTS.auth.login, data);
  },

  // 发送验证码
  sendCode: (data: SendCodeParams): Promise<SendCodeResponseData> => {
    return client.post(API_ENDPOINTS.auth.sendCode, data);
  },

  // 注册
  register: (data: RegisterParams): Promise<LoginResponseData> => {
    return client.post(API_ENDPOINTS.auth.register, data);
  },

  // 第三方登录
  socialLogin: (data: SocialLoginParams): Promise<LoginResponseData> => {
    return client.post(API_ENDPOINTS.auth.socialLogin, data);
  },

  // 刷新 Token
  refreshToken: (refreshToken: string): Promise<LoginResponseData> => {
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

  // 切换账号
  switchAccount: (data: { accountType: number; accountValue: string }): Promise<LoginResponseData> => {
    return client.post(API_ENDPOINTS.auth.switchAccount, data);
  },

  // 修改密码
  resetPassword: (data: { newPassword: string }): Promise<ApiResponse<null>> => {
    return client.post(API_ENDPOINTS.auth.resetPassword, data);
  },

  // 通过验证码重置密码（忘记密码）
  resetPasswordByCode: (data: { accountType: number; accountValue: string; code: string; newPassword: string }): Promise<ApiResponse<null>> => {
    return client.post(API_ENDPOINTS.auth.resetPasswordByCode, data);
  },

  // 验证账号是否属于当前用户
  verifyAccount: (data: { accountType: number; accountValue: string }): Promise<ApiResponse<null>> => {
    return client.post(API_ENDPOINTS.auth.verifyAccount, data);
  },

  // 验证验证码是否正确
  verifyCode: (data: { accountType: number; account: string; code: string }): Promise<ApiResponse<null>> => {
    return client.post(API_ENDPOINTS.auth.verifyCode, data);
  },
};
