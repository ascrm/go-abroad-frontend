import { router } from "expo-router";
import { Mail, Phone } from "lucide-react-native";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { authApi } from "../../src/api/auth";
import { useRegisterFlowStore } from "../../src/stores/registerFlowStore";

export default function RegisterAccountScreen() {
  const [identifier, setIdentifier] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidFormat, setIsValidFormat] = useState(false);

  const { setAccount } = useRegisterFlowStore();

  const checkAccountType = (account: string): 2 | 3 | undefined => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (emailRegex.test(account)) return 2;
    if (phoneRegex.test(account)) return 3;
    return undefined;
  };

  const handleTextChange = (text: string) => {
    setIdentifier(text);
    setIsValidFormat(
      checkAccountType(text) !== undefined && text.length > 0
    );
  };

  const handleNext = async () => {
    if (!identifier.trim()) {
      Alert.alert("提示", "请输入手机号或邮箱");
      return;
    }
    const accountType = checkAccountType(identifier.trim());
    if (!accountType) {
      Alert.alert("提示", "请输入正确的手机号或邮箱");
      return;
    }

    setIsLoading(true);
    try {
      await authApi.sendCode({
        accountType,
        account: identifier.trim(),
        codeType: 1,
      });
      setAccount(identifier.trim(), accountType);
      router.push("/(auth)/register-code");
    } catch (error: any) {
      Alert.alert("发送失败", error.message || "请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  const isEmail = identifier.includes("@");
  const hasAtSign = identifier.includes("@");

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {/* 顶部进度指示 */}
        <View style={styles.progressContainer}>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                i === 0 ? styles.progressDotActive : styles.progressDotInactive,
              ]}
            />
          ))}
        </View>

        {/* 标题区 */}
        <Animated.View
          entering={FadeInDown.duration(500).springify()}
          style={styles.titleSection}
        >
          <Text style={styles.title}>欢迎加入</Text>
          <Text style={styles.subtitle}>输入你的手机号或邮箱继续注册</Text>
        </Animated.View>

        {/* 输入区 */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(100).springify()}
          style={styles.inputSection}
        >
          {/* 账号输入卡片 */}
          <View style={[styles.inputCard, isValidFormat && styles.inputCardActive]}>
            <View style={styles.inputRow}>
              <View style={[styles.inputIcon, isValidFormat && styles.inputIconActive]}>
                {hasAtSign ? (
                  <Mail size={20} color={isValidFormat ? "#000000" : "#9CA3AF"} />
                ) : (
                  <Phone size={20} color={isValidFormat ? "#000000" : "#9CA3AF"} />
                )}
              </View>
              <TextInput
                style={styles.input}
                placeholder="手机号 / 邮箱"
                placeholderTextColor="#9CA3AF"
                value={identifier}
                onChangeText={handleTextChange}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />
            </View>
          </View>

          {/* 格式提示 */}
          <View style={styles.formatHint}>
            {identifier.length > 0 && (
              <Text
                style={[
                  styles.formatText,
                  isValidFormat ? styles.formatTextValid : styles.formatTextInvalid,
                ]}
              >
                {isEmail ? "邮箱格式" : !hasAtSign && identifier.length >= 3 && /^\d/.test(identifier) ? "手机号格式" : ""}
              </Text>
            )}
          </View>
        </Animated.View>

        {/* 按钮区 */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(200).springify()}
          style={styles.buttonSection}
        >
          <TouchableOpacity
            style={[
              styles.primaryButton,
              !isValidFormat && styles.primaryButtonDisabled,
            ]}
            activeOpacity={0.8}
            onPress={handleNext}
            disabled={!isValidFormat || isLoading}
          >
            <Text
              style={[
                styles.primaryButtonText,
                !isValidFormat && styles.primaryButtonTextDisabled,
              ]}
            >
              {isLoading ? "发送中..." : "获取验证码"}
            </Text>
          </TouchableOpacity>

          <View style={styles.loginHint}>
            <Text style={styles.loginHintText}>已有账号？</Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text style={styles.loginLink}>登录</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  keyboardView: { flex: 1, paddingHorizontal: 24 },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
    marginBottom: 40,
  },
  progressDot: { height: 3, borderRadius: 1.5 },
  progressDotActive: { width: 28, backgroundColor: "#000000" },
  progressDotInactive: { width: 6, backgroundColor: "#D1D5DB" },
  titleSection: { marginTop: 16, marginBottom: 48 },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#000000",
    letterSpacing: -1,
  },
  subtitle: { fontSize: 15, color: "#6B7280", marginTop: 10, letterSpacing: 0.2 },
  inputSection: { flex: 1 },
  inputCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  inputCardActive: {
    borderColor: "#000000",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inputIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  inputIconActive: { backgroundColor: "#F9FAFB" },
  input: { flex: 1, fontSize: 17, color: "#111827", paddingVertical: 0 },
  formatHint: { paddingHorizontal: 4, paddingTop: 10, minHeight: 20 },
  formatText: { fontSize: 13, fontWeight: "500" },
  formatTextValid: { color: "#000000" },
  formatTextInvalid: { color: "#EF4444" },
  buttonSection: { paddingBottom: 16, gap: 16 },
  primaryButton: {
    backgroundColor: "#000000",
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryButtonDisabled: { backgroundColor: "#D1D5DB" },
  primaryButtonText: { color: "#FFFFFF", fontSize: 17, fontWeight: "600", letterSpacing: 0.3 },
  primaryButtonTextDisabled: { color: "#FFFFFF" },
  loginHint: { flexDirection: "row", justifyContent: "center", gap: 4 },
  loginHintText: { fontSize: 14, color: "#9CA3AF" },
  loginLink: { fontSize: 14, color: "#000000", fontWeight: "600" },
});
