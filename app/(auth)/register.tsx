import { useAuthStore } from "@/src/stores/authStore";
import { googleLogin, SocialLoginResult, SocialType } from "@/src/utils/socialLogin";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ArrowLeft, Mail } from "lucide-react-native";
import { useRef } from "react";
import { Alert, Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 通用社交登录处理函数
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
  Alert.alert("iOS QQ 注册暂不支持", "实现条件（满足任意一项）：\n1. iOS 开发者账号（$99/年）\n2. Mac 电脑");
};

// 微信注册处理（需要企业资质）
const handleWechatRegister = () => {
  Alert.alert("微信注册暂不支持", "需要拥有企业资质，个人开发者无法实现");
};

// Google 注册处理
const handleGoogleRegister = () => handleSocialLogin(googleLogin, SocialType.Google);

// Apple 注册处理（需要 iOS 开发者账号）
const handleAppleRegister = () => {
  Alert.alert("Apple 注册暂不支持", "需要注册 iOS 个人开发者账号（$99/年）");
};

// 注册方式数据
const registerMethods: {
  id: string;
  title: string;
  isPrimary?: boolean;
  iconType: "lucide" | "simple";
  icon?: any;
  iconName?: string;
  iconColor: string;
  onPress: () => void;
}[] = [
  {
    id: "email",
    title: "邮箱 / 手机号注册",
    isPrimary: true,
    iconType: "lucide",
    icon: Mail,
    iconColor: "#FFFFFF",
    onPress: () => router.push("/(auth)/register-account"),
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
  label: string;
  onPress: () => void;
}[] = [
  {
    id: "qq",
    iconName: "QQ",
    iconColor: "#12B7F5",
    label: "QQ",
    onPress: handleQQRegister,
  },
  {
    id: "wechat",
    iconName: "Wechat",
    iconColor: "#07C160",
    label: "微信",
    onPress: handleWechatRegister,
  },
];

// 可复用按钮组件
function RegisterButton({
  method,
}: {
  method: typeof registerMethods[number];
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        className={`flex-row items-center py-4 px-4 rounded-2xl mb-3 ${
          method.isPrimary
            ? "bg-primary-500 shadow-lg"
            : "bg-white border border-gray-100"
        }`}
        onPress={method.onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* 图标 */}
        <View
          className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
            method.isPrimary ? "bg-white/20" : "bg-gray-50"
          }`}
        >
          {method.iconType === "simple" ? (
            <Image
              source={{
                uri: `https://cdn.simpleicons.org/${method.iconName}/${method.iconColor.replace("#", "")}`,
              }}
              style={{ width: 24, height: 24 }}
              contentFit="contain"
            />
          ) : method.id === "email" ? (
            <Mail size={24} color={method.isPrimary ? "#FFFFFF" : method.iconColor} />
          ) : null}
        </View>
        {/* 标题 */}
        <Text
          className={`flex-1 text-base font-medium ${
            method.isPrimary ? "text-white" : "text-gray-800"
          }`}
        >
          {method.title}
        </Text>
        {/* 右侧箭头 */}
        <Text className={method.isPrimary ? "text-white/70" : "text-gray-400"}>→</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// 其他注册方式图标按钮
function SocialIconButton({
  method,
}: {
  method: typeof otherRegisterMethods[number];
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-sm"
        onPress={method.onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        accessibilityLabel={`${method.label}注册`}
        accessibilityRole="button"
      >
        <Image
          source={{
            uri: `https://cdn.simpleicons.org/${method.iconName}/${method.iconColor.replace("#", "")}`,
          }}
          style={{ width: 28, height: 28 }}
          contentFit="contain"
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function RegisterScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* 顶部返回 */}
      <View className="px-6 pt-4">
        <TouchableOpacity
          className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm"
          onPress={() => router.back()}
          accessibilityLabel="返回"
          accessibilityRole="button"
        >
          <ArrowLeft size={20} color="#4B5563" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View className="items-center mb-8">
          <Image
            source={require("@/assets/images/logo.png")}
            style={{ width: 64, height: 64 }}
            contentFit="contain"
          />
        </View>

        {/* 标题 */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900 text-center">注册</Text>
          <Text className="text-gray-500 text-center mt-2">
            创建您的账户，开始出国规划之旅
          </Text>
        </View>

        {/* 注册方式列表 */}
        <View className="flex-col gap-3">
          {registerMethods.map((method) => (
            <RegisterButton key={method.id} method={method} />
          ))}
        </View>

        {/* 分隔线 */}
        <View className="flex-row items-center my-6">
          <View className="flex-1 h-px bg-gray-200" />
          <Text className="px-4 text-gray-400 text-sm">其他注册方式</Text>
          <View className="flex-1 h-px bg-gray-200" />
        </View>

        {/* 其他注册方式（仅图标） */}
        <View className="flex-row justify-center gap-6">
          {otherRegisterMethods.map((method) => (
            <SocialIconButton key={method.id} method={method} />
          ))}
        </View>

        {/* 登录提示 */}
        <View className="flex-1 justify-end items-center pb-8 mt-8">
          <Text className="text-gray-500 text-sm">已拥有账号？</Text>
          <TouchableOpacity
            className="mt-1"
            onPress={() => router.push("/(auth)/login")}
            accessibilityLabel="前往登录"
            accessibilityRole="button"
          >
            <Text className="text-blue-500 text-sm font-medium">登录</Text>
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
    paddingTop: 12,
    paddingBottom: 40,
  },
});