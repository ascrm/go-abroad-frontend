import { useAuthStore } from "@/src/stores/authStore";
import { googleLogin, SocialLoginResult, SocialType } from "@/src/utils/socialLogin";
import { Image } from "expo-image";
import { router } from "expo-router";
import { LucideIcon, Mail } from "lucide-react-native";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 通用的社交登录处理函数
const handleSocialLogin = async (
  loginFn: () => Promise<SocialLoginResult>,
  socialType: SocialType
) => {
  const { socialLogin } = useAuthStore.getState();

  try {
    const result = await loginFn();

    if (result.error) {
      Alert.alert("注册失败", result.error);
      return;
    }

    await socialLogin({
      socialType,
      code: result.code || '',
    });

    router.replace("/(tabs)/home");
  } catch (error: any) {
    Alert.alert("注册失败", error.message || "注册失败，请重试");
  }
};

// QQ 注册处理（iOS 端暂不支持）
const handleQQRegister = () => {
  Alert.alert(
    'iOS QQ 注册暂不支持',
    '实现条件（满足任意一项）：\n1. iOS 开发者账号（$99/年）\n2. Mac 电脑',
    [{ text: '知道了' }]
  );
};

// 微信注册处理（需要企业资质）
const handleWechatRegister = () => {
  Alert.alert(
    '微信注册暂不支持',
    '需要拥有企业资质，个人开发者无法实现',
    [{ text: '知道了' }]
  );
};

// Google 注册处理
const handleGoogleRegister = () => handleSocialLogin(googleLogin, SocialType.Google);

// Apple 注册处理（需要 iOS 开发者账号）
const handleAppleRegister = () => {
  Alert.alert(
    'Apple 注册暂不支持',
    '需要注册 iOS 个人开发者账号（$99/年）',
    [{ text: '知道了' }]
  );
};

// 注册方式数据
const registerMethods: {
  id: string;
  title: string;
  iconType: "lucide" | "simple";
  icon?: LucideIcon;
  iconName?: string;
  iconColor: string;
  onPress: () => void;
}[] = [
  {
    id: "email",
    title: "邮箱 / 手机号注册",
    iconType: "lucide",
    icon: Mail,
    iconColor: "#0076D6",
    onPress: () => router.push("/(auth)/register-form"),
  },
  {
    id: "google",
    title: "Google 注册",
    iconType: "simple",
    iconName: "Google",
    iconColor: "#EA4335",
    onPress: handleGoogleRegister,
  },
  {
    id: "apple",
    title: "Apple 注册",
    iconType: "simple",
    iconName: "Apple",
    iconColor: "#000000",
    onPress: handleAppleRegister,
  },
];

// 底部其他注册方式（仅图标）
const otherRegisterMethods: {
  id: string;
  iconName: string;
  iconColor: string;
  onPress: () => void;
}[] = [
  {
    id: "qq",
    iconName: "QQ",
    iconColor: "#12B7F5",
    onPress: handleQQRegister,
  },
  {
    id: "wechat",
    iconName: "Wechat",
    iconColor: "#07C160",
    onPress: handleWechatRegister,
  },
];

export default function RegisterScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* 顶部 */}
      <View className="px-6 pt-4">
        <TouchableOpacity
          className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm"
          onPress={() => router.back()}
        >
          <Text className="text-gray-600 text-xl">←</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 标题 */}
        <View className="mb-12">
          <Text className="text-3xl font-bold text-gray-900 text-center">注册</Text>
        </View>

        {/* 注册方式列表 */}
        <View className="flex-col gap-4">
          {registerMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              className="bg-white rounded-xl py-4 px-4 flex-row items-center border border-gray-100"
              onPress={method.onPress}
              activeOpacity={0.7}
            >
              {/* 图标 */}
              <View className="w-8 h-8 items-center justify-center mr-3">
                {method.iconType === "simple" ? (
                  <Image
                    source={{ uri: `https://cdn.simpleicons.org/${method.iconName}/${method.iconColor.replace('#', '')}` }}
                    style={{ width: 24, height: 24 }}
                    contentFit="contain"
                  />
                ) : method.id === "email" ? (
                  <Mail size={24} color={method.iconColor} />
                ) : null}
              </View>
              {/* 标题 */}
              <Text className="flex-1 text-gray-800 text-base font-medium text-center">
                {method.title}
              </Text>
              {/* 占位保持布局 */}
              <View className="w-6" />
            </TouchableOpacity>
          ))}
        </View>

        {/* 其他注册方式（仅图标） */}
        <View className="mt-10">
          <Text className="text-center text-gray-400 text-sm mb-4">其他注册方式</Text>
          <View className="flex-row justify-center gap-8">
            {otherRegisterMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                className="w-12 h-12 bg-white rounded-full items-center justify-center"
                onPress={method.onPress}
                activeOpacity={0.7}
              >
                <Image
                  source={{ uri: `https://cdn.simpleicons.org/${method.iconName}/${method.iconColor.replace('#', '')}` }}
                  style={{ width: 28, height: 28 }}
                  contentFit="contain"
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 登录提示 */}
        <View className="mt-64 items-center">
          <Text className="text-gray-500 text-sm">已拥有账号？</Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text className="text-blue-500 text-sm font-medium mt-1">登录</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
});
