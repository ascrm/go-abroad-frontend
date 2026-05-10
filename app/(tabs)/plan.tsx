import * as planApi from "@/src/api/plan";
import type { Plan, Phase, Task } from "@/src/types/plan";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState, useRef, useEffect } from "react";
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PlanEmptyState from "../../components/page/plan/PlanEmptyState";
import { usePlanStore } from "@/src/stores/planStore";
import {
  MapPin, Plane, GraduationCap, Briefcase, Home,
  ChevronRight, Check, Target, Sparkles, Bell, Trophy
} from "lucide-react-native";
import { formatDate } from "@/src/utils/time";

// ============================================
// Design System - Monochrome with Animation
// ============================================
const COLORS = {
  primary: "#18181B",
  onPrimary: "#FFFFFF",
  secondary: "#27272A",
  accent: "#3F3F46",
  background: "#FAFAFA",
  foreground: "#0A0A0A",
  muted: "#F4F4F5",
  border: "#E4E4E7",
  cardBg: "#FFFFFF",
  textPrimary: "#18181B",
  textSecondary: "#52525B",
  textMuted: "#A1A1AA",
  destructive: "#18181B",
  success: "#22C55E",
  successLight: "#F0FDF4",
  warning: "#71717A",
  warningLight: "#F4F4F5",
  info: "#3F3F46",
  infoLight: "#F4F4F5",
};

// ============================================
// 骨架屏组件 - 让加载更丝滑
// ============================================
function SkeletonCard() {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  return (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonHeader}>
          <Animated.View style={[styles.skeletonBadge, { opacity }]} />
          <Animated.View style={[styles.skeletonBadgeSmall, { opacity }]} />
        </View>
        <Animated.View style={[styles.skeletonTitle, { opacity }]} />
        <Animated.View style={[styles.skeletonSubtitle, { opacity }]} />
        <Animated.View style={[styles.skeletonProgress, { opacity }]} />
        <View style={styles.skeletonStats}>
          <Animated.View style={[styles.skeletonStat, { opacity }]} />
          <Animated.View style={[styles.skeletonStat, { opacity }]} />
          <Animated.View style={[styles.skeletonStat, { opacity }]} />
        </View>
      </View>
    </View>
  );
}

function SkeletonPhaseCard() {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 1],
  });

  return (
    <View style={styles.skeletonPhaseCard}>
      <View style={styles.skeletonTabs}>
        {[1, 2, 3].map((i) => (
          <Animated.View key={i} style={[styles.skeletonTab, { opacity }]} />
        ))}
      </View>
      <View style={styles.skeletonTasks}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.skeletonTaskRow}>
            <Animated.View style={[styles.skeletonTaskDot, { opacity }]} />
            <Animated.View style={[styles.skeletonTaskText, { opacity }]} />
          </View>
        ))}
      </View>
    </View>
  );
}

const typeConfig: Record<string, { icon: any; label: string; color: string; bg: string }> = {
  tourism: { icon: Plane, label: "旅游", color: "#18181B", bg: "#F4F4F5" },
  study: { icon: GraduationCap, label: "留学", color: "#18181B", bg: "#F4F4F5" },
  work: { icon: Briefcase, label: "工作", color: "#18181B", bg: "#F4F4F5" },
  immigration: { icon: Home, label: "定居", color: "#18181B", bg: "#F4F4F5" },
};

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  completed: { label: "已完成", bg: "#F0FDF4", text: "#22C55E" },
  generating: { label: "进行中", bg: "#F0FDF4", text: "#22C55E" },
  paused: { label: "已暂停", bg: "#FEF2F2", text: "#DC2626" },
  draft: { label: "待开始", bg: "#F4F4F5", text: "#71717A" },
  archived: { label: "已归档", bg: "#F4F4F5", text: "#A1A1AA" },
};

