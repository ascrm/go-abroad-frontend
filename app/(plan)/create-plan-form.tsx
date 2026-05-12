import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { usePlanFlowStore } from "@/src/stores/planFlowStore";
import type { PlanType } from "@/src/types/plan";
import { ChevronLeft, ChevronRight, User } from "lucide-react-native";
import GenerateResult from "@/components/page/create-plan/GenerateResult";

interface StepConfig {
  key: string;
  title: string;
  subtitle: string;
  type: "options" | "text";
  options?: string[];
  placeholder?: string;
}

const stepsConfig: Record<PlanType, StepConfig[]> = {
  tourism: [
    { key: "travelBudget", title: "旅行预算是？", subtitle: "决定行程的舒适度", type: "options", options: ["经济型", "标准型", "奢华型"] },
    { key: "travelDays", title: "计划出行几天？", subtitle: "规划行程时长", type: "options", options: ["3天以内", "3-7天", "7-14天", "14天以上"] },
    { key: "companions", title: "和谁一起出行？", subtitle: "了解同行人员情况", type: "options", options: ["单人", "情侣", "亲子(带娃)", "陪同老人", "朋友结伴"] },
    { key: "passportStatus", title: "护照状态是？", subtitle: "影响签证办理", type: "options", options: ["有护照(有效期>6个月)", "有护照(有效期<6个月)", "没有护照"] },
    { key: "profession", title: "职业是？", subtitle: "影响签证材料", type: "options", options: ["在职", "在校学生", "退休", "自由职业"] },
  ],
  study: [
    { key: "targetDegree", title: "想申请什么学历？", subtitle: "选择目标学历层次", type: "options", options: ["高中", "本科", "硕士", "博士"] },
    { key: "targetMajor", title: "想读什么专业？", subtitle: "输入感兴趣的专业", type: "text", placeholder: "例如：计算机科学、金融学" },
    { key: "currentBackground", title: "当前学业背景？", subtitle: "填写学校和GPA", type: "text", placeholder: "学校名称 + GPA (如：北大 3.5)" },
    { key: "languageAbility", title: "语言成绩是？", subtitle: "雅思/托福等成绩", type: "options", options: ["雅思7+", "雅思6-7", "雅思6以下", "托福100+", "托福80-100", "托福80以下", "暂无"] },
    { key: "financialAbility", title: "每年预算多少？", subtitle: "支付学费和生活费", type: "options", options: ["20万以下/年", "20-40万/年", "40-60万/年", "60-100万/年", "100万以上/年"] },
    { key: "timePlan", title: "计划什么时候入学？", subtitle: "规划申请时间", type: "options", options: ["2026年秋季", "2026年春季", "2027年秋季", "2027年春季", "待定"] },
  ],
  work: [
    { key: "jobField", title: "职业领域是？", subtitle: "选择当前从事的行业", type: "options", options: ["IT/互联网", "金融/银行", "医疗/护理", "教育", "建筑/工程", "餐饮/酒店", "销售/市场", "其他"] },
    { key: "certificates", title: "有哪些证书或学历？", subtitle: "最高学历和资格证书", type: "text", placeholder: "最高学历 + 相关证书" },
    { key: "languageSkill", title: "语言沟通能力？", subtitle: "英语或当地语言水平", type: "options", options: ["流利(可商务沟通)", "良好(日常交流)", "一般(基础对话)", "较差"] },
    { key: "workExperience", title: "工作几年了？", subtitle: "累计工作经验年限", type: "options", options: ["1年以下", "1-3年", "3-5年", "5-10年", "10年以上"] },
    { key: "familyAccompany", title: "需要家属随行吗？", subtitle: "配偶或子女是否同行", type: "options", options: ["不需要", "需要配偶随行", "需要子女随行", "需要全家随行"] },
    { key: "jobStatus", title: "目前的求职状态是？", subtitle: "是否已有Offer", type: "options", options: ["已拿到Offer(需办签证)", "正在求职中", "观望中"] },
  ],
  immigration: [
    { key: "assetOverview", title: "家庭资产概况是？", subtitle: "可动用的资金规模", type: "options", options: ["100万以下", "100-300万", "300-500万", "500-1000万", "1000万以上"] },
    { key: "age", title: "年龄是？", subtitle: "移民打分关键因素", type: "options", options: ["25岁以下", "25-30岁", "30-35岁", "35-40岁", "40-45岁", "45岁以上"] },
    { key: "coreBackground", title: "核心背景是？", subtitle: "学历、语言、工作经验", type: "options", options: ["高学历+高语言+丰富经验", "高学历+高语言", "高学历+丰富经验", "高语言+丰富经验", "其他"] },
    { key: "immigrationPurpose", title: "移民的主要目的是？", subtitle: "了解移民动机", type: "options", options: ["孩子教育", "环境质量", "养老", "事业发展", "其他"] },
    { key: "targetPreference", title: "倾向去哪个国家？", subtitle: "目标国家偏好", type: "options", options: ["大国(美加澳新)", "欧洲国家", "亚洲国家(新加坡/日本)", "其他"] },
  ],
};

