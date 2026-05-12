import { router } from "expo-router";
import { MapPin } from "lucide-react-native";
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
import CountryPicker from "@/components/page/create-plan/CountryPicker";

const countryList = [
  "日本", "韩国", "新加坡", "泰国", "马尔代夫", "美国", "加拿大",
  "英国", "澳大利亚", "新西兰", "法国", "德国", "意大利", "西班牙",
  "荷兰", "瑞士", "瑞典", "挪威", "丹麦", "芬兰", "爱尔兰", "奥地利",
  "比利时", "葡萄牙", "希腊", "捷克", "波兰", "匈牙利", "俄罗斯",
  "巴西", "阿根廷", "墨西哥", "埃及", "南非", "阿联酋", "土耳其",
  "印度", "印尼", "马来西亚", "菲律宾", "越南", "柬埔寨", "尼泊尔",
  "斯里兰卡", "新西兰", "秘鲁", "智利", "哥伦比亚"
];

export default function CreatePlanDestinationScreen() {
  const [showPicker, setShowPicker] = useState(false);
  const { destination, setDestination, abroadType, reset } = usePlanFlowStore();

  const handleSelect = (code: string, name: string) => {
    setDestination({ country: name });
    setShowPicker(false);
  };

  const handleNext = () => {
    if (!destination.country) return;
    router.push("/(plan)/create-plan-form");
  };

  const handleBack = () => {
    reset();
    router.back();
  };

  const getTitle = () => {
    switch (abroadType) {
      case "tourism": return "想去哪个国家？";
      case "study": return "想申请哪个国家？";
      case "work": return "想去哪个国家工作？";
      case "immigration": return "想移民哪个国家？";
      default: return "选择目的地";
    }
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
                i === 1 ? styles.progressDotActive : styles.progressDotInactive,
              ]}
            />
          ))}
        </View>

        <Animated.View
          entering={FadeInDown.duration(500).springify()}
          style={styles.titleSection}
        >
          <Text style={styles.title}>{getTitle()}</Text>
          <Text style={styles.subtitle}>选择你的目的地国家或地区</Text>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(500).delay(100).springify()}
          style={styles.inputSection}
        >
          <TouchableOpacity
            style={[
              styles.inputCard,
              destination.country && styles.inputCardActive,
            ]}
            activeOpacity={0.7}
            onPress={() => setShowPicker(true)}
          >
            <View style={styles.inputIcon}>
              <MapPin size={20} color={destination.country ? "#000000" : "#9CA3AF"} />
            </View>
            <Text style={[
              styles.inputText,
              !destination.country && styles.inputPlaceholder
            ]}>
              {destination.country || "点击选择国家"}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(500).delay(200).springify()}
          style={styles.buttonSection}
        >
          <TouchableOpacity
            style={[
              styles.primaryButton,
              !destination.country && styles.primaryButtonDisabled,
            ]}
            activeOpacity={0.8}
            onPress={handleNext}
            disabled={!destination.country}
          >
            <Text style={[
              styles.primaryButtonText,
              !destination.country && styles.primaryButtonTextDisabled,
            ]}>
              下一步
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>重新选择类型</Text>
          </TouchableOpacity>
        </Animated.View>

        <CountryPicker
          visible={showPicker}
          onClose={() => setShowPicker(false)}
          onSelect={handleSelect}
        />
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
  inputSection: { flex: 1 },
  inputCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inputCardActive: { borderColor: "#000000" },
  inputIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  inputText: { flex: 1, fontSize: 17, color: "#111827" },
  inputPlaceholder: { color: "#9CA3AF" },
  buttonSection: { paddingBottom: 16 },
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
  primaryButtonText: { color: "#FFFFFF", fontSize: 17, fontWeight: "600" },
  primaryButtonTextDisabled: { color: "#FFFFFF" },
  backButton: { marginTop: 16, alignItems: "center" },
  backButtonText: { fontSize: 15, color: "#6B7280" },
});