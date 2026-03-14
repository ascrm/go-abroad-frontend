import { router, useLocalSearchParams } from "expo-router";
import { BookOpen, Briefcase, Calculator, ChevronLeft, ExternalLink, FileText, Globe, GraduationCap, Home, Plane, Sparkles } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { Linking, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as planApi from "@/src/api/plan";
import type { Task } from "@/src/types/plan";

const typeConfig = {
  tourism: { icon: Plane, label: "旅游规划", color: "#3B82F6", bgColor: "#EBF5FF" },
  study: { icon: GraduationCap, label: "留学规划", color: "#8B5CF6", bgColor: "#F5F3FF" },
  work: { icon: Briefcase, label: "工作规划", color: "#F59E0B", bgColor: "#FFFBEB" },
  immigration: { icon: Home, label: "定居规划", color: "#10B981", bgColor: "#ECFDF5" },
};

const iconMap: Record<string, any> = {
  Plane, Globe, Calculator, BookOpen, FileText, GraduationCap, Briefcase, Home
};

const defaultTaskDetail = {
  description: "这是一个待完成的任务，请按照规划完成相关步骤。",
  tips: [
    "仔细阅读任务要求",
    "按步骤完成各项准备",
    "如有疑问可咨询专业人士"
  ],
  quickLinks: []
};

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiSuggestionLoading, setAiSuggestionLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  // 加载任务详情
  const loadTaskDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await planApi.getTaskDetail(Number(id));
      setTask(data);
      // 如果有 AI 建议则显示
      if (data.aiSuggestion) {
        setAiSuggestion(data.aiSuggestion);
      }
    } catch (error) {
      console.error("加载任务详情失败:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // 首次加载
  useEffect(() => {
    loadTaskDetail();
  }, [loadTaskDetail]);

  // 获取 AI 建议
  const handleGetAISuggestion = async () => {
    if (!id) return;
    setAiSuggestionLoading(true);
    try {
      const response = await planApi.getTaskAISuggestion(Number(id));
      setAiSuggestion(response.suggestion);
      // 更新任务数据
      setTask(prev => prev ? { ...prev, aiSuggestion: response.suggestion } : null);
    } catch (error) {
      console.error("获取 AI 建议失败:", error);
    } finally {
      setAiSuggestionLoading(false);
    }
  };

  const handleOpenLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error("无法打开链接:", error);
    }
  };

  if (loading || !task) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
        <View className="px-4 py-3 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="p-1">
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-400">加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // 如果没有预设的详细数据，使用任务自带的 description
  const taskDetail = {
    description: task.description || defaultTaskDetail.description,
    tips: task.aiSuggestion ? task.aiSuggestion.split('\n').filter(t => t.trim()) : defaultTaskDetail.tips,
    quickLinks: task.quickEntries?.map(entry => ({
      label: entry.title,
      url: entry.url,
      icon: entry.icon || "Globe"
    })) || []
  };

  const config = typeConfig.tourism;
  const typeLabel = config.label;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
      {/* 头部 */}
      <View className="px-4 py-3 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">任务详情</Text>
        <View className="w-6" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 基本信息 */}
        <View className="bg-white mx-4 mt-4 rounded-2xl p-5">
          <View className="flex-row items-center gap-2 mb-3">
            <View className="px-2 py-1 bg-green-50 rounded-md">
              <Text className="text-xs font-medium text-green-700">{typeLabel}</Text>
            </View>
            {task.isCompleted && (
              <View className="px-2 py-1 bg-blue-50 rounded-md">
                <Text className="text-xs font-medium text-blue-700">已完成</Text>
              </View>
            )}
          </View>
          <Text className="text-xl font-bold text-gray-900 mb-2">{task.title}</Text>
          {task.description && (
            <Text className="text-sm text-gray-500">{task.description}</Text>
          )}
        </View>

        {/* 任务说明 */}
        <View className="bg-white mx-4 mt-3 rounded-2xl p-5">
          <View className="flex-row items-center gap-2 mb-3">
            <Sparkles size={18} color="#10B981" />
            <Text className="text-base font-semibold text-gray-900">任务说明</Text>
          </View>
          <Text className="text-sm text-gray-600 leading-6">
            {taskDetail.description}
          </Text>
        </View>

        {/* AI 建议 */}
        <View className="bg-white mx-4 mt-3 rounded-2xl p-5">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-2">
              <Sparkles size={18} color="#8B5CF6" />
              <Text className="text-base font-semibold text-gray-900">AI 建议</Text>
            </View>
            {!aiSuggestion && (
              <TouchableOpacity
                onPress={handleGetAISuggestion}
                disabled={aiSuggestionLoading}
                className="px-3 py-1.5 bg-purple-50 rounded-lg"
              >
                <Text className="text-xs font-medium text-purple-600">
                  {aiSuggestionLoading ? "生成中..." : "获取建议"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {aiSuggestion ? (
            <View className="gap-3">
              {aiSuggestion.split('\n').filter(t => t.trim()).map((tip, index) => (
                <View key={index} className="flex-row gap-3">
                  <View className="w-5 h-5 rounded-full bg-purple-50 items-center justify-center mt-0.5">
                    <Text className="text-xs font-medium text-purple-600">{index + 1}</Text>
                  </View>
                  <Text className="text-sm text-gray-600 flex-1 leading-5">{tip}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-sm text-gray-400">点击获取建议获取 AI 智能建议</Text>
          )}
        </View>

        {/* 快捷入口 */}
        {taskDetail.quickLinks.length > 0 && (
          <View className="bg-white mx-4 mt-3 rounded-2xl p-5 mb-20">
            <View className="flex-row items-center gap-2 mb-4">
              <ExternalLink size={18} color="#3B82F6" />
              <Text className="text-base font-semibold text-gray-900">快捷入口</Text>
            </View>
            <View className="gap-3">
              {taskDetail.quickLinks.map((link: any, index: number) => {
                const IconComponent = iconMap[link.icon] || Globe;
                return (
                  <TouchableOpacity
                    key={index}
                    className="flex-row items-center justify-between p-4 bg-gray-50 rounded-xl"
                    activeOpacity={0.7}
                    onPress={() => handleOpenLink(link.url)}
                  >
                    <View className="flex-row items-center gap-3">
                      <View className="w-10 h-10 bg-white rounded-lg items-center justify-center">
                        <IconComponent size={20} color="#3B82F6" />
                      </View>
                      <Text className="text-base font-medium text-gray-900">{link.label}</Text>
                    </View>
                    <ExternalLink size={18} color="#9CA3AF" />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* 底部空隙 */}
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
