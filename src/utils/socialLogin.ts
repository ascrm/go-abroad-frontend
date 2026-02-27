/**
 * 第三方登录工具
 * 需要在各平台开放平台注册应用获取 AppID
 */

// ==================== 配置区域 ====================
// 替换为你的微信 AppID
const WECHAT_APP_ID = 'YOUR_WECHAT_APP_ID';
// 替换为你的 QQ AppID
const QQ_APP_ID = 'YOUR_QQ_APP_ID';
// 替换为你的 Google OAuth Client ID
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';
// ==================== 配置结束 ====================

/**
 * 社交登录类型
 */
export enum SocialType {
  Wechat = 1,
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

// ==================== 微信登录 ====================

/**
 * 微信登录
 */
export const wechatLogin = async (): Promise<SocialLoginResult> => {
  try {
    const Wechat = require('react-native-wechat-lib').default;

    const isInstalled = await Wechat.isInstalled();
    if (!isInstalled) {
      return { error: '请先安装微信' };
    }

    const scope = 'snsapi_userinfo';
    const state = 'wechat_state';

    const authResult = await Wechat.sendAuthRequest(scope, state);

    if (authResult.errCode !== 0) {
      return { error: '微信授权失败' };
    }

    const { code } = authResult;
    return { code };

  } catch (error: any) {
    console.error('微信登录错误:', error);
    return { error: error.message || '微信登录失败' };
  }
};

/**
 * 初始化微信 SDK（需要在 App 启动时调用）
 */
export const initWechat = async (): Promise<boolean> => {
  try {
    const Wechat = require('react-native-wechat-lib').default;
    await Wechat.registerApp(WECHAT_APP_ID);
    return true;
  } catch (error) {
    console.error('微信初始化失败:', error);
    return false;
  }
};

// ==================== QQ 登录 ====================

/**
 * QQ 登录
 */
export const qqLogin = async (): Promise<SocialLoginResult> => {
  try {
    const QQ = require('react-native-qq').default;

    const isInstalled = QQ.isQQInstalled ? await QQ.isQQInstalled() : true;
    if (!isInstalled) {
      return { error: '请先安装 QQ' };
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
            // 部分版本返回 code，需要传给后端
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
    return { error: error.message || 'QQ 登录失败' };
  }
};

// ==================== Google 登录 ====================

/**
 * Google 登录
 */
export const googleLogin = async (): Promise<SocialLoginResult> => {
  try {
    const * as Google from 'expo-auth-session';
    const [request, response, promptAsync] = Google.useAuthRequest({
      clientId: GOOGLE_CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
    });

    if (!request) {
      return { error: 'Google 登录不可用' };
    }

    const result = await promptAsync();

    if (result.type === 'success') {
      const { access_token } = result.params;

      // 获取用户信息
      const userInfoResponse = await fetch(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );
      const userInfo = await userInfoResponse.json();

      return {
        accessToken: access_token,
        openid: userInfo.sub,
        nickname: userInfo.name,
        avatar: userInfo.picture,
        gender: 0, // Google 不提供性别信息
      };
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
    const * as AppleAuthentication from 'expo-apple-authentication';

    const isAvailable = AppleAuthentication.isAvailableAsync();
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
