import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { useRegisterFlowStore } from "../../src/stores/registerFlowStore";

const AGE_OPTIONS = [
  { label: "16岁以下", value: 15 },
  { label: "16岁", value: 16 },
  { label: "17岁", value: 17 },
  { label: "18岁", value: 18 },
  { label: "19岁", value: 19 },
  { label: "20岁", value: 20 },
  { label: "21岁", value: 21 },
  { label: "22岁", value: 22 },
  { label: "23岁", value: 23 },
  { label: "24岁", value: 24 },
  { label: "25岁", value: 25 },
  { label: "26-30岁", value: 28 },
  { label: "31-35岁", value: 33 },
  { label: "36-40岁", value: 38 },
  { label: "40岁以上", value: 45 },
];

function AgeChip({ option, isSelected, onSelect }: { option: (typeof AGE_OPTIONS)[0]; isSelected: boolean; onSelect: () => void }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    scale.value = withSpring(0.93, { damping: 15 });
    setTimeout(() => { scale.value = withSpring(1, { damping: 15 }); }, 100);
    onSelect();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <Animated.View style={[styles.ageChip, isSelected && styles.ageChipSelected, animatedStyle]}>
        <Text style={[styles.ageChipLabel, isSelected && styles.ageChipLabelSelected]}>{option.label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function RegisterAgeScreen() {
  const [selectedAge, setSelectedAge] = useState<number | null>(null);
  const { setAge } = useRegisterFlowStore();

  const handleNext = () => {
    if (selectedAge !== null) setAge(selectedAge);
    router.push("/(auth)/register-gender");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressContainer}>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <View key={i} style={[styles.progressDot, i === 5 ? styles.progressDotActive : styles.progressDotInactive]} />
        ))}
      </View>

      <Animated.View entering={FadeInDown.duration(500).springify()} style={styles.titleSection}>
        <Text style={styles.title}>你的年龄</Text>
        <Text style={styles.subtitle}>帮助我们给你推荐更合适的留学规划</Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(500).delay(100).springify()} style={styles.gridSection}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.gridContent}>
          <View style={styles.ageGrid}>
            {AGE_OPTIONS.map((option) => (
              <AgeChip key={option.value} option={option} isSelected={selectedAge === option.value} onSelect={() => setSelectedAge(option.value)} />
            ))}
          </View>
        </ScrollView>
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(500).delay(200).springify()} style={styles.buttonSection}>
        <TouchableOpacity style={[styles.primaryButton, selectedAge === null && styles.primaryButtonDisabled]} activeOpacity={0.8} onPress={handleNext} disabled={selectedAge === null}>
          <Text style={[styles.primaryButtonText, selectedAge === null && styles.primaryButtonTextDisabled]}>下一步</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipButton} onPress={() => router.push("/(auth)/register-gender")} activeOpacity={0.7}>
          <Text style={styles.skipText}>暂时跳过</Text>
        </TouchableOpacity>
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
  titleSection: { paddingHorizontal: 24, marginBottom: 32 },
  title: { fontSize: 36, fontWeight: "800", color: "#000000", letterSpacing: -1 },
  subtitle: { fontSize: 15, color: "#6B7280", marginTop: 10 },
  gridSection: { flex: 1 },
  gridContent: { paddingHorizontal: 24, paddingBottom: 16 },
  ageGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  ageChip: {
    paddingHorizontal: 20, paddingVertical: 14, borderRadius: 12,
    backgroundColor: "#FFFFFF", borderWidth: 1.5, borderColor: "#E5E7EB",
    shadowColor: "#000000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04 }, shadowRadius: 8, elevation: 2,
  ageChipSelected: { borderColor: "#000000", backgroundColor: "#000000" },
  ageChipLabel: { fontSize: 15, fontWeight: "500", color: "#374151" },
  ageChipLabelSelected: { color: "#FFFFFF", fontWeight: "600" },
  buttonSection: { paddingHorizontal: 24, paddingBottom: 24, gap: 12 },
  primaryButton: { backgroundColor: "#000000", borderRadius: 14, paddingVertical: 17, alignItems: "center", shadowColor: "#000000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4 },
  primaryButtonDisabled: { backgroundColor: "#D1D5DB" },
  primaryButtonText: { color: "#FFFFFF", fontSize: 17, fontWeight: "600" },
  primaryButtonTextDisabled: { color: "#FFFFFF" },
  skipButton: { paddingVertical: 12, alignItems: "center" },
  skipText: { fontSize: 14, color: "#9CA3AF" },
});