// ============================================
// 子组件 - 带动画的Tab切换器
// ============================================
function PhaseTabSwitcher({ phases, selectedPhaseId, onPhaseSelect }: {
  phases: Phase[];
  selectedPhaseId: number | null;
  onPhaseSelect: (phaseId: number) => void;
}) {
  const [tabLayouts, setTabLayouts] = useState<Record<number, { x: number; width: number }>>({});
  const indicatorPosition = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const selectedLayout = tabLayouts[selectedPhaseId || 0];
    if (selectedLayout) {
      Animated.spring(indicatorPosition, {
        toValue: selectedLayout.x + selectedLayout.width / 2 - 20,
        useNativeDriver: true,
        tension: 100,
        friction: 12,
      }).start();
    }
  }, [selectedPhaseId, tabLayouts, indicatorPosition]);

  const handleLayout = (phaseId: number, event: any) => {
    const { x, width } = event.nativeEvent.layout;
    setTabLayouts(prev => ({ ...prev, [phaseId]: { x, width } }));
  };

  return (
    <View style={styles.tabContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContent}>
        {phases.map((phase) => {
          const isSelected = phase.id === selectedPhaseId;
          return (
            <TouchableOpacity
              key={phase.id}
              style={styles.tabItem}
              onPress={() => onPhaseSelect(phase.id)}
              onLayout={(e) => handleLayout(phase.id, e)}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={isSelected ? { selected: true } : {}}
              accessibilityLabel={`阶段: ${phase.title}`}
            >
              <Text style={[
                styles.tabItemText,
                isSelected && styles.tabItemTextSelected
              ]}>
                {phase.title}
              </Text>
              {isSelected && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      {/* 移动的指示线 */}
      <Animated.View
        style={[
          styles.tabMovingIndicator,
          { transform: [{ translateX: indicatorPosition }] }
        ]}
      />
    </View>
  );
}

// ============================================
// 子组件 - 带动画的任务列表
// ============================================
function TaskListView({ phase, onTaskComplete }: {
  phase: Phase | null;
  onTaskComplete?: (taskId: number, phaseId: number) => void;
}) {
  if (!phase || !phase.tasks || phase.tasks.length === 0) {
    return (
      <View style={styles.emptyTaskContainer}>
        <Text style={styles.emptyTaskText}>该阶段暂无任务</Text>
      </View>
    );
  }

  // 计算未完成任务的序号（保持稳定）
  let pendingIndex = 1;

  return (
    <View style={styles.taskListContainer}>
      {phase.tasks.map((task) => {
        const isCompleted = task.isCompleted;
        const currentPendingIndex = isCompleted ? 0 : pendingIndex++;

        return (
          <AnimatedTaskRow
            key={task.id}
            task={task}
            pendingIndex={currentPendingIndex}
            onComplete={() => onTaskComplete?.(task.id, phase.id)}
          />
        );
      })}
    </View>
  );
}

// 动画任务行组件
function AnimatedTaskRow({ task, pendingIndex, onComplete }: {
  task: Task;
  pendingIndex: number;
  onComplete?: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const checkAnim = useRef(new Animated.Value(task.isCompleted ? 1 : 0)).current;

  useEffect(() => {
    if (task.isCompleted) {
      // 完成动画：缩放 + 打勾
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 10,
        }),
      ]).start();

      // 打勾弹入动画
      Animated.spring(checkAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 150,
        friction: 8,
      }).start();
    }
  }, [task.isCompleted]);

  return (
    <Animated.View style={[styles.taskRow, { transform: [{ scale: scaleAnim }] }]}>
      <Animated.View style={[
        styles.taskIndexDot,
        task.isCompleted ? styles.taskIndexDotCompleted : styles.taskIndexDotPending,
        {
          transform: [{
            scale: checkAnim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [1, 1.2, 1],
            })
          }]
        }
      ]}>
        {task.isCompleted ? (
          <Check size={11} color="#FFFFFF" strokeWidth={3} />
        ) : (
          <Text style={styles.taskIndexText}>{pendingIndex}</Text>
        )}
      </Animated.View>
      <Text style={[
        styles.taskTitle,
        task.isCompleted && styles.taskTitleCompleted
      ]} numberOfLines={2}>
        {task.title}
      </Text>
    </Animated.View>
  );
}

