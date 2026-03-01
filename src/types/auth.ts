// 用户信息
export interface User {
  userId: number;
  username: string;
  nickname: string;
  avatar?: string;
  gender: 0 | 1 | 2; // 0-未知, 1-男, 2-女
}

// 登录请求参数
export interface LoginParams {
  account: string;
  password: string;
}

// 注册请求参数
export interface RegisterParams {
  account: string;
  password: string;
  code: string; // 验证码
  accountType?: 2 | 3; // 2-邮箱，3-手机号
}

// 发送验证码请求参数
export interface SendCodeParams {
  accountType: 2 | 3; // 2-邮箱，3-手机号
  account: string;
  codeType: 1 | 2 | 3; // 1-注册，2-登录，3-找回密码
}

// 发送验证码响应数据
export interface SendCodeResponseData {
  codeId: string;
  code: string; // 开发环境返回
  expiresIn: number;
  target: string; // 账号掩码
}

// 第三方登录请求参数
export interface SocialLoginParams {
  socialType: 1 | 2 | 3 | 4 | 5; // 1-微信, 2-QQ, 3-Google, 4-Apple, 5-抖音
  openid: string;
  unionid?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  nickname?: string;
  avatar?: string;
  gender?: 0 | 1 | 2;
}

// 登录响应数据
export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

// API 响应类型
export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}
