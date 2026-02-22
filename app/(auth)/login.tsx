import { Image } from "expo-image";
import { router } from "expo-router";
import { LucideIcon, Mail } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
    id: "wechat",
    title: "微信登录",
    iconType: "simple",
    iconName: "WeChat",
    iconColor: "#07C160",
    onPress: () => console.log("微信登录"),
  },
  {
    id: "qq",
    title: "QQ登录",
    iconType: "simple",
    iconName: "QQ",
    iconColor: "#12B7F5",
    onPress: () => console.log("QQ登录"),
  },
  {
    id: "google",
    title: "Google登录",
    iconType: "simple",
    iconName: "Google",
    iconColor: "#EA4335",
    onPress: () => console.log("Google登录"),
  },
  {
    id: "apple",
    title: "Apple登录",
    iconType: "simple",
    iconName: "Apple",
    iconColor: "#000000",
    onPress: () => console.log("Apple登录"),
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
