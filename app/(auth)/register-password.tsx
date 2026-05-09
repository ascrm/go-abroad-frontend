import { router } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
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

const PASSWORD_MIN = 6;
const PASSWORD_MAX = 20;

function PasswordStrengthMeter({ password }: { password: string }) {
  const getStrength = () => {
    if (!password) return { level: 0, label: "", color: "" };
    let score = 0;
    if (password.length >= PASSWORD_MIN) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;
    if (score <= 1) return { level: 1, label: "太弱", color: "#EF4444" };
    if (score <= 2) return { level: 2, label: "较弱", color: "#F59E0B" };
    if (score <= 3) return { level: 3, label: "良好", color: "#6B7280" };
    return { level: 4, label: "很强", color: "#000000" };
  };

  const s = getStrength();
  const labels = ["", "太弱", "较弱", "良好", "很强"];
  const colors = ["", "#EF4444", "#F59E0B", "#6B7280", "#000000"];

  return (
    <View style={styles.strengthSection}>
      <View style={styles.strengthBars}>
        {[1, 2, 3, 4].map((level) => (
          <View key={level} style={[styles.strengthBar, level <= s.level && { backgroundColor: colors[s.level] }]} />
        ))}
      </View>
      <Text style={[styles.strengthLabel, { color: colors[s.level] }]}>{labels[s.level]}</Text>
    </View>
  );
}

export default function RegisterPasswordScreen() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { setPassword: setPasswordStore } = useRegisterFlowStore();

  const isValid = password.length >= PASSWORD_MIN && password.length <= PASSWORD_MAX && password === confirmPassword;

  const handleNext = () => {
    if (!password.trim()) { Alert.alert("提示", "请输入密码"); return; }
    if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) { Alert.alert("提示", `密码长度为${PASSWORD_MIN}-${PASSWORD_MAX}位`); return; }
    if (password !== confirmPassword) { Alert.alert("提示", "两次输入的密码不一致"); return; }
    setPasswordStore(password);
    router.push("/(auth)/register-avatar");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
        <View style={styles.progressContainer}>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <View key={i} style={[styles.progressDot, i === 3 ? styles.progressDotActive : styles.progressDotInactive]} />
          ))}
        </View>

        <Animated.View entering={FadeInDown.duration(500).springify()} style={styles.titleSection}>
          <Text style={styles.title}>创建密码</Text>
          <Text style={styles.subtitle}>密码至少{PASSWORD_MIN}位，可包含字母、数字和特殊字符</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(500).delay(100).springify()} style={styles.inputSection}>
          <View style={[styles.inputCard, password.length >= PASSWORD_MIN && styles.inputCardActive]}>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>密码</Text>
              <TextInput style={styles.textInput} placeholder="输入密码" placeholderTextColor="#9CA3AF"
                value={password} onChangeText={setPassword} secureTextEntry={!showPassword}
                autoCapitalize="none" autoCorrect={false} maxLength={PASSWORD_MAX} />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                {showPassword ? <EyeOff size={18} color="#9CA3AF" /> : <Eye size={18} color="#9CA3AF" />}
              </TouchableOpacity>
            </View>
          </View>

          {password.length > 0 && <PasswordStrengthMeter password={password} />}

          <View style={[styles.inputCard, confirmPassword.length > 0 && password === confirmPassword ? styles.inputCardActive : confirmPassword.length > 0 ? styles.inputCardError : {}]}>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>确认</Text>
              <TextInput style={styles.textInput} placeholder="再次输入密码" placeholderTextColor="#9CA3AF"
                value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirm}
                autoCapitalize="none" autoCorrect={false} maxLength={PASSWORD_MAX} />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                {showConfirm ? <EyeOff size={18} color="#9CA3AF" /> : <Eye size={18} color="#9CA3AF" />}
              </TouchableOpacity>
            </View>
          </View>

          {confirmPassword.length > 0 && (
            <Text style={[styles.matchHint, password === confirmPassword ? styles.matchOk : styles.matchError]}>
              {password === confirmPassword ? "✓ 密码一致" : "✗ 密码不一致"}
            </Text>
          )}
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
  inputSection: { flex: 1, gap: 12 },
  inputCard: { backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.5, borderColor: "#E5E7EB" },
  inputCardActive: { borderColor: "#000000" },
  inputCardError: { borderColor: "#EF4444" },
  inputRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  inputLabel: { fontSize: 14, fontWeight: "600", color: "#9CA3AF", width: 32 },
  textInput: { flex: 1, fontSize: 17, color: "#111827", paddingVertical: 0 },
  strengthSection: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 2 },
  strengthBars: { flex: 1, flexDirection: "row", gap: 4 },
  strengthBar: { flex: 1, height: 3, borderRadius: 1.5, backgroundColor: "#E5E7EB" },
  strengthLabel: { fontSize: 13, fontWeight: "600", width: 40, textAlign: "right" },
  matchHint: { fontSize: 13, fontWeight: "500", marginTop: 2 },
  matchOk: { color: "#000000" },
  matchError: { color: "#EF4444" },
  buttonSection: { paddingBottom: 16 },
  primaryButton: { backgroundColor: "#000000", borderRadius: 14, paddingVertical: 17, alignItems: "center", shadowColor: "#000000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4 },
  primaryButtonDisabled: { backgroundColor: "#D1D5DB" },
  primaryButtonText: { color: "#FFFFFF", fontSize: 17, fontWeight: "600" },
  primaryButtonTextDisabled: { color: "#FFFFFF" },
});
