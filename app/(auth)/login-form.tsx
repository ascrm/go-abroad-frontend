import { router } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../src/stores/authStore";

export default function LoginFormScreen() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuthStore();

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      Alert.alert("提示", "请输入账号和密码");
      return;
    }

    setIsLoading(true);
    try {
      await login(identifier.trim(), password);
      router.replace("/(tabs)/home");
    } catch (error: any) {
      Alert.alert("登录失败", error.message || "请检查账号密码是否正确");
    } finally {
      setIsLoading(false);
    }
  };

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
        keyboardShouldPersistTaps="handled"
      >
        {/* 标题 */}
        <View className="mb-10">
          <Text className="text-3xl font-bold text-gray-900 text-center">登录</Text>
          <Text className="text-gray-500 mt-2 text-center">欢迎回来</Text>
        </View>

        {/* 表单 */}
        <View className="flex-col gap-8">
          {/* 账号输入 */}
          <View className="bg-white rounded-xl border border-gray-100">
            <TextInput
              className="px-4 py-4 text-gray-800 text-md"
              placeholder="邮箱 / 手机号 / 用户名"
              placeholderTextColor="#9CA3AF"
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* 密码输入 */}
          <View className="bg-white rounded-xl border border-gray-100 flex-row items-center">
            <TextInput
              className="flex-1 px-4 py-4 text-gray-800 text-md"
              placeholder="密码"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              className="px-4"
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={20} color="#9CA3AF" />
              ) : (
                <Eye size={20} color="#9CA3AF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
                 {/* 忘记密码 */}
        <View className="flex-row justify-end mt-2">
          <TouchableOpacity onPress={() => router.push("/(profile)/reset-password-account")}>
            <Text className="text-blue-500 text-sm">忘记密码？</Text>
          </TouchableOpacity>
        </View>

        {/* 登录按钮 */}
        <TouchableOpacity
          className={`rounded-xl py-4 mt-16 items-center ${isLoading ? "bg-gray-400" : "bg-gray-900"}`}
          activeOpacity={0.8}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text className="text-white text-base font-medium">
            {isLoading ? "登录中..." : "登录"}
          </Text>
        </TouchableOpacity>
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
