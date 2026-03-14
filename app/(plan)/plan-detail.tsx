import { router, useLocalSearchParams } from "expo-router";
import { Briefcase, Check, CheckCircle2, ChevronLeft, Circle, GraduationCap, Home, MapPin, MoreVertical, Plane, Share2 } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as planApi from "@/src/api/plan";
import type { Plan, Phase, Task, PlanType } from "@/src/types/plan";

const typeConfig = {
  tourism: { icon: Plane, label: "旅游", color: "#3B82F6", bgColor: "#EBF5FF" },
  study: { icon: GraduationCap, label: "留学", color: "#8B5CF6", bgColor: "#F5F3FF" },
  work: { icon: Briefcase, label: "工作", color: "#F59E0B", bgColor: "#FFFBEB" },
  immigration: { icon: Home, label: "定居", color: "#10B981", bgColor: "#ECFDF5" },
};

export default function PlanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);

  // 加载规划详情
  const loadPlanDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await planApi.getPlanDetail(Number(id));
      setPlan(data);
    } catch (error) {
      console.error("加载规划详情失败:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // 首次加载
  useEffect(() => {
    loadPlanDetail();
  }, [loadPlanDetail]);

  const planType = (plan?.type || "tourism") as PlanType;
  const config = typeConfig[planType] || typeConfig.tourism;
  const Icon = config.icon;
  const phases = plan?.phases || [];
  const destinationText = plan?.destination.country || plan?.destination.city || plan?.destination.province || "";

  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(
    new Set(phases.map(p => p.id))
  );

  // 展开所有阶段
  useEffect(() => {
    if (phases.length > 0) {
      setExpandedPhases(new Set(phases.map(p => p.id)));
    }
  }, [phases]);

  const togglePhase = (phaseId: number) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phaseId)) {
      newExpanded.delete(phaseId);
    } else {
      newExpanded.add(phaseId);
    }
    setExpandedPhases(newExpanded);
  };

  // 切换任务完成状态
  const handleToggleTask = async (task: Task) => {
    try {
      await planApi.completeTask({
        id: task.id,
        isCompleted: !task.isCompleted,
      });
      // 更新本地状态
      setPlan(prev => {
        if (!prev || !prev.phases) return prev;
        return {
          ...prev,
          phases: prev.phases.map(phase => ({
            ...phase,
            tasks: phase.tasks?.map(t =>
              t.id === task.id ? { ...t, isCompleted: !t.isCompleted } : t
            ),
          })),
        };
      });
    } catch (error) {
      console.error("更新任务状态失败:", error);
    }
  };

  const getPhaseProgress = (phase: Phase) => {
    const tasks = phase.tasks || [];
    const completedCount = tasks.filter(t => t.isCompleted).length;
    const total = tasks.length;
    return { completedCount, total, percentage: total > 0 ? Math.round((completedCount / total) * 100) : 0 };
  };

  const getOverallProgress = () => {
    const allTasks = phases.flatMap(p => p.tasks || []);
    const completedTasks = allTasks.filter(t => t.isCompleted).length;
    const totalTasks = allTasks.length;
    return { completedTasks, totalTasks, percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0 };
  };

  if (loading || !plan) {
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

  const overall = getOverallProgress();

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
      {/* 头部 */}
      <View className="px-4 py-3 flex-row items-center justify-between">
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

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 基本信息卡片 */}
        <View className="bg-white mx-4 mt-4 rounded-2xl p-5">
          <View className="flex-row items-center gap-3 mb-4">
            <View
              className="w-14 h-14 rounded-xl items-center justify-center"
              style={{ backgroundColor: config.bgColor }}
            >
              <Icon size={28} color={config.color} />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900">{plan.title}</Text>
              <View className="flex-row items-center gap-1 mt-1">
                <MapPin size={14} color="#9CA3AF" />
                <Text className="text-sm text-gray-500">{destinationText}</Text>
              </View>
            </View>
          </View>

          {/* 整体进度 */}
          <View className="bg-gray-50 rounded-xl p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-medium text-gray-700">总体进度</Text>
              <Text className="text-sm font-semibold" style={{ color: config.color }}>
                {overall.completedTasks}/{overall.totalTasks} 任务
              </Text>
            </View>
            <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <View
                className="h-full rounded-full"
                style={{
                  width: `${overall.percentage}%`,
                  backgroundColor: config.color
                }}
              />
            </View>
          </View>
        </View>

        {/* 阶段时间线 */}
        <View className="p-4 pb-20">
          {phases.map((phase, index) => {
            const progress = getPhaseProgress(phase);
            const isCompleted = progress.completedCount === progress.total;
            const isInProgress = progress.completedCount > 0 && !isCompleted;
            const isExpanded = expandedPhases.has(phase.id);

            return (
              <View key={phase.id} className="mb-3">
                {/* 阶段标题 - 可点击展开/收起任务列表 */}
                <TouchableOpacity
                  className="bg-white rounded-t-xl"
                  activeOpacity={0.7}
                  onPress={() => togglePhase(phase.id)}
                >
                  <View className="flex-row items-center gap-3 p-4">
                    {/* 时间线节点 */}
                    <View className="items-center">
                      <View
                        className="w-8 h-8 rounded-full items-center justify-center"
                        style={{
                          backgroundColor: isCompleted
                            ? "#10B981"
                            : isInProgress
                              ? "#10B98120"
                              : "#F3F4F6"
                        }}
                      >
                        {isCompleted ? (
                          <Check size={16} color="#FFFFFF" />
                        ) : (
                          <Text
                            className="text-sm font-semibold"
                            style={{ color: isInProgress ? "#10B981" : "#9CA3AF" }}
                          >
                            {index + 1}
                          </Text>
                        )}
                      </View>
                      {index < phases.length - 1 && (
                        <View
                          className="w-0.5 flex-1 my-1"
                          style={{
                            backgroundColor: isCompleted ? "#10B981" : "#E5E7EB",
                            minHeight: 20
                          }}
                        />
                      )}
                    </View>

                    {/* 阶段内容 */}
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900">
                        {phase.title}
                      </Text>
                      {phase.description && (
                        <Text className="text-xs text-gray-500 mt-0.5">
                          {phase.description}
                        </Text>
                      )}
                    </View>

                    {/* 圆形进度指示器 - 绿色 */}
                    <View className="items-center">
                      <View
                        className="w-10 h-10 rounded-full items-center justify-center border-2"
                        style={{
                          borderColor: "#10B981",
                          backgroundColor: isCompleted ? "#10B981" : 'transparent'
                        }}
                      >
                        {isCompleted ? (
                          <Check size={16} color="#FFFFFF" />
                        ) : (
                          <Text
                            className="text-xs font-semibold"
                            style={{ color: "#10B981" }}
                          >
                            {progress.percentage}%
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* 任务列表 - 展开/收起 */}
                {isExpanded && (
                  <View className="bg-white rounded-b-xl border-t border-gray-50">
                    {(phase.tasks || []).map((task) => {
                      return (
                        <View
                          key={task.id}
                          className="flex-row items-center gap-3 px-4 py-3 border-b border-gray-50"
                        >
                          {/* 点击 icon 切换完成状态 */}
                          <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => handleToggleTask(task)}
                          >
                            {task.isCompleted ? (
                              <CheckCircle2 size={20} color="#10B981" />
                            ) : (
                              <Circle size={20} color="#D1D5DB" />
                            )}
                          </TouchableOpacity>
                          {/* 点击文字进入任务详情 */}
                          <TouchableOpacity
                            className="flex-1"
                            activeOpacity={0.7}
                            onPress={() => router.push({
                              pathname: "/(plan)/task-detail",
                              params: {
                                id: String(task.id),
                              }
                            })}
                          >
                            <Text
                              className={`text-sm ${
                                task.isCompleted ? "text-gray-400 line-through" : "text-gray-700"
                              }`}
                            >
                              {task.title}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
