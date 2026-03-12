import CountryPicker from "@/components/page/create-plan/CountryPicker";
import { router } from "expo-router";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react-native";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SelectAbroadType from "../components/page/create-plan/SelectAbroadType";

type AbroadType = "tourism" | "study" | "work" | "immigration" | null;

interface FormData {
  // 旅游
  destination: string;
  travelBudget: string;
  travelDays: string;
  companions: string;
  passportStatus: string;
  profession: string;
  
  // 留学
  targetDegree: string;
  currentBackground: string;
  languageAbility: string;
  financialAbility: string;
  targetMajor: string;
  timePlan: string;
  
  // 工作
  jobField: string;
  certificates: string;
  languageSkill: string;
  workExperience: string;
  familyAccompany: string;
  jobStatus: string;
  
  // 定居
  assetOverview: string;
  age: string;
  coreBackground: string;
  immigrationPurpose: string;
  targetPreference: string;
}

// 旅游相关选项
const travelBudgetOptions = ["经济型", "标准型", "奢华型"];
const travelDaysOptions = ["3天以内", "3-7天", "7-14天", "14天以上"];
const companionsOptions = ["单人", "情侣", "亲子(带娃)", "陪同老人", "朋友结伴"];
const passportOptions = ["有护照(有效期>6个月)", "有护照(有效期<6个月)", "没有护照"];
const professionOptions = ["在职", "在校学生", "退休", "自由职业"];

// 留学相关选项
const degreeOptions = ["高中", "本科", "硕士", "博士"];
const languageOptions = ["雅思7+", "雅思6-7", "雅思6以下", "托福100+", "托福80-100", "托福80以下", "暂无"];
const financialOptions = ["20万以下/年", "20-40万/年", "40-60万/年", "60-100万/年", "100万以上/年"];
const timeOptions = ["2026年秋季", "2026年春季", "2027年秋季", "2027年春季", "待定"];

// 工作相关选项
const jobFieldOptions = ["IT/互联网", "金融/银行", "医疗/护理", "教育", "建筑/工程", "餐饮/酒店", "销售/市场", "其他"];
const languageSkillOptions = ["流利(可商务沟通)", "良好(日常交流)", "一般(基础对话)", "较差"];
const workExperienceOptions = ["1年以下", "1-3年", "3-5年", "5-10年", "10年以上"];
const familyOptions = ["不需要", "需要配偶随行", "需要子女随行", "需要全家随行"];
const jobStatusOptions = ["已拿到Offer(需办签证)", "正在求职中", "观望中"];

// 定居相关选项
const assetOptions = ["100万以下", "100-300万", "300-500万", "500-1000万", "1000万以上"];
const ageOptions = ["25岁以下", "25-30岁", "30-35岁", "35-40岁", "40-45岁", "45岁以上"];
const coreBackgroundOptions = ["高学历+高语言+丰富经验", "高学历+高语言", "高学历+丰富经验", "高语言+丰富经验", "其他"];
const immigrationPurposeOptions = ["孩子教育", "环境质量", "养老", "事业发展", "其他"];
const targetPreferenceOptions = ["大国(美加澳新)", "欧洲国家", "亚洲国家(新加坡/日本)", "其他"];

