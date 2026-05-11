import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
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
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useResetPasswordStore } from "../../src/stores/resetPasswordStore";

const CODE_LENGTH = 6;

function CodeBox({
  char,
  isActive,
  onPress,
}: {
  char: string;
  isActive: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.92, { damping: 15 });
    setTimeout(() => { scale.value = withSpring(1, { damping: 15 }); }, 100);
    onPress();
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={[styles.codeBox, isActive && styles.codeBoxActive, char && styles.codeBoxFilled, animatedStyle]}
      >
        {char ? (
          <Text style={styles.codeChar}>{char}</Text>
        ) : isActive ? (
          <View style={styles.cursor} />
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

export default function ResetPasswordCodeScreen() {
  const [code, setCode] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const { account, accountType, setCode: setCodeStore } = useResetPasswordStore();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCodeChange = (text: string) => {
    const numericText = text.replace(/\D/g, "").slice(0, CODE_LENGTH);
    setCode(numericText);
  };

  const handleResend = () => {
    if (countdown > 0) return;
    setCountdown(60);
    Alert.alert("提示", accountType === 2 ? "验证码已发送到邮箱" : "验证码已发送到手机");
  };

  const handleNext = () => {
    if (code.length !== CODE_LENGTH) { Alert.alert("提示", "请输入完整的6位验证码"); return; }
    setCodeStore(code);
    router.push("/(profile)/reset-password-new");
  };

  const handleBoxPress = () => { inputRef.current?.focus(); };

  const isComplete = code.length === CODE_LENGTH;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
        <View style={styles.progressContainer}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.progressDot, i === 1 ? styles.progressDotActive : styles.progressDotInactive]} />
          ))}
        </View>

        <Animated.View entering={FadeInDown.duration(500).springify()} style={styles.titleSection}>
          <Text style={styles.title}>输入验证码</Text>
          <Text style={styles.subtitle}>验证码已发送至 {accountType === 2 ? "邮箱" : "手机"}</Text>
          <Text style={styles.devHint}>开发环境：验证码见控制台</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(500).delay(100).springify()} style={styles.codeSection}>
          <Pressable onPress={handleBoxPress}>
            <View style={styles.codeRow}>
              {Array.from({ length: CODE_LENGTH }).map((_, i) => (
                <CodeBox key={i} char={code[i] || ""} isActive={isFocused && i === code.length} onPress={handleBoxPress} />
              ))}
            </View>
          </Pressable>
          <TextInput ref={inputRef} style={styles.hiddenInput} value={code} onChangeText={handleCodeChange}
            keyboardType="number-pad" maxLength={CODE_LENGTH} autoFocus onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} />
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(500).delay(200).springify()} style={styles.resendSection}>
          <Text style={styles.resendText}>没有收到验证码？</Text>
          <TouchableOpacity onPress={handleResend} disabled={countdown > 0} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[styles.resendLink, countdown > 0 && styles.resendLinkDisabled]}>
              {countdown > 0 ? `${countdown}s 后重发` : "重新发送"}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(500).delay(300).springify()} style={styles.buttonSection}>
          <TouchableOpacity style={[styles.primaryButton, !isComplete && styles.primaryButtonDisabled]} activeOpacity={0.8} onPress={handleNext} disabled={!isComplete}>
            <Text style={[styles.primaryButtonText, !isComplete && styles.primaryButtonTextDisabled]}>下一步</Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  keyboardView: { flex: 1, paddingHorizontal: 24 },
  progressContainer: { flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 12, marginBottom: 40 },
  progressDot: { height: 3, borderRadius: 1.5 },
  progressDotActive: { width: 28, backgroundColor: "#000000" },
  progressDotInactive: { width: 6, backgroundColor: "#D1D5DB" },
  titleSection: { marginTop: 16, marginBottom: 48 },
  title: { fontSize: 36, fontWeight: "800", color: "#000000", letterSpacing: -1 },
  subtitle: { fontSize: 15, color: "#6B7280", marginTop: 10 },
  devHint: { fontSize: 12, color: "#9CA3AF", marginTop: 6 },
  codeSection: { alignItems: "center", marginBottom: 32 },
  codeRow: { flexDirection: "row", gap: 10 },
  codeBox: {
    width: 46, height: 56, borderRadius: 10, backgroundColor: "#FFFFFF",
    borderWidth: 1.5, borderColor: "#E5E7EB", alignItems: "center", justifyContent: "center",
  },
  codeBoxActive: { borderColor: "#000000", backgroundColor: "#F9FAFB" },
  codeBoxFilled: { borderColor: "#000000" },
  codeChar: { fontSize: 26, fontWeight: "700", color: "#000000" },
  cursor: { width: 2, height: 24, backgroundColor: "#000000", borderRadius: 1 },
  hiddenInput: { position: "absolute", opacity: 0, width: 1, height: 1 },
  resendSection: { flexDirection: "row", justifyContent: "center", gap: 4, marginBottom: 32 },
  resendText: { fontSize: 14, color: "#9CA3AF" },
  resendLink: { fontSize: 14, color: "#000000", fontWeight: "600" },
  resendLinkDisabled: { color: "#D1D5DB" },
  buttonSection: { paddingBottom: 16 },
  primaryButton: { backgroundColor: "#000000", borderRadius: 14, paddingVertical: 17, alignItems: "center" },
  primaryButtonDisabled: { backgroundColor: "#D1D5DB" },
  primaryButtonText: { color: "#FFFFFF", fontSize: 17, fontWeight: "600" },
  primaryButtonTextDisabled: { color: "#FFFFFF" },
});
