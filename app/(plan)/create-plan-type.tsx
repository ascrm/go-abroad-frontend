import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { usePlanFlowStore } from "@/src/stores/planFlowStore";
import type { PlanType } from "@/src/types/plan";
import {
  Plane,
  GraduationCap,
  Briefcase,
  Home,
  ChevronRight,
} from "lucide-react-native";

const abroadTypes: { type: PlanType; label: string; icon: any; color: string; desc: string }[] = [
  {
    type: "tourism",
    label: "旅游",
    icon: Plane,
    color: "#3B82F6",
    desc: "短期出行，观光度假",
  },
  {
    type: "study",
    label: "留学",
    icon: GraduationCap,
    color: "#8B5CF6",
    desc: "学位课程，语言学习",
  },
  {
    type: "work",
    label: "工作",
    icon: Briefcase,
    color: "#F59E0B",
    desc: "海外就业，职业发展",
  },
  {
    type: "immigration",
    label: "定居",
    icon: Home,
    color: "#10B981",
    desc: "移民定居，长期居住",
  },
];

export default function CreatePlanTypeScreen() {
  const [selectedType, setSelectedType] = useState<PlanType | null>(null);
  const { setAbroadType } = usePlanFlowStore();

  const handleNext = () => {
    if (!selectedType) return;
    setAbroadType(selectedType);
    router.push("/(plan)/create-plan-destination");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
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

        <Animated.View
          entering={FadeInDown.duration(500).springify()}
          style={styles.titleSection}
        >
          <Text style={styles.title}>你想要做什么？</Text>
          <Text style={styles.subtitle}>选择你的出国目的</Text>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(500).delay(100).springify()}
          style={styles.typeGrid}
        >
          {abroadTypes.map(({ type, label, icon: Icon, color, desc }) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeCard,
                selectedType === type && styles.typeCardActive,
                { borderColor: selectedType === type ? color : "#E5E7EB" },
              ]}
              activeOpacity={0.7}
              onPress={() => setSelectedType(type)}
            >
              <View
                style={[
                  styles.typeIconContainer,
                  { backgroundColor: `${color}15` },
                ]}
              >
                <Icon size={28} color={color} />
              </View>
              <Text
                style={[
                  styles.typeLabel,
                  selectedType === type && { color },
                ]}
              >
                {label}
              </Text>
              <Text style={styles.typeDesc}>{desc}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(500).delay(200).springify()}
          style={styles.buttonSection}
        >
          <TouchableOpacity
            style={[
              styles.primaryButton,
              !selectedType && styles.primaryButtonDisabled,
            ]}
            activeOpacity={0.8}
            onPress={handleNext}
            disabled={!selectedType}
          >
            <Text
              style={[
                styles.primaryButtonText,
                !selectedType && styles.primaryButtonTextDisabled,
              ]}
            >
              下一步
            </Text>
            <ChevronRight size={20} color="#FFFFFF" />
          </TouchableOpacity>
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
  title: { fontSize: 36, fontWeight: "800", color: "#000000", letterSpacing: -1 },
  subtitle: { fontSize: 15, color: "#6B7280", marginTop: 10 },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  typeCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    padding: 20,
  },
  typeCardActive: {
    backgroundColor: "#FAFAFA",
  },
  typeIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  typeLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  typeDesc: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  buttonSection: { paddingBottom: 16, marginTop: "auto" },
  primaryButton: {
    backgroundColor: "#000000",
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryButtonDisabled: { backgroundColor: "#D1D5DB" },
  primaryButtonText: { color: "#FFFFFF", fontSize: 17, fontWeight: "600" },
  primaryButtonTextDisabled: { color: "#FFFFFF" },
});