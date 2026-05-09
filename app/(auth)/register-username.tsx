import { router } from "expo-router";
import { User } from "lucide-react-native";
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
import { useRegisterFlowStore } from "../../src/stores/registerFlowStore";

export default function RegisterUsernameScreen() {
  const [username, setUsername] = useState("");
  const [isValid, setIsValid] = useState(false);

  const { setUsername: setUsernameStore } = useRegisterFlowStore();

  const validateUsername = (text: string): boolean => {
    const trimmed = text.trim();
    if (trimmed.length < 2 || trimmed.length > 20) return false;
    const usernameRegex = /^[\w一-龥]+$/;
    return usernameRegex.test(trimmed);
  };

  const handleTextChange = (text: string) => {
    setUsername(text);
    setIsValid(validateUsername(text));
  };

  const handleNext = () => {
    const trimmed = username.trim();
    if (!trimmed) { Alert.alert("提示", "请输入用户名"); return; }
    if (!validateUsername(trimmed)) { Alert.alert("提示", "用户名长度为2-20位"); return; }
    setUsernameStore(trimmed);
    router.push("/(auth)/register-password");
  };

  const charCount = username.trim().length;
  const isTooShort = charCount > 0 && charCount < 2;
  const isTooLong = charCount > 20;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
        <View style={styles.progressContainer}>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <View key={i} style={[styles.progressDot, i === 2 ? styles.progressDotActive : styles.progressDotInactive]} />
          ))}
        </View>

        <Animated.View entering={FadeInDown.duration(500).springify()} style={styles.titleSection}>
          <Text style={styles.title}>设置用户名</Text>
          <Text style={styles.subtitle}>这是你在社区中显示的名称</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(500).delay(100).springify()} style={styles.inputSection}>
          <View style={[styles.inputCard, isValid && styles.inputCardActive]}>
            <View style={styles.inputRow}>
              <View style={[styles.inputIcon, isValid && styles.inputIconActive]}>
                <User size={20} color={isValid ? "#000000" : "#9CA3AF"} />
              </View>
              <TextInput
                style={styles.input} placeholder="用户名 (2-20位)" placeholderTextColor="#9CA3AF"
                value={username} onChangeText={handleTextChange} autoCapitalize="none" autoCorrect={false} maxLength={20}
              />
              {charCount > 0 && (
                <View style={[styles.charBadge, (isTooShort || isTooLong) ? styles.charBadgeError : styles.charBadgeOk]}>
                  <Text style={[styles.charCount, (isTooShort || isTooLong) ? styles.charCountError : styles.charCountOk]}>
                    {charCount}/20
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.hintSection}>
            <Text style={styles.hintTitle}>支持格式</Text>
            <View style={styles.hintTags}>
              {[
                { label: "字母", ok: /[a-zA-Z]/.test(username) },
                { label: "数字", ok: /\d/.test(username) },
                { label: "中文", ok: /[一-龥]/.test(username) },
                { label: "下划线", ok: username.includes("_") },
              ].map(({ label, ok }) => (
                <View key={label} style={[styles.hintTag, ok && styles.hintTagActive]}>
                  <Text style={[styles.hintTagText, ok && styles.hintTagTextActive]}>{label}</Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(500).delay(200).springify()} style={styles.buttonSection}>
          <TouchableOpacity style={[styles.primaryButton, !isValid && styles.primaryButtonDisabled]} activeOpacity={0.8} onPress={handleNext} disabled={!isValid}>
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
  inputRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14 },
  inputIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center", marginRight: 12 },
  inputIconActive: { backgroundColor: "#F9FAFB" },
  input: { flex: 1, fontSize: 17, color: "#111827", paddingVertical: 0 },
  charBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  charBadgeOk: { backgroundColor: "#F9FAFB" },
  charBadgeError: { backgroundColor: "#F9FAFB" },
  charCount: { fontSize: 12, fontWeight: "500" },
  charCountOk: { color: "#000000" },
  charCountError: { color: "#EF4444" },
  hintSection: { marginTop: 20 },
  hintTitle: { fontSize: 13, color: "#9CA3AF", marginBottom: 10 },
  hintTags: { flexDirection: "row", gap: 8 },
  hintTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: "#F3F4F6" },
  hintTagActive: { backgroundColor: "#000000" },
  hintTagText: { fontSize: 13, color: "#9CA3AF" },
  hintTagTextActive: { color: "#FFFFFF", fontWeight: "600" },
  buttonSection: { paddingBottom: 16 },
  primaryButton: { backgroundColor: "#000000", borderRadius: 14, paddingVertical: 17, alignItems: "center", shadowColor: "#000000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4 },
  primaryButtonDisabled: { backgroundColor: "#D1D5DB" },
  primaryButtonText: { color: "#FFFFFF", fontSize: 17, fontWeight: "600" },
  primaryButtonTextDisabled: { color: "#FFFFFF" },
});
