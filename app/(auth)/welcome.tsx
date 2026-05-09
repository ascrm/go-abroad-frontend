import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";

export default function WelcomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* 顶部装饰 */}
      <View className="absolute top-0 right-0">
        <View className="w-40 h-40 bg-primary-100 rounded-full -mr-20 -mt-20 opacity-50" />
      </View>

      {/* 主内容区 */}
      <View className="flex-1 justify-center items-center px-8">
        {/* Logo */}
        <Image
          source={require("@/assets/images/logo.png")}
          style={{ width: 96, height: 96 }}
          contentFit="contain"
        />
        
        {/* 标题 */}
        <Text className="text-3xl font-bold text-gray-900 mb-2">Go Abroad</Text>
        <Text className="text-gray-500 text-base mb-12">开启您的出国规划之旅</Text>

        {/* 登录按钮 - 黑底白字 */}
        <TouchableOpacity
          className="w-full bg-black rounded-2xl py-4 mb-4 shadow-lg"
          onPress={() => router.push("/(auth)/login")}
          activeOpacity={0.8}
        >
          <Text className="text-white text-center font-bold text-lg">登 录</Text>
        </TouchableOpacity>

        {/* 注册按钮 - 白底黑字 */}
        <TouchableOpacity
          className="w-full bg-white rounded-2xl py-4 shadow-sm"
          onPress={() => router.push("/(auth)/register")}
          activeOpacity={0.8}
        >
          <Text className="text-black text-center font-bold text-lg">注 册</Text>
        </TouchableOpacity>
      </View>

      {/* 底部说明 */}
      <View className="pb-8 items-center">
        <Text className="text-gray-400 text-xs">
          登录即表示同意我们的
          <Text className="text-primary-500"> 服务条款</Text>
          {" "}和
          <Text className="text-primary-500"> 隐私政策</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}
