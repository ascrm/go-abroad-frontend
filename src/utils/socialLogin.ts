/**
 * 第三方登录工具
 * 目前仅支持 Google 登录，其他平台显示提示信息
 */
import { Platform } from 'react-native';
import { openAuthSessionAsync } from 'expo-web-browser';

// Google OAuth Client ID
const GOOGLE_CLIENT_ID = '1011160250394-mmrdvncjll6gtquan5osc2l42tiphddk.apps.googleusercontent.com';
const GOOGLE_CLIENT_ID_IOS = '1011160250394-asqjvtnanpgvcaanv3ncv8kib0fl0vbi.apps.googleusercontent.com';

/**
 * 社交登录类型
 */
export enum SocialType {
  Wechat = 1,
  QQ = 2,
  Google = 3,
  Apple = 4,
}

/**
 * 社交登录返回结果
 */
export interface SocialLoginResult {
  code?: string;
  openid?: string;
  unionid?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  nickname?: string;
  avatar?: string;
  gender?: 0 | 1 | 2;
  error?: string;
}

/**
 * 微信 登录（暂不支持）
 */
export const WechatLogin = async (): Promise<SocialLoginResult> => {
    return { error: '微信 登录暂不支持开通' };
};


/**
 * QQ 登录（暂不支持）
 */
export const qqLogin = async (): Promise<SocialLoginResult> => {
  return { error: 'QQ 登录暂不支持开通' };
};

/**
 * Apple 登录（暂不支持）
 */
export const appleLogin = async (): Promise<SocialLoginResult> => {
  return { error: 'Apple 登录暂不支持' };
};

/**
 * Google 登录
 */
export const googleLogin = async (): Promise<SocialLoginResult> => {
  try {
    const clientId = Platform.OS === 'ios' ? GOOGLE_CLIENT_ID_IOS : GOOGLE_CLIENT_ID;
    const redirectUri = "com.googleusercontent.apps.1011160250394-asqjvtnanpgvcaanv3ncv8kib0fl0vbi:/oauthredirect";

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent('openid profile email')}&` +
      `access_type=offline&` +
      `prompt=select_account`;

    const result = await openAuthSessionAsync(authUrl, redirectUri);

    if (result.type === 'success') {
      const urlObj = new URL(result.url);
      const code = urlObj.searchParams.get('code');

      if (code) {
        return { code };
      }
      return { error: 'Google 授权失败：未获取到 code' };
    } else {
      return { error: 'Google 登录取消' };
    }

  } catch (error: any) {
    console.error('Google 登录错误:', error);
    return { error: error.message || 'Google 登录失败' };
  }
};
