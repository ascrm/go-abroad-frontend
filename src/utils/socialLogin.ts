/**
 * 第三方登录工具
 * 需要在各平台开放平台注册应用获取 AppID
 */
import { Platform } from 'react-native';

// ==================== 配置区域 ====================
// 替换为你的 QQ AppID
const QQ_APP_ID = '102877434';
// Google OAuth Client ID (Android)
const GOOGLE_CLIENT_ID = '1011160250394-mmrdvncjll6gtquan5osc2l42tiphddk.apps.googleusercontent.com';
// Google OAuth Client ID (iOS)
const GOOGLE_CLIENT_ID_IOS = '1011160250394-asqjvtnanpgvcaanv3ncv8kib0fl0vbi.apps.googleusercontent.com';
// ==================== 配置结束 ====================

/**
 * 社交登录类型
 */
export enum SocialType {
  QQ = 2,
  Google = 3,
  Apple = 4,
  Douyin = 5,
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

// ==================== QQ 登录 ====================

/**
 * QQ 登录
 * - Android: 调用原生 QQ SDK 登录
 * - iOS: 显示提示（需 iOS 开发者账号或 Mac 电脑）
 */
export const qqLogin = async (): Promise<SocialLoginResult> => {
  // iOS 端提示
  if (Platform.OS === 'ios') {
    return {
      error: 'iOS QQ 登录暂不支持开通\n\n开通条件（满足任意一项）：\n1. iOS 开发者账号（$99/年）\n2. Mac 电脑',
    };
  }

  // Android 端原生 QQ 登录
  try {
    let QQ;
    try {
      QQ = require('react-native-qq').default;
    } catch (loadError) {
      console.error('加载 QQ 模块失败:', loadError);
      return { error: 'QQ 登录模块加载失败，请在真机上运行' };
    }

    if (!QQ) {
      return { error: 'QQ 登录不可用，请在真机上运行' };
    }

    return new Promise((resolve) => {
      QQ.login()
        .then((result: any) => {
          if (result.openid) {
            resolve({
              openid: result.openid,
              accessToken: result.accessToken,
              nickname: result.nickname,
              avatar: result.figureurl_qq_2 || result.figureurl_qq_1,
              gender: result.gender === '男' ? 1 : result.gender === '女' ? 2 : 0,
            });
          } else if (result.code) {
            resolve({ code: result.code });
          } else {
            resolve({ error: 'QQ 登录失败' });
          }
        })
        .catch((error: any) => {
          resolve({ error: error.message || 'QQ 登录失败' });
        });
    });
  } catch (error: any) {
    console.error('QQ 登录错误:', error);
    return { error: error.message || 'QQ 登录失败，请在真机上运行' };
  }
};

// ==================== Google 登录 ====================

/**
 * Google 登录
 */
export const googleLogin = async (): Promise<SocialLoginResult> => {
  try {
    const { makeRedirectUri, useAuthRequest } = require('expo-auth-session');
    const { discovery } = require('expo-auth-session');

    // 动态创建 auth request（不能在 hook 外部使用 useAuthRequest）
    // 这里使用手动构建的方式
    const clientId = Platform.OS === 'ios' ? GOOGLE_CLIENT_ID_IOS : GOOGLE_CLIENT_ID;
    const redirectUri = "com.googleusercontent.apps.1011160250394-asqjvtnanpgvcaanv3ncv8kib0fl0vbi:/oauthredirect";

    // 使用 expo-auth-session 的发现配置
    const discoveryConfig = discovery;

    // 构建授权 URL
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent('openid profile email')}&` +
      `access_type=offline&` +
      `prompt=select_account`; // 加上这一行

    // 使用 expo-web-browser 打开授权页面
    const { type, url } = await require('expo-web-browser').openAuthSessionAsync(
      authUrl,
      redirectUri
    );

    if (type === 'success') {
      // 解析返回的 URL 获取 code
      const urlObj = new URL(url);
      const code = urlObj.searchParams.get('code');

      if (code) {
        // 注意：实际项目中应该将 code 发送给后端，由后端换取 accessToken
        // 这里返回 code，前端不应该直接换取 accessToken（存在安全风险）
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

// ==================== Apple 登录 ====================

/**
 * Apple 登录
 */
export const appleLogin = async (): Promise<SocialLoginResult> => {
  try {
    const AppleAuthentication = require('expo-apple-authentication');

    const isAvailable = await AppleAuthentication.isAvailableAsync();
    if (!isAvailable) {
      return { error: 'Apple 登录不可用' };
    }

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    // Apple 只返回一次 fullName 和 email，后续登录不再返回
    // 需要将 user 存储起来，后续通过 user 来关联
    return {
      openid: credential.user,
      accessToken: credential.identityToken,
      nickname: credential.fullName?.givenName
        ? `${credential.fullName.givenName}${credential.fullName.familyName || ''}`
        : undefined,
      // Apple 不提供性别信息
      gender: 0,
    };

  } catch (error: any) {
    if (error.code === 'ERR_CANCELED') {
      return { error: 'Apple 登录取消' };
    }
    console.error('Apple 登录错误:', error);
    return { error: error.message || 'Apple 登录失败' };
  }
};

/**
 * 检查 Apple 登录是否可用
 */
export const isAppleLoginAvailable = async (): Promise<boolean> => {
  try {
    const AppleAuthentication = require('expo-apple-authentication');
    return await AppleAuthentication.isAvailableAsync();
  } catch {
    return false;
  }
};
