import { Image } from "expo-image";
import { router } from "expo-router";
import { LucideIcon, Mail } from "lucide-react-native";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/src/stores/authStore";
import { SocialLoginResult, SocialType, appleLogin, googleLogin } from "@/src/utils/socialLogin";

// 通用的社交登录处理函数
const handleSocialLogin = async (
  loginFn: () => Promise<SocialLoginResult>,
  socialType: SocialType
) => {
    console.log("你无敌了");
  const { socialLogin } = useAuthStore.getState();

  try {
    const result = await loginFn();

    if (result.error) {
      Alert.alert("登录失败", result.error);
      return;
    }

    // 调用后端第三方登录接口（只需传递 socialType 和 code）
    console.log("你无敌了+++++++++++：", result);
    await socialLogin({
      socialType,
      code: result.code || '',
    });

    router.replace("/(tabs)/home");
  } catch (error: any) {
    Alert.alert("登录失败", error.message || "登录失败，请重试");
  }
};

// QQ 登录处理（iOS 端暂不支持，显示提示）
const handleQQLogin = () => {
  Alert.alert(
    'iOS QQ 登录暂不支持',
    '开通条件（满足任意一项）：\n1. iOS 开发者账号（$99/年）\n2. Mac 电脑',
    [{ text: '知道了' }]
  );
};

// Google 登录处理
const handleGoogleLogin = () => handleSocialLogin(googleLogin, SocialType.Google);

// Apple 登录处理
const handleAppleLogin = () => handleSocialLogin(appleLogin, SocialType.Apple);

// 登录方式数据
const loginMethods: {
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
    title: "邮箱 / 手机号 / 用户名",
    iconType: "lucide",
    icon: Mail,
    iconColor: "#0076D6",
    onPress: () => router.push("/(auth)/login-form"),
  },
  {
    id: "qq",
    title: "QQ登录",
    iconType: "simple",
    iconName: "QQ",
    iconColor: "#12B7F5",
    onPress: handleQQLogin,
  },
  {
    id: "google",
    title: "Google登录",
    iconType: "simple",
    iconName: "Google",
    iconColor: "#EA4335",
    onPress: handleGoogleLogin,
  },
  {
    id: "apple",
    title: "Apple登录",
    iconType: "simple",
    iconName: "Apple",
    iconColor: "#000000",
    onPress: handleAppleLogin,
  },
];

export default function LoginScreen() {
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
          <Text className="text-3xl font-bold text-gray-900 text-center">登录</Text>
        </View>

        {/* 登录方式列表 */}
        <View className="flex-col gap-4">
          {loginMethods.map((method) => (
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

        {/* 注册提示 */}
        <View className="mt-8 items-center">
          <Text className="text-gray-500 text-sm">尚未拥有账号？</Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
            <Text className="text-blue-500 text-sm font-medium mt-1">注册</Text>
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