// ============================================
// 子组件 - 当前任务卡片
// ============================================
function CurrentTaskDetailCard({ task, onComplete }: {
  task: Task | null;
  onComplete?: () => void;
}) {
  const [showAiSuggestion, setShowAiSuggestion] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleComplete = () => {
    // 淡出动画
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onComplete?.();
    });
  };

  if (!task) return null;

  const suggestion = "建议先完成语言考试备考，这将为后续申请材料准备打下坚实基础。";

  return (
    <Animated.View style={[styles.taskDetailCard, { opacity: fadeAnim }]}>
      <View style={styles.taskDetailTopBar}>
        <View style={styles.taskDetailBadge}>
          <Target size={13} color={COLORS.textSecondary} />
          <Text style={styles.taskDetailBadgeText}>当前任务</Text>
        </View>
        <View style={styles.taskDetailActions}>
          <TouchableOpacity
            style={styles.taskDetailActionBtn}
            activeOpacity={0.7}
            accessibilityLabel="设置提醒"
            accessibilityRole="button"
          >
            <Bell size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.taskDetailActionBtn}
            onPress={() => setShowAiSuggestion(!showAiSuggestion)}
            activeOpacity={0.7}
            accessibilityLabel="获取AI建议"
            accessibilityRole="button"
          >
            <Sparkles size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.taskDetailTitle}>{task.title}</Text>

      {task.description && (
        <Text style={styles.taskDetailDesc}>{task.description}</Text>
      )}

      {showAiSuggestion && (
        <Animated.View style={styles.aiSuggestionBox}>
          <View style={styles.aiSuggestionHeader}>
            <Sparkles size={14} color={COLORS.textSecondary} />
            <Text style={styles.aiSuggestionTitle}>智能建议</Text>
          </View>
          <Text style={styles.aiSuggestionText}>{suggestion}</Text>
        </Animated.View>
      )}

      <TouchableOpacity
        style={styles.completeBtn}
        onPress={handleComplete}
        activeOpacity={0.8}
        accessibilityLabel="标记任务完成"
        accessibilityRole="button"
      >
        <Check size={18} color={COLORS.onPrimary} strokeWidth={2.5} />
        <Text style={styles.completeBtnText}>完成</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ============================================
// 子组件 - 恭喜完成卡片
// ============================================
function CompletionCelebrationCard() {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 入场动画：弹入 + 淡入
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 8,
      }),
    ]).start();

    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[
      styles.celebrationCard,
      {
        opacity: opacityAnim,
        transform: [{ scale: scaleAnim }]
      }
    ]}>
      <View style={styles.celebrationIconContainer}>
        <Trophy size={32} color={COLORS.success} />
      </View>
      <Text style={styles.celebrationTitle}>恭喜！</Text>
      <Text style={styles.celebrationSubtitle}>你已经完成了所有规划任务</Text>
      <View style={styles.celebrationStats}>
        <View style={styles.celebrationStatItem}>
          <Check size={16} color={COLORS.success} />
          <Text style={styles.celebrationStatText}>全部完成</Text>
        </View>
      </View>
    </Animated.View>
  );
}

// ============================================
// 主页面
// ============================================
export default function PlanScreen() {
  const { plans, fetchPlans } = usePlanStore();
  const [generatingPlan, setGeneratingPlan] = useState<Plan | null>(null);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedPhaseId, setSelectedPhaseId] = useState<number | null>(null);
  const contentFadeAnim = useRef(new Animated.Value(0)).current;

  const getSelectedPhase = useCallback(() => {
    if (!selectedPhaseId) {
      return phases.find(p => p.tasks && !p.tasks.every(t => t.isCompleted)) || phases[0] || null;
    }
    return phases.find(p => p.id === selectedPhaseId) || null;
  }, [phases, selectedPhaseId]);

  const loadPlanData = useCallback(async () => {
    setLoading(true);
    try {
      // 获取所有规划列表
      await fetchPlans(true);

      // 获取进行中的规划
      const plan = await planApi.getGeneratingPlan();

      if (plan) {
        // 有进行中的规划，加载其详情
        const phaseRes = await planApi.getPhaseList(plan.id);
        const phaseList = Array.isArray(phaseRes) ? phaseRes : (phaseRes?.list || []);

        const phasesWithTasks = await Promise.all(
          phaseList.map(async (phase: Phase) => {
            const taskRes = await planApi.getTaskList(phase.id);
            const taskList = Array.isArray(taskRes) ? taskRes : (taskRes?.list || []);
            return { ...phase, tasks: taskList };
          })
        );

        setGeneratingPlan(plan);
        setPhases(phasesWithTasks);

        const defaultPhase = phasesWithTasks.find(p => p.tasks && !p.tasks.every(t => t.isCompleted)) || phasesWithTasks[0];
        if (defaultPhase) {
          setSelectedPhaseId(defaultPhase.id);
        }
      } else {
        setGeneratingPlan(null);
        setPhases([]);
      }

      // 数据加载完成，触发淡入动画
      setLoading(false);
      setIsHydrated(true);
      Animated.timing(contentFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error("加载规划失败:", error);
      setLoading(false);
      setIsHydrated(true);
    }
  }, [fetchPlans, contentFadeAnim]);

  useFocusEffect(
    useCallback(() => {
      // 重置状态用于每次进入页面
      contentFadeAnim.setValue(0);
      setIsHydrated(false);
      loadPlanData();
    }, [loadPlanData, contentFadeAnim])
  );

  const handleTaskComplete = async (taskId: number, phaseId: number) => {
    try {
      const task = phases.flatMap(p => p.tasks || []).find(t => t.id === taskId);
      if (!task) return;

      await planApi.completeTask({ id: taskId, isCompleted: !task.isCompleted });
      setPhases(prev => prev.map(phase => {
        if (phase.id !== phaseId) return phase;
        return {
          ...phase,
          tasks: phase.tasks?.map(t =>
            t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
          ),
        };
      }));
    } catch (error) {
      console.error("更新任务状态失败:", error);
    }
  };

  const handlePhaseSelect = (phaseId: number) => {
    setSelectedPhaseId(phaseId);
  };

  const getProgress = () => {
    if (phases.length === 0) return { completed: 0, total: 0, percent: 0 };
    const allTasks = phases.flatMap(p => p.tasks || []);
    const total = allTasks.length;
    const completed = allTasks.filter(t => t.isCompleted).length;
    return { total, completed, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  const getGlobalCurrentTask = useCallback(() => {
    for (const phase of phases) {
      if (phase.tasks && phase.tasks.length > 0) {
        const incompleteTasks = phase.tasks.filter(t => !t.isCompleted);
        if (incompleteTasks.length > 0) {
          return incompleteTasks[0];
        }
      }
    }
    return null;
  }, [phases]);

  const isAllCompleted = useCallback(() => {
    if (phases.length === 0) return false;
    const allTasks = phases.flatMap(p => p.tasks || []);
    return allTasks.length > 0 && allTasks.every(t => t.isCompleted);
  }, [phases]);

  // 判断是否有规划但没有进行中的
  const hasPlansButNoGenerating = !loading && isHydrated && plans.length > 0 && !generatingPlan;

  if (!loading && !generatingPlan && plans.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
        <PlanEmptyState
          onCreatePlan={() => router.push("/(plan)/create-plan")}
          colors={COLORS}
        />
      </SafeAreaView>
    );
  }

  if (hasPlansButNoGenerating) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
        <PlanEmptyState
          onViewPlans={() => router.push("/(plan)/plan-list")}
          colors={COLORS}
          hasPlans={true}
        />
      </SafeAreaView>
    );
  }

  const progress = getProgress();
  const type = generatingPlan ? (typeConfig[generatingPlan.type as string] || typeConfig.tourism) : null;
  const status = generatingPlan ? (statusConfig[generatingPlan.status as string] || statusConfig.draft) : null;
  const IconComp = type?.icon;
  const destinationText = generatingPlan?.destination.country ||
    generatingPlan?.destination.city ||
    generatingPlan?.destination.province || "";
  const selectedPhase = getSelectedPhase();
  const globalCurrentTask = getGlobalCurrentTask();
  const allCompleted = isAllCompleted();

  // 是否显示骨架屏（首次加载且未获取到数据时）
  const showSkeleton = loading && !generatingPlan;
  // 是否显示内容（骨架屏完成后或已有数据时）
  const showContent = isHydrated || (!loading && (generatingPlan || !showSkeleton));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={true}
      >
        {/* 头部 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>出国规划</Text>
          <TouchableOpacity
            style={styles.allPlansBtn}
            activeOpacity={0.7}
            onPress={() => router.push("/(plan)/plan-list")}
            accessibilityLabel="查看所有规划"
            accessibilityRole="button"
          >
            <Text style={styles.allPlansText}>所有规划</Text>
            <ChevronRight size={14} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* 骨架屏 - 首次加载时显示 */}
        {showSkeleton && (
          <View style={styles.featuredSection}>
            <SkeletonCard />
            <SkeletonPhaseCard />
          </View>
        )}

        {/* 实际内容 - 带淡入动画 */}
        {showContent && generatingPlan && type && status && (
          <Animated.View style={[styles.featuredSection, { opacity: contentFadeAnim }]}>
            {/* 主卡片 */}
            <TouchableOpacity
              style={styles.mainCard}
              activeOpacity={0.95}
              onPress={() => router.push({ pathname: "/(plan)/plan-detail", params: { id: String(generatingPlan.id) } })}
              accessibilityLabel={`查看 ${generatingPlan.title} 详情`}
              accessibilityRole="link"
            >
              <View style={styles.mainCardContent}>
                <View style={styles.mainCardHeader}>
                  <View style={styles.typeBadge}>
                    <IconComp size={14} color={COLORS.textSecondary} />
                    <Text style={styles.typeLabel}>{type.label}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                    <View style={[styles.statusDot, { backgroundColor: status.text }]} />
                    <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
                  </View>
                </View>

                <Text style={styles.planTitle}>{generatingPlan.title}</Text>
                <View style={styles.destinationRow}>
                  <MapPin size={13} color={COLORS.textMuted} />
                  <Text style={styles.destinationText}>{destinationText}</Text>
                </View>

                {progress.total > 0 && (
                  <View style={styles.progressSection}>
                    <View style={styles.progressBarBg}>
                      <Animated.View
                        style={[
                          styles.progressBarFill,
                          { width: `${progress.percent}%` }
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>{progress.percent}%</Text>
                  </View>
                )}

                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: COLORS.success }]}>{progress.completed}</Text>
                    <Text style={styles.statLabel}>已完成</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{progress.total - progress.completed}</Text>
                    <Text style={styles.statLabel}>待完成</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{phases.length}</Text>
                    <Text style={styles.statLabel}>阶段</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {/* 阶段+任务卡片 */}
            {phases.length > 0 && (
              <View style={styles.phaseTaskCard}>
                <PhaseTabSwitcher
                  phases={phases}
                  selectedPhaseId={selectedPhaseId}
                  onPhaseSelect={handlePhaseSelect}
                />

                <TaskListView
                  phase={selectedPhase}
                  onTaskComplete={handleTaskComplete}
                />
              </View>
            )}

            {/* 当前任务卡片 或 恭喜完成卡片 */}
            {allCompleted ? (
              <CompletionCelebrationCard />
            ) : globalCurrentTask ? (
              <CurrentTaskDetailCard
                task={globalCurrentTask}
                onComplete={() => {
                  const phase = phases.find(p => p.tasks?.some(t => t.id === globalCurrentTask.id));
                  if (phase) {
                    handleTaskComplete(globalCurrentTask.id, phase.id);
                  }
                }}
              />
            ) : null}
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================
// Styles
// ============================================
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: { fontSize: 28, fontWeight: "700", color: COLORS.textPrimary, letterSpacing: -0.5 },
  allPlansBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: COLORS.muted,
    borderRadius: 20,
  },
  allPlansText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: "500" },

  // Loading
  loadingContainer: { padding: 40, alignItems: "center" },
  loadingText: { fontSize: 14, color: COLORS.textMuted },

  // Skeleton Card
  skeletonCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  skeletonContent: { padding: 20 },
  skeletonHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  skeletonBadge: {
    width: 70,
    height: 24,
    borderRadius: 8,
    backgroundColor: COLORS.muted,
  },
  skeletonBadgeSmall: {
    width: 60,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.muted,
  },
  skeletonTitle: {
    width: "70%",
    height: 24,
    borderRadius: 6,
    backgroundColor: COLORS.muted,
    marginBottom: 10,
  },
  skeletonSubtitle: {
    width: "45%",
    height: 16,
    borderRadius: 4,
    backgroundColor: COLORS.muted,
    marginBottom: 18,
  },
  skeletonProgress: {
    width: "100%",
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.muted,
    marginBottom: 18,
  },
  skeletonStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: COLORS.muted,
    borderRadius: 12,
  },
  skeletonStat: {
    width: 50,
    height: 30,
    borderRadius: 6,
    backgroundColor: COLORS.border,
  },

  // Skeleton Phase Card
  skeletonPhaseCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  skeletonTabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 24,
  },
  skeletonTab: {
    width: 50,
    height: 20,
    borderRadius: 4,
    backgroundColor: COLORS.muted,
  },
  skeletonTasks: {
    padding: 20,
  },
  skeletonTaskRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  skeletonTaskDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.muted,
    marginRight: 14,
  },
  skeletonTaskText: {
    flex: 1,
    height: 18,
    borderRadius: 4,
    backgroundColor: COLORS.muted,
  },

  // Featured Section
  featuredSection: { paddingHorizontal: 20, gap: 16 },

  // Main Card
  mainCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mainCardContent: { padding: 20 },
  mainCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: COLORS.muted,
  },
  typeLabel: { fontSize: 12, fontWeight: "600", color: COLORS.textSecondary },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: "600" },
  planTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  destinationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 16,
  },
  destinationText: { fontSize: 14, color: COLORS.textSecondary },

  // Progress
  progressSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.muted,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  progressText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },

  // Stats Row
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: COLORS.muted,
    borderRadius: 12,
  },
  statItem: { alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "700", color: COLORS.textPrimary, marginBottom: 2 },
  statLabel: { fontSize: 11, color: COLORS.textMuted },
  statDivider: { width: 1, height: 28, backgroundColor: COLORS.border },

  // Phase + Task Card
  phaseTaskCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  // Tab Switcher
  tabContainer: {
    borderBottomWidth: 0,
    position: "relative",
  },
  tabScrollContent: {
    paddingHorizontal: 16,
    gap: 24,
  },
  tabItem: {
    paddingVertical: 14,
    alignItems: "center",
    position: "relative",
  },
  tabItemText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.textMuted,
  },
  tabItemTextSelected: {
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 1,
  },
  tabMovingIndicator: {
    position: "absolute",
    bottom: 0,
    left: 16,
    width: 40,
    height: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 1,
  },

  // Task List
  taskListContainer: {
    padding: 20,
  },
  emptyTaskContainer: {
    padding: 32,
    alignItems: "center",
  },
  emptyTaskText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  taskIndexDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    marginTop: 1,
  },
  taskIndexDotPending: {
    backgroundColor: COLORS.primary,
  },
  taskIndexDotCompleted: {
    backgroundColor: COLORS.success,
  },
  taskIndexText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.onPrimary,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.textPrimary,
    flex: 1,
    lineHeight: 22,
  },
  taskTitleCompleted: {
    color: COLORS.textMuted,
  },

  // Task Detail Card
  taskDetailCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
  },
  taskDetailTopBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  taskDetailBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: COLORS.muted,
  },
  taskDetailBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  taskDetailActions: {
    flexDirection: "row",
    gap: 4,
  },
  taskDetailActionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.muted,
    alignItems: "center",
    justifyContent: "center",
  },
  taskDetailTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  taskDetailDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },

  // AI Suggestion Box
  aiSuggestionBox: {
    backgroundColor: COLORS.muted,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  aiSuggestionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  aiSuggestionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  aiSuggestionText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },

  // Complete Button
  completeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
  },
  completeBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.onPrimary,
  },

  // Celebration Card
  celebrationCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.success,
    padding: 28,
    alignItems: "center",
  },
  celebrationIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.successLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  celebrationTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.success,
    marginBottom: 8,
  },
  celebrationSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 20,
    textAlign: "center",
  },
  celebrationStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  celebrationStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  celebrationStatText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.success,
  },
});