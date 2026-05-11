import { router } from "expo-router";
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
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useResetPasswordStore } from "../../src/stores/resetPasswordStore";

export default function ResetPasswordAccountScreen() {
  const [inputValue, setInputValue] = useState("");
  const { setAccount } = useResetPasswordStore();

  const isEmail = inputValue.includes("@");
  const isValid = inputValue.length >= 5;

  const handleNext = () => {
    if (!inputValue.trim()) {
      Alert.alert("提示", "请输入手机号或邮箱");
      return;
    }
    const accountType = isEmail ? 2 : 1;
    setAccount(inputValue, accountType);
    router.push("/(profile)/reset-password-code");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
        <View style={styles.progressContainer}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.progressDot, i === 0 ? styles.progressDotActive : styles.progressDotInactive]} />
          ))}
        </View>

        <Animated.View entering={FadeInDown.duration(500).springify()} style={styles.titleSection}>
          <Text style={styles.title}>输入手机号/邮箱</Text>
          <Text style={styles.subtitle}>请输入您注册时使用的手机号或邮箱</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(500).delay(100).springify()} style={styles.inputSection}>
          <View style={[styles.inputCard, isValid && styles.inputCardActive]}>
            <TextInput
              style={styles.textInput}
              placeholder="手机号或邮箱"
              placeholderTextColor="#9CA3AF"
              value={inputValue}
              onChangeText={setInputValue}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType={isEmail ? "email-address" : "phone-pad"}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(500).delay(200).springify()} style={styles.buttonSection}>
          <TouchableOpacity
            style={[styles.primaryButton, !isValid && styles.primaryButtonDisabled]}
            activeOpacity={0.8}
            onPress={handleNext}
            disabled={!isValid}
          >
            <Text style={[styles.primaryButtonText, !isValid && styles.primaryButtonTextDisabled]}>下一步</Text>
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
  inputSection: { flex: 1 },
  inputCard: { backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.5, borderColor: "#E5E7EB" },
  inputCardActive: { borderColor: "#000000" },
  textInput: { fontSize: 17, color: "#111827", paddingHorizontal: 16, paddingVertical: 16 },
  buttonSection: { paddingBottom: 16 },
  primaryButton: { backgroundColor: "#000000", borderRadius: 14, paddingVertical: 17, alignItems: "center" },
  primaryButtonDisabled: { backgroundColor: "#D1D5DB" },
  primaryButtonText: { color: "#FFFFFF", fontSize: 17, fontWeight: "600" },
  primaryButtonTextDisabled: { color: "#FFFFFF" },
});
