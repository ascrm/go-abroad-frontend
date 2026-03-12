import { useLocalSearchParams, router } from "expo-router";
import { ChevronLeft, Clock, MapPin, Plane, GraduationCap, Briefcase, Home, Share2, MoreVertical } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const typeConfig = {
  tourism: { icon: Plane, label: "旅游", color: "#3B82F6", bgColor: "#EBF5FF" },
  study: { icon: GraduationCap, label: "留学", color: "#8B5CF6", bgColor: "#F5F3FF" },
  work: { icon: Briefcase, label: "工作", color: "#F59E0B", bgColor: "#FFFBEB" },
  immigration: { icon: Home, label: "定居", color: "#10B981", bgColor: "#ECFDF5" },
};

export default function PlanDetailScreen() {
  const { id, type, title, destination } = useLocalSearchParams<{
    id: string;
    type: "tourism" | "study" | "work" | "immigration";
    title: string;
    destination: string;
  }>();

  const config = typeConfig[type || "tourism"];
  const Icon = config.icon;

  // 模拟详情数据，后续替换为接口获取
  const planDetail = {
    id: id || "1",
    type: type || "tourism",
    title: title || "赴美读研规划",
    destination: destination || "美国",
    createdAt: "2026-03-10",
    status: "completed",
    // 基于不同类型显示不同内容
    content: type === "tourism" ? {
      budget: "标准型",
      days: "7-14天",
      companions: "单人",
      passportStatus: "有护照(有效期>6个月)",
      profession: "在职",
    } : type === "study" ? {
      degree: "硕士",
      major: "计算机科学",
      background: "北大 3.5",
      language: "雅思7+",
      financial: "40-60万/年",
      timePlan: "2026年秋季",
    } : type === "work" ? {
      jobField: "IT/互联网",
      certificates: "本科 + 相关证书",
      language: "流利(可商务沟通)",
      experience: "3-5年",
      family: "不需要",
      jobStatus: "正在求职中",
    } : {
      asset: "100-300万",
      age: "25-30岁",
      background: "高学历+高语言+丰富经验",
      purpose: "孩子教育",
      target: "大国(美加澳新)",
    },
  };

  const renderContent = () => {
    const c = planDetail.content;
    
    if (planDetail.type === "tourism") {
      return (
        <>
          <View className="bg-white rounded-2xl p-5 mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">行程预算</Text>
            <View className="flex-row flex-wrap gap-2">
              <View className="bg-gray-50 px-4 py-2 rounded-lg">
                <Text className="text-sm text-gray-600">预算: {c.budget}</Text>
              </View>
              <View className="bg-gray-50 px-4 py-2 rounded-lg">
                <Text className="text-sm text-gray-600">天数: {c.days}</Text>
              </View>
              <View className="bg-gray-50 px-4 py-2 rounded-lg">
                <Text className="text-sm text-gray-600">同行: {c.companions}</Text>
              </View>
              <View className="bg-gray-50 px-4 py-2 rounded-lg">
                <Text className="text-sm text-gray-600">护照: {c.passportStatus}</Text>
              </View>
              <View className="bg-gray-50 px-4 py-2 rounded-lg">
                <Text className="text-sm text-gray-600">职业: {c.profession}</Text>
              </View>
            </View>
          </View>

          <View className="bg-white rounded-2xl p-5 mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">AI 建议</Text>
            <Text className="text-sm text-gray-600 leading-6">
              基于您的出行偏好，建议选择美国作为目的地。建议提前3个月开始准备签证材料，
              注意护照有效期。7-14天的行程建议选择标准型预算，可以覆盖主要景点和体验项目。
            </Text>
          </View>

          <View className="bg-white rounded-2xl p-5 mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">准备清单</Text>
            {["护照原件及复印件", "签证材料", "行程单", "保险单", "信用卡"].map((item, index) => (
              <View key={index} className="flex-row items-center gap-3 py-2">
                <View className="w-5 h-5 rounded-full border-2 border-gray-300" />
                <Text className="text-sm text-gray-700">{item}</Text>
              </View>
            ))}
          </View>
        </>
      );
    }

    if (planDetail.type === "study") {
      return (
        <>
          <View className="bg-white rounded-2xl p-5 mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">申请信息</Text>
            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-500">目标学历</Text>
                <Text className="text-sm text-gray-900">{c.degree}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-500">目标专业</Text>
                <Text className="text-sm text-gray-900">{c.major}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-500">学业背景</Text>
                <Text className="text-sm text-gray-900">{c.background}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-500">语言成绩</Text>
                <Text className="text-sm text-gray-900">{c.language}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-500">预算</Text>
                <Text className="text-sm text-gray-900">{c.financial}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-500">入学时间</Text>
                <Text className="text-sm text-gray-900">{c.timePlan}</Text>
              </View>
            </View>
          </View>

          <View className="bg-white rounded-2xl p-5 mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">AI 建议</Text>
            <Text className="text-sm text-gray-600 leading-6">
              您的背景非常优秀，建议申请美国TOP30的计算机科学硕士项目。雅思7+的成绩满足大部分学校要求，
              建议补充GRE成绩以增强竞争力。申请时间线：现在-6月准备材料，7-9月提交申请，
              10-12月等待offer。
            </Text>
          </View>

          <View className="bg-white rounded-2xl p-5 mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">申请清单</Text>
            {["成绩单", "推荐信2封", "个人陈述", "简历", "语言成绩单", "GRE成绩"].map((item, index) => (
              <View key={index} className="flex-row items-center gap-3 py-2">
                <View className="w-5 h-5 rounded-full border-2 border-gray-300" />
                <Text className="text-sm text-gray-700">{item}</Text>
              </View>
            ))}
          </View>
        </>
      );
    }

    if (planDetail.type === "work") {
      return (
        <>
          <View className="bg-white rounded-2xl p-5 mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">职业信息</Text>
            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-500">职业领域</Text>
                <Text className="text-sm text-gray-900">{c.jobField}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-500">证书学历</Text>
                <Text className="text-sm text-gray-900">{c.certificates}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-500">语言能力</Text>
                <Text className="text-sm text-gray-900">{c.language}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-500">工作经验</Text>
                <Text className="text-sm text-gray-900">{c.experience}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-500">家属随行</Text>
                <Text className="text-sm text-gray-900">{c.family}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-500">求职状态</Text>
                <Text className="text-sm text-gray-900">{c.jobStatus}</Text>
              </View>
            </View>
          </View>

          <View className="bg-white rounded-2xl p-5 mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">AI 建议</Text>
            <Text className="text-sm text-gray-600 leading-6">
              IT行业在美国就业市场前景良好，建议关注H1B签证政策变化。您的工作经验符合大多数
              科技公司的要求，建议提升英语口语能力以通过面试。可以考虑先申请OPT项目积累
              美国工作经验。
            </Text>
          </View>

          <View className="bg-white rounded-2xl p-5 mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">准备清单</Text>
            {["简历(英文)", "作品集", "推荐信", "身份证明", "学历认证"].map((item, index) => (
              <View key={index} className="flex-row items-center gap-3 py-2">
                <View className="w-5 h-5 rounded-full border-2 border-gray-300" />
                <Text className="text-sm text-gray-700">{item}</Text>
              </View>
            ))}
          </View>
        </>
      );
    }

    // immigration
    return (
      <>
        <View className="bg-white rounded-2xl p-5 mb-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">移民评估</Text>
          <View className="space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-500">家庭资产</Text>
              <Text className="text-sm text-gray-900">{c.asset}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-500">年龄</Text>
              <Text className="text-sm text-gray-900">{c.age}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-500">核心背景</Text>
              <Text className="text-sm text-gray-900">{c.background}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-500">移民目的</Text>
              <Text className="text-sm text-gray-900">{c.purpose}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-500">目标国家</Text>
              <Text className="text-sm text-gray-900">{c.target}</Text>
            </View>
          </View>
        </View>

        <View className="bg-white rounded-2xl p-5 mb-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">AI 建议</Text>
          <Text className="text-sm text-gray-600 leading-6">
            您的背景条件适合加拿大或澳大利亚的技术移民项目。加拿大Express Entry打分预估
            在400分以上，有较大机会获邀。建议提前准备语言考试(雅思G类)并完成学历认证。
            整体周期预计12-18个月。
          </Text>
        </View>

        <View className="bg-white rounded-2xl p-5 mb-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">办理清单</Text>
          {["护照", "雅思成绩单", "学历认证(ECA)", "工作证明", "资产证明", "无犯罪证明"].map((item, index) => (
            <View key={index} className="flex-row items-center gap-3 py-2">
              <View className="w-5 h-5 rounded-full border-2 border-gray-300" />
              <Text className="text-sm text-gray-700">{item}</Text>
            </View>
          ))}
        </View>
      </>
    );
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
      {/* 头部 */}
      <View className="bg-white px-4 py-3 flex-row items-center justify-between border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">规划详情</Text>
        <View className="flex-row gap-2">
          <TouchableOpacity className="p-1">
            <Share2 size={20} color="#374151" />
          </TouchableOpacity>
          <TouchableOpacity className="p-1">
            <MoreVertical size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* 标题卡片 */}
        <View className="bg-white rounded-2xl p-5 mb-4">
          <View className="flex-row items-center gap-3 mb-4">
            <View 
              className="w-14 h-14 rounded-xl items-center justify-center"
              style={{ backgroundColor: config.bgColor }}
            >
              <Icon size={28} color={config.color} />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900">{planDetail.title}</Text>
              <View className="flex-row items-center gap-1 mt-1">
                <MapPin size={14} color="#9CA3AF" />
                <Text className="text-sm text-gray-500">{planDetail.destination}</Text>
              </View>
            </View>
            <View 
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: "#F0FDF4" }}
            >
              <Text className="text-xs font-medium" style={{ color: "#16A34A" }}>
                已完成
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Clock size={14} color="#9CA3AF" />
            <Text className="text-xs text-gray-400">创建于 {planDetail.createdAt}</Text>
          </View>
        </View>

        {/* 内容区域 */}
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 40,
  },
});
