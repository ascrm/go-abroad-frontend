import { router } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authApi } from "../../src/api/auth";
import { useAuthStore } from "../../src/stores/authStore";

export default function RegisterFormScreen() {
  const [identifier, setIdentifier] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isPhoneNumber, setIsPhoneNumber] = useState(false);
  const [isEmail, setIsEmail] = useState(false);

  const { register } = useAuthStore();

  // 判断是邮箱还是手机号
  const checkAccountType = (account: string): 2 | 3 | undefined => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^1[3-9]\d{9}$/;
    
    if (emailRegex.test(account)) {
      setIsEmail(true);
      setIsPhoneNumber(false);
      return 2; // 邮箱
    } else if (phoneRegex.test(account)) {
      setIsPhoneNumber(true);
      setIsEmail(false);
      return 3; // 手机号
    }
    setIsEmail(false);
    setIsPhoneNumber(false);
    return undefined;
  };

  // 获取验证码
  const handleSendCode = async () => {
    if (!identifier.trim()) {
      Alert.alert("提示", "请先输入邮箱或手机号");
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^1[3-9]\d{9}$/;
    
    if (!emailRegex.test(identifier.trim()) && !phoneRegex.test(identifier.trim())) {
      Alert.alert("提示", "请输入正确的邮箱或手机号");
      return;
    }

    // 判断账号类型
    const accountType = checkAccountType(identifier.trim());
    if (!accountType) {
      Alert.alert("提示", "请输入正确的邮箱或手机号");
      return;
    }

    try {
      // 调用发送验证码 API
      await authApi.sendCode({
        accountType,
        account: identifier.trim(),
        codeType: 1, // 1-注册
      });

      // 请求成功：开始倒计时
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      Alert.alert("提示", accountType === 2 ? "验证码已发送到邮箱" : "验证码已发送到手机");
    } catch (error: any) {
      Alert.alert("发送失败", error.message || "请稍后重试");
    }
  };

  const handleRegister = async () => {
    // 验证输入
    if (!identifier.trim()) {
      Alert.alert("提示", "请输入邮箱或手机号");
      return;
    }

    // 邮箱或手机号注册需要验证码
    if ((isEmail || isPhoneNumber) && !verifyCode.trim()) {
      Alert.alert("提示", "请输入验证码");
      return;
    }

    if (!password.trim()) {
      Alert.alert("提示", "请输入密码");
      return;
    }

    if (password.length < 6 || password.length > 20) {
      Alert.alert("提示", "密码长度应为6-20位");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("提示", "两次输入的密码不一致");
      return;
    }

    setIsLoading(true);
    try {
      const accountType = checkAccountType(identifier.trim());
      await register(identifier.trim(), password, verifyCode, accountType);
      router.replace("/(tabs)/home");
    } catch (error: any) {
      Alert.alert("注册失败", error.message || "请检查输入信息是否正确");
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
          <Text className="text-3xl font-bold text-gray-900 text-center">注册</Text>
          <Text className="text-gray-500 mt-2 text-center">创建你的账号</Text>
        </View>

        {/* 表单 */}
        <View className="flex-col gap-6">
          {/* 账号输入 */}
          <View className="bg-white rounded-xl border border-gray-100">
            <TextInput
              className="px-4 py-4 text-gray-800 text-md"
              placeholder="邮箱 / 手机号"
              placeholderTextColor="#9CA3AF"
              value={identifier}
              onChangeText={(text) => {
                setIdentifier(text);
                checkAccountType(text);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="phone-pad"
            />
          </View>

          {/* 验证码输入 - 邮箱或手机号时显示 */}
          {(isEmail || isPhoneNumber) && (
            <View className="bg-white rounded-xl border border-gray-100 flex-row items-center">
              <TextInput
                className="flex-1 px-4 py-4 text-gray-800 text-md"
                placeholder="验证码"
                placeholderTextColor="#9CA3AF"
                value={verifyCode}
                onChangeText={setVerifyCode}
                keyboardType="number-pad"
                maxLength={6}
              />
              <TouchableOpacity
                className="px-4"
                onPress={handleSendCode}
                disabled={countdown > 0}
              >
                <Text className={`text-base font-medium ${countdown > 0 ? 'text-gray-400' : 'text-blue-500'}`}>
                  {countdown > 0 ? `${countdown}s` : '获取验证码'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 密码输入 */}
          <View className="bg-white rounded-xl border border-gray-100 flex-row items-center">
            <TextInput
              className="flex-1 px-4 py-4 text-gray-800 text-md"
              placeholder="密码 (6-20位)"
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

          {/* 确认密码输入 */}
          <View className="bg-white rounded-xl border border-gray-100 flex-row items-center">
            <TextInput
              className="flex-1 px-4 py-4 text-gray-800 text-md"
              placeholder="确认密码"
              placeholderTextColor="#9CA3AF"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              className="px-4"
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff size={20} color="#9CA3AF" />
              ) : (
                <Eye size={20} color="#9CA3AF" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* 注册按钮 */}
        <TouchableOpacity
          className={`rounded-xl py-4 mt-12 items-center ${isLoading ? "bg-gray-400" : "bg-gray-900"}`}
          activeOpacity={0.8}
          onPress={handleRegister}
          disabled={isLoading}
        >
          <Text className="text-white text-base font-medium">
            {isLoading ? "注册中..." : "注册"}
          </Text>
        </TouchableOpacity>

        {/* 登录提示 */}
        <View className="mt-8 items-center">
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