const stepsConfig: Record<Exclude<AbroadType, null>, { key: string; title: string; subtitle: string }[]> = {
  tourism: [
    { key: "destination", title: "想去哪个国家或地区？", subtitle: "选择你的目的地" },
    { key: "travelBudget", title: "你的旅行预算是？", subtitle: "决定行程的舒适度" },
    { key: "travelDays", title: "计划出行几天？", subtitle: "规划行程时长" },
    { key: "companions", title: "和谁一起出行？", subtitle: "了解同行人员情况" },
    { key: "passportStatus", title: "你的护照状态是？", subtitle: "了解签证办理条件" },
    { key: "profession", title: "你的职业是？", subtitle: "影响签证材料准备" },
  ],
  study: [
    { key: "targetDegree", title: "想申请什么学历？", subtitle: "选择目标学历层次" },
    { key: "targetMajor", title: "想读什么专业？", subtitle: "输入感兴趣的专业" },
    { key: "currentBackground", title: "当前的学业背景是？", subtitle: "填写学校和GPA" },
    { key: "languageAbility", title: "你的语言成绩是？", subtitle: "雅思/托福等成绩" },
    { key: "financialAbility", title: "每年预算多少？", subtitle: "支付学费和生活费" },
    { key: "timePlan", title: "计划什么时候入学？", subtitle: "规划申请时间" },
  ],
  work: [
    { key: "jobField", title: "你的职业领域是？", subtitle: "选择当前从事的行业" },
    { key: "certificates", title: "有哪些证书或学历？", subtitle: "最高学历和资格证书" },
    { key: "languageSkill", title: "语言沟通能力如何？", subtitle: "英语或当地语言水平" },
    { key: "workExperience", title: "工作几年了？", subtitle: "累计工作经验年限" },
    { key: "familyAccompany", title: "需要家属随行吗？", subtitle: "配偶或子女是否同行" },
    { key: "jobStatus", title: "目前的求职状态是？", subtitle: "是否已有Offer" },
  ],
  immigration: [
    { key: "assetOverview", title: "家庭资产概况是？", subtitle: "可动用的资金规模" },
    { key: "age", title: "你的年龄是？", subtitle: "移民打分关键因素" },
    { key: "coreBackground", title: "你的核心背景是？", subtitle: "学历、语言、工作经验" },
    { key: "immigrationPurpose", title: "移民的主要目的是？", subtitle: "了解移民动机" },
    { key: "targetPreference", title: "倾向去哪个国家？", subtitle: "目标国家偏好" },
  ],
};

export default function CreatePlanScreen() {
  const [abroadType, setAbroadType] = useState<AbroadType>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    destination: "", travelBudget: "", travelDays: "", companions: "", passportStatus: "", profession: "",
    targetDegree: "", currentBackground: "", languageAbility: "", financialAbility: "", targetMajor: "", timePlan: "",
    jobField: "", certificates: "", languageSkill: "", workExperience: "", familyAccompany: "", jobStatus: "",
    assetOverview: "", age: "", coreBackground: "", immigrationPurpose: "", targetPreference: "",
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const steps = abroadType ? stepsConfig[abroadType] : [];
  const progress = abroadType ? ((currentStep + 1) / steps.length) * 100 : 0;

  const handleSelectType = (type: AbroadType) => {
    setAbroadType(type);
    setCurrentStep(0);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleGenerate();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      setAbroadType(null);
    }
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      Alert.alert(
        "生成成功",
        "您的出国规划已生成完毕",
        [
          {
            text: "确定",
            onPress: () => router.back(),
          },
        ]
      );
    }, 3000);
  };

  const updateField = (value: string) => {
    const key = steps[currentStep].key as keyof FormData;
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const canProceed = () => {
    const key = steps[currentStep].key as keyof FormData;
    return !!formData[key];
  };

  const renderOptions = (options: string[], currentValue: string) => (
    <View className="flex-row flex-wrap gap-3">
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          className={`px-5 py-3 rounded-xl border ${
            currentValue === option
              ? "bg-gray-900 border-gray-900"
              : "bg-white border-gray-200"
          }`}
          onPress={() => updateField(option)}
        >
          <Text className={`text-base ${
            currentValue === option ? "text-white" : "text-gray-700"
          }`}>
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStepContent = () => {
    if (!abroadType) return null;
    const step = steps[currentStep];

    switch (step.key) {
      // 旅游
      case "destination":
        return (
          <TouchableOpacity
            className="bg-white border border-gray-200 rounded-xl px-4 py-4"
            onPress={() => setShowCountryPicker(true)}
          >
            <Text className={`text-lg ${formData.destination ? "text-gray-900" : "text-gray-400"}`}>
              {formData.destination || "点击选择国家"}
            </Text>
          </TouchableOpacity>
        );
      case "travelBudget":
        return renderOptions(travelBudgetOptions, formData.travelBudget);
      case "travelDays":
        return renderOptions(travelDaysOptions, formData.travelDays);
      case "companions":
        return renderOptions(companionsOptions, formData.companions);
      case "passportStatus":
        return renderOptions(passportOptions, formData.passportStatus);
      case "profession":
        return renderOptions(professionOptions, formData.profession);

      // 留学
      case "targetDegree":
        return renderOptions(degreeOptions, formData.targetDegree);
      case "targetMajor":
        return (
          <TextInput
            className="bg-white border border-gray-200 rounded-xl px-4 py-4 text-gray-900 text-lg"
            placeholder="例如：计算机科学、金融学"
            placeholderTextColor="#9CA3AF"
            value={formData.targetMajor}
            onChangeText={updateField}
            autoFocus
          />
        );
      case "currentBackground":
        return (
          <TextInput
            className="bg-white border border-gray-200 rounded-xl px-4 py-4 text-gray-900 text-lg"
            placeholder="学校名称 + GPA (如：北大 3.5)"
            placeholderTextColor="#9CA3AF"
            value={formData.currentBackground}
            onChangeText={updateField}
            autoFocus
          />
        );
      case "languageAbility":
        return renderOptions(languageOptions, formData.languageAbility);
      case "financialAbility":
        return renderOptions(financialOptions, formData.financialAbility);
      case "timePlan":
        return renderOptions(timeOptions, formData.timePlan);

      // 工作
      case "jobField":
        return renderOptions(jobFieldOptions, formData.jobField);
      case "certificates":
        return (
          <TextInput
            className="bg-white border border-gray-200 rounded-xl px-4 py-4 text-gray-900 text-lg"
            placeholder="最高学历 + 相关证书"
            placeholderTextColor="#9CA3AF"
            value={formData.certificates}
            onChangeText={updateField}
            autoFocus
          />
        );
      case "languageSkill":
        return renderOptions(languageSkillOptions, formData.languageSkill);
      case "workExperience":
        return renderOptions(workExperienceOptions, formData.workExperience);
      case "familyAccompany":
        return renderOptions(familyOptions, formData.familyAccompany);
      case "jobStatus":
        return renderOptions(jobStatusOptions, formData.jobStatus);

      // 定居
      case "assetOverview":
        return renderOptions(assetOptions, formData.assetOverview);
      case "age":
        return renderOptions(ageOptions, formData.age);
      case "coreBackground":
        return renderOptions(coreBackgroundOptions, formData.coreBackground);
      case "immigrationPurpose":
        return renderOptions(immigrationPurposeOptions, formData.immigrationPurpose);
      case "targetPreference":
        return renderOptions(targetPreferenceOptions, formData.targetPreference);

      default:
        return null;
    }
  };

  if (isGenerating) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-gray-50 items-center justify-center">
        <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-6">
          <Sparkles size={36} color="#0076D6" />
        </View>
        <Text className="text-xl font-semibold text-gray-900 mb-2">AI正在生成规划</Text>
        <Text className="text-sm text-gray-500">请稍候...</Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
        {abroadType ? (
          <>
            {/* 顶部进度条 */}
            <View className="px-4 py-3">
              <View className="flex-row items-center gap-2 mb-2">
                <TouchableOpacity onPress={handlePrev} className="p-1 -ml-1">
                  <ChevronLeft size={24} color="#374151" />
                </TouchableOpacity>
                <View className="flex-1">
                  <View className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <View 
                      className="h-full bg-gray-900 rounded-full" 
                      style={{ width: `${progress}%` }} 
                    />
                  </View>
                </View>
                <Text className="text-sm text-gray-500 ml-2">{currentStep + 1}/{steps.length}</Text>
              </View>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
            >
              <View className="mb-10 mt-4">
                <Text className="text-2xl font-bold text-gray-900 mb-2">
                  {steps[currentStep].title}
                </Text>
                <Text className="text-sm text-gray-500">
                  {steps[currentStep].subtitle}
                </Text>
              </View>

              <View className="min-h-32">
                {renderStepContent()}
              </View>
            </ScrollView>

            {/* 底部按钮 */}
            <View className="bg-white px-6 pb-6 pt-4 border-t border-gray-100">
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 py-4 rounded-xl border border-gray-200 bg-white flex-row items-center justify-center gap-2"
                  onPress={handlePrev}
                >
                  <ChevronLeft size={20} color="#374151" />
                  <Text className="text-gray-700 font-medium">上一步</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 py-4 rounded-xl bg-gray-900 flex-row items-center justify-center gap-2 ${
                    !canProceed() ? "opacity-50" : ""
                  }`}
                  onPress={handleNext}
                  disabled={!canProceed()}
                >
                  <Text className="text-white font-medium">
                    {currentStep === steps.length - 1 ? "开始生成" : "下一步"}
                  </Text>
                  {currentStep < steps.length - 1 && <ChevronRight size={20} color="#FFFFFF" />}
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          <SelectAbroadType onSelect={handleSelectType} />
        )}
          <CountryPicker
        visible={showCountryPicker}
        onClose={() => setShowCountryPicker(false)}
        onSelect={(code, name) => updateField(name)}
      />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
});