export default function CreatePlanFormScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const { abroadType, destination, formData, setFormData, reset } = usePlanFlowStore();

  const steps = abroadType ? stepsConfig[abroadType] : [];
  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentValue = formData[step?.key] || "";

  const handleNext = () => {
    if (!currentValue) return;
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsGenerating(true);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleGenerateComplete = (planId: number) => {
    reset();
    router.replace({
      pathname: "/(tabs)/plan",
    });
  };

  const renderContent = () => {
    if (step.type === "text") {
      return (
        <TextInput
          style={styles.textInput}
          placeholder={step.placeholder}
          placeholderTextColor="#9CA3AF"
          value={currentValue}
          onChangeText={(text) => setFormData(step.key, text)}
          autoFocus
        />
      );
    }

    return (
      <View style={styles.optionsGrid}>
        {step.options?.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionTag,
              currentValue === option && styles.optionTagActive,
            ]}
            activeOpacity={0.7}
            onPress={() => setFormData(step.key, option)}
          >
            <Text
              style={[
                styles.optionText,
                currentValue === option && styles.optionTextActive,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (isGenerating) {
    return (
      <GenerateResult
        abroadType={abroadType!}
        destination={destination}
        formData={formData as any}
        onComplete={handleGenerateComplete}
      />
    );
  }

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
                i === 2 + currentStep
                  ? styles.progressDotActive
                  : styles.progressDotInactive,
              ]}
            />
          ))}
        </View>

        <Animated.View
          key={currentStep}
          entering={FadeInDown.duration(500).springify()}
          style={styles.titleSection}
        >
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.subtitle}>{step.subtitle}</Text>
        </Animated.View>

        <Animated.View
          key={currentStep + 100}
          entering={FadeInUp.duration(500).delay(100).springify()}
          style={styles.inputSection}
        >
          {renderContent()}
        </Animated.View>

        <Animated.View
          key={currentStep + 200}
          entering={FadeInUp.duration(500).delay(200).springify()}
          style={styles.stepIndicator}
        >
          <Text style={styles.stepText}>
            {currentStep + 1} / {steps.length}
          </Text>
        </Animated.View>

        <Animated.View
          key={currentStep + 300}
          entering={FadeInUp.duration(500).delay(300).springify()}
          style={styles.buttonSection}
        >
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.backButton}
              activeOpacity={0.7}
              onPress={handlePrev}
            >
              <ChevronLeft size={20} color="#374151" />
              <Text style={styles.backButtonText}>上一步</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                !currentValue && styles.primaryButtonDisabled,
              ]}
              activeOpacity={0.8}
              onPress={handleNext}
              disabled={!currentValue}
            >
              <Text
                style={[
                  styles.primaryButtonText,
                  !currentValue && styles.primaryButtonTextDisabled,
                ]}
              >
                {currentStep === steps.length - 1 ? "开始生成" : "下一步"}
              </Text>
              {currentStep < steps.length - 1 && (
                <ChevronRight size={20} color="#FFFFFF" />
              )}
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
  title: { fontSize: 36, fontWeight: "800", color: "#000000", letterSpacing: -1 },
  subtitle: { fontSize: 15, color: "#6B7280", marginTop: 10 },
  inputSection: { flex: 1 },
  textInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 17,
    color: "#111827",
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  optionTag: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  optionTagActive: {
    backgroundColor: "#000000",
    borderColor: "#000000",
  },
  optionText: { fontSize: 15, color: "#374151", fontWeight: "500" },
  optionTextActive: { color: "#FFFFFF" },
  stepIndicator: { alignItems: "center", marginTop: 24 },
  stepText: { fontSize: 14, color: "#9CA3AF" },
  buttonSection: { paddingBottom: 16 },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  backButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    paddingVertical: 17,
  },
  backButtonText: { fontSize: 17, color: "#374151", fontWeight: "500" },
  primaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#000000",
    borderRadius: 14,
    paddingVertical: 17,
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