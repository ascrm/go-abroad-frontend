import { router } from "expo-router";
import { Image } from "expo-image";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withSpring, FadeIn } from "react-native-reanimated";
import { useAuthStore } from "../../src/stores/authStore";
import { useRegisterFlowStore } from "../../src/stores/registerFlowStore";

const GENDER_OPTIONS = [
  { label: "男", value: 1 as const, avatarUrl: "https://api.dicebear.com/7.x/avataaars/png?seed=Male&backgroundColor=b6e3f4", description: "男生" },
  { label: "女", value: 2 as const, avatarUrl: "https://api.dicebear.com/7.x/avataaars/png?seed=Female&backgroundColor=ffd5dc", description: "女生" },
  { label: "保密", value: 0 as const, avatarUrl: "https://api.dicebear.com/7.x/avataaars/png?seed=Unknown&backgroundColor=c0aede", description: "不透露" },
];

function GenderCard({ option, isSelected, onSelect, animationDelay }: { option: (typeof GENDER_OPTIONS)[0]; isSelected: boolean; onSelect: () => void; animationDelay: number }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    scale.value = withSpring(0.95, { damping: 15 });
    setTimeout(() => {
      scale.value = withSpring(1.02, { damping: 15 });
      setTimeout(() => { scale.value = withSpring(1, { damping: 15 }); }, 80);
    }, 100);
    onSelect();
  };

  return (
    <Animated.View entering={FadeInUp.duration(400).delay(animationDelay).springify()} style={animatedStyle}>
      <TouchableOpacity style={[styles.genderCard, isSelected && styles.genderCardSelected]} onPress={handlePress} activeOpacity={0.85}>
        <View style={[styles.genderAvatarWrapper, isSelected && styles.genderAvatarWrapperSelected]}>
          <Image source={{ uri: option.avatarUrl }} style={styles.genderAvatar} contentFit="cover" />
        </View>
        <Text style={[styles.genderLabel, isSelected && styles.genderLabelSelected]}>{option.label}</Text>
        <Text style={styles.genderDescription}>{option.description}</Text>
        {isSelected && (
          <Animated.View entering={FadeIn.duration(200)} style={styles.selectedIndicator}>
            <View style={styles.selectedDot} />
          </Animated.View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function RegisterGenderScreen() {
  const [selectedGender, setSelectedGender] = useState<0 | 1 | 2 | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuthStore();
  const { account, password, code, accountType, username, avatar, age, setGender, reset } = useRegisterFlowStore();

  const handleComplete = async () => {
    if (selectedGender === null) { Alert.alert("提示", "请选择你的性别"); return; }
    setGender(selectedGender);

    setIsLoading(true);
    try {
      await register(account, password, code, accountType, {
        nickname: username,
        avatar: avatar || undefined,
        gender: selectedGender,
        age: age || undefined,
      });
      reset();
      router.replace("/(tabs)/home");
    } catch (error: any) {
      Alert.alert("注册失败", error.message || "请检查输入信息是否正确");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressContainer}>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <View key={i} style={[styles.progressDot, i === 6 ? styles.progressDotActive : styles.progressDotInactive]} />
        ))}
      </View>

      <Animated.View entering={FadeInDown.duration(500).springify()} style={styles.titleSection}>
        <Text style={styles.title}>你的性别</Text>
        <Text style={styles.subtitle}>我们会对内容进行个性化推荐</Text>
      </Animated.View>

      <View style={styles.cardsSection}>
        {GENDER_OPTIONS.map((option, i) => (
          <GenderCard key={option.value} option={option} isSelected={selectedGender === option.value} onSelect={() => setSelectedGender(option.value)} animationDelay={100 + i * 80} />
        ))}
      </View>

      <Animated.View entering={FadeInUp.duration(500).delay(400).springify()} style={styles.buttonSection}>
        <TouchableOpacity style={[styles.primaryButton, selectedGender === null && styles.primaryButtonDisabled]} activeOpacity={0.8} onPress={handleComplete} disabled={selectedGender === null || isLoading}>
          <Text style={[styles.primaryButtonText, selectedGender === null && styles.primaryButtonTextDisabled]}>
            {isLoading ? "注册中..." : "完成注册"}
          </Text>
        </TouchableOpacity>
        <View style={styles.terms}>
          <Text style={styles.termsText}>注册即表示同意《用户协议》和《隐私政策》</Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  progressContainer: { flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 12, marginBottom: 28 },
  progressDot: { height: 3, borderRadius: 1.5 },
  progressDotActive: { width: 28, backgroundColor: "#000000" },
  progressDotInactive: { width: 6, backgroundColor: "#D1D5DB" },
  titleSection: { paddingHorizontal: 24, marginBottom: 40 },
  title: { fontSize: 36, fontWeight: "800", color: "#000000", letterSpacing: -1 },
  subtitle: { fontSize: 15, color: "#6B7280", marginTop: 10 },
  cardsSection: { flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "flex-start", paddingHorizontal: 24, gap: 16 },
  genderCard: {
    flex: 1, maxWidth: 105, backgroundColor: "#FFFFFF", borderRadius: 20, paddingVertical: 24, paddingHorizontal: 8,
    alignItems: "center", borderWidth: 1.5, borderColor: "#E5E7EB",
    shadowColor: "#000000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2, position: "relative",
  },
  genderCardSelected: { borderColor: "#000000", backgroundColor: "#000000", shadowOpacity: 0.2, elevation: 6 },
  genderAvatarWrapper: { width: 72, height: 72, borderRadius: 36, overflow: "hidden", marginBottom: 12, borderWidth: 2, borderColor: "#E5E7EB" },
  genderAvatarWrapperSelected: { borderColor: "#374151" },
  genderAvatar: { width: "100%", height: "100%" },
  genderLabel: { fontSize: 18, fontWeight: "700", color: "#000000", marginBottom: 4 },
  genderLabelSelected: { color: "#FFFFFF" },
  genderDescription: { fontSize: 12, color: "#9CA3AF" },
  selectedIndicator: { position: "absolute", top: 12, right: 12 },
  selectedDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#FFFFFF" },
  buttonSection: { paddingHorizontal: 24, paddingBottom: 24, gap: 16 },
  primaryButton: { backgroundColor: "#000000", borderRadius: 14, paddingVertical: 17, alignItems: "center", shadowColor: "#000000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4 },
  primaryButtonDisabled: { backgroundColor: "#D1D5DB" },
  primaryButtonText: { color: "#FFFFFF", fontSize: 17, fontWeight: "600" },
  primaryButtonTextDisabled: { color: "#FFFFFF" },
  terms: { alignItems: "center" },
  termsText: { fontSize: 12, color: "#9CA3AF", textAlign: "center" },
});
