import * as planApi from "@/src/api/plan";
import { usePlanStore } from "@/src/stores/planStore";
import type { Plan, Phase, Task } from "@/src/types/plan";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PlanEmptyState from "../../components/page/plan/PlanEmptyState";
import {
  Calendar1, MapPin, Plane, GraduationCap, Briefcase, Home,
  ChevronRight, Plus, Check, Circle, Target, Clock,
  Sparkles, ArrowRight
} from "lucide-react-native";
import { formatDate } from "@/src/utils/time";

// ============================================
// Design System - Soft UI Evolution
// ============================================
const COLORS = {
  primary: "#0D9488",
  onPrimary: "#FFFFFF",
  secondary: "#14B8A6",
  accent: "#F59E0B",
  background: "#F8FAFC",
  foreground: "#0F172A",
  muted: "#F1F5F9",
  border: "#E2E8F0",
  cardBg: "#FFFFFF",
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
  destructive: "#DC2626",
  success: "#059669",
  successLight: "#ECFDF5",
  warning: "#D97706",
  warningLight: "#FEF3C7",
  info: "#2563EB",
  infoLight: "#EFF6FF",
};

const typeConfig: Record<string, { icon: any; label: string; color: string; bg: string }> = {
  tourism: { icon: Plane, label: "旅游", color: "#3B82F6", bg: "rgba(59, 130, 246, 0.08)" },
  study: { icon: GraduationCap, label: "留学", color: "#8B5CF6", bg: "rgba(139, 92, 246, 0.08)" },
  work: { icon: Briefcase, label: "工作", color: "#F59E0B", bg: "rgba(245, 158, 11, 0.08)" },
  immigration: { icon: Home, label: "定居", color: "#10B981", bg: "rgba(16, 185, 129, 0.08)" },
};

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  completed: { label: "已完成", bg: "#ECFDF5", text: "#059669" },
  generating: { label: "进行中", bg: "#EFF6FF", text: "#2563EB" },
  draft: { label: "待开始", bg: "#FEF3C7", text: "#D97706" },
  archived: { label: "已归档", bg: "#F1F5F9", text: "#64748B" },
};

// ============================================
// 子组件
// ============================================

// 阶段概览组件
function PhaseOverview({ phases, planTypeColor }: {
  phases: Phase[];
  planTypeColor: string;
}) {
  const getPhaseStatus = (phase: Phase, index: number, prevCompleted: number) => {
    if (!phase.tasks || phase.tasks.length === 0) return "pending";
    const completed = phase.tasks.filter(t => t.isCompleted).length;
    if (completed === phase.tasks.length) return "completed";
    if (index === 0 || prevCompleted > 0) return "active";
    return "pending";
  };

  return (
    <View style={styles.phaseOverviewContainer}>
      <Text style={styles.sectionTitle}>阶段进度</Text>
      <View style={styles.phasesRow}>
        {phases.map((phase, index) => {
          const prevCompleted = phases.slice(0, index).reduce(
            (sum, p) => sum + (p.tasks?.filter(t => t.isCompleted).length || 0), 0
          );
          const phaseCompleted = phase.tasks?.filter(t => t.isCompleted).length || 0;
          const status = getPhaseStatus(phase, index, prevCompleted);

          return (
            <View key={phase.id} style={styles.phaseItem}>
              <View style={[
                styles.phaseIconWrapper,
                {
                  backgroundColor: status === "completed" ? COLORS.successLight
                    : status === "active" ? `${planTypeColor}15`
                    : COLORS.muted
                }
              ]}>
                {status === "completed" ? (
                  <Check size={18} color={COLORS.success} strokeWidth={2.5} />
                ) : (
                  <Circle
                    size={18}
                    color={status === "active" ? planTypeColor : COLORS.textMuted}
                    strokeWidth={status === "active" ? 2.5 : 2}
                  />
                )}
              </View>
              <Text style={[
                styles.phaseLabel,
                { color: status === "completed" ? COLORS.success
                  : status === "active" ? COLORS.textPrimary
                  : COLORS.textMuted }
              ]} numberOfLines={1}>
                {phase.title.length > 4 ? phase.title.slice(0, 4) + '...' : phase.title}
              </Text>
              {phase.tasks && (
                <Text style={[styles.phaseCount, { color: COLORS.textMuted }]}>
                  {phaseCompleted}/{phase.tasks.length}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

// 当前任务组件
function CurrentTasksSection({ phases, planTypeColor, onTaskToggle }: {
  phases: Phase[];
  planTypeColor: string;
  onTaskToggle?: (task: Task, phaseId: number) => void;
}) {
  const activePhase = phases.find(p => {
    if (!p.tasks || p.tasks.length === 0) return false;
    return !p.tasks.every(t => t.isCompleted);
  });

  if (!activePhase || !activePhase.tasks) return null;

  const incompleteTasks = activePhase.tasks.filter(t => !t.isCompleted);
  const displayTasks = incompleteTasks.slice(0, 3);

  return (
    <View style={styles.currentTasksContainer}>
      <View style={styles.currentTasksHeader}>
        <View style={[styles.currentTasksBadge, { backgroundColor: `${planTypeColor}12` }]}>
          <Target size={14} color={planTypeColor} />
          <Text style={[styles.currentTasksBadgeText, { color: planTypeColor }]}>
            {activePhase.title}
          </Text>
        </View>
      </View>

      {displayTasks.map((task) => (
        <Pressable
          key={task.id}
          style={({ pressed }) => [
            styles.taskItem,
            { backgroundColor: pressed ? COLORS.muted : COLORS.cardBg }
          ]}
          onPress={() => onTaskToggle?.(task, activePhase.id)}
        >
          <View style={[styles.taskCheckbox, { borderColor: planTypeColor }]}>
            {!task.isCompleted && <View style={[styles.taskCheckboxInner, { backgroundColor: planTypeColor }]} />}
          </View>
          <Text style={[styles.taskTitle, { color: COLORS.textPrimary }]} numberOfLines={1}>
            {task.title}
          </Text>
        </Pressable>
      ))}

      {incompleteTasks.length > 3 && (
        <TouchableOpacity style={styles.moreTasksBtn}>
          <Text style={styles.moreTasksText}>更多任务 (共{incompleteTasks.length}个)</Text>
          <ChevronRight size={14} color={COLORS.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// 下一步行动建议组件
function NextActionCard({ suggestion, planTypeColor }: {
  suggestion?: string;
  planTypeColor: string;
}) {
  if (!suggestion) return null;

  return (
    <View style={styles.nextActionContainer}>
      <View style={styles.nextActionHeader}>
        <Sparkles size={16} color={COLORS.accent} />
        <Text style={styles.nextActionTitle}>AI 建议</Text>
      </View>
      <Text style={styles.nextActionText}>{suggestion}</Text>
      <TouchableOpacity style={styles.nextActionBtn}>
        <Text style={[styles.nextActionBtnText, { color: planTypeColor }]}>查看详情</Text>
        <ArrowRight size={14} color={planTypeColor} />
      </TouchableOpacity>
    </View>
  );
}

// 时间节点组件
function TimelineSection({ phases }: { phases: Phase[] }) {
  const timeNodes = phases.flatMap(phase =>
    (phase.tasks || []).map(task => ({
      title: task.title,
      date: task.completedAt || task.createdAt,
      isCompleted: task.isCompleted
    }))
  ).slice(0, 4);

  return (
    <View style={styles.timelineContainer}>
      <View style={styles.timelineHeader}>
        <Clock size={16} color={COLORS.textSecondary} />
        <Text style={styles.timelineTitle}>近期任务</Text>
      </View>

      {timeNodes.map((node, index) => (
        <View key={index} style={styles.timelineItem}>
          <View style={[
            styles.timelineDot,
            { backgroundColor: node.isCompleted ? COLORS.success : COLORS.primary }
          ]} />
          <View style={styles.timelineContent}>
            <Text style={[
              styles.timelineItemTitle,
              { color: node.isCompleted ? COLORS.textMuted : COLORS.textPrimary }
            ]}>
              {node.title}
            </Text>
            <Text style={[styles.timelineDate, { color: COLORS.textMuted }]}>
              {formatDate(node.date)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// 统计概览组件
function StatsOverview({ plan }: { plan: Plan }) {
  const totalTasks = plan.phases?.flatMap(p => p.tasks || []).length || 0;
  const completedTasks = plan.phases?.flatMap(p => p.tasks || []).filter(t => t.isCompleted).length || 0;
  const totalPhases = plan.phases?.length || 0;

  return (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{totalPhases}</Text>
        <Text style={styles.statLabel}>总阶段</Text>
      </View>
      <View style={[styles.statDivider, { backgroundColor: COLORS.border }]} />
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{totalTasks}</Text>
        <Text style={styles.statLabel}>总任务</Text>
      </View>
      <View style={[styles.statDivider, { backgroundColor: COLORS.border }]} />
      <View style={styles.statItem}>
        <Text style={[styles.statValue, { color: COLORS.success }]}>{completedTasks}</Text>
        <Text style={styles.statLabel}>已完成</Text>
      </View>
    </View>
  );
}

// ============================================
// 主页面
// ============================================
export default function PlanScreen() {
  const [generatingPlan, setGeneratingPlan] = useState<Plan | null>(null);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(true);

  // 加载正在进行的规划及其阶段和任务
  const loadGeneratingPlan = useCallback(async () => {
    setLoading(true);
    try {
      // 1. 获取 status=generating 的规划（最多一条）
      const plan = await planApi.getGeneratingPlan();
      if (!plan) {
        setGeneratingPlan(null);
        setPhases([]);
        setLoading(false);
        return;
      }

      // 2. 获取该规划的阶段列表
      const phaseRes = await planApi.getPhaseList(plan.id);
      const phaseList = phaseRes?.list || [];

      // 3. 获取每个阶段的任务列表
      const phasesWithTasks = await Promise.all(
        phaseList.map(async (phase) => {
          const taskRes = await planApi.getTaskList(phase.id);
          return {
            ...phase,
            tasks: taskRes?.list || [],
          };
        })
      );

      setGeneratingPlan(plan);
      setPhases(phasesWithTasks);
    } catch (error) {
      console.error("加载规划失败:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadGeneratingPlan();
    }, [loadGeneratingPlan])
  );

  const handleTaskToggle = async (task: Task, phaseId: number) => {
    try {
      await planApi.completeTask({ id: task.id, isCompleted: !task.isCompleted });

      // 更新本地状态
      setPhases(prev => prev.map(phase => {
        if (phase.id !== phaseId) return phase;
        return {
          ...phase,
          tasks: phase.tasks?.map(t =>
            t.id === task.id ? { ...t, isCompleted: !t.isCompleted } : t
          ),
        };
      }));
    } catch (error) {
      console.error("更新任务状态失败:", error);
    }
  };

  const getProgress = () => {
    if (phases.length === 0) return { completed: 0, total: 0, percent: 0 };
    const allTasks = phases.flatMap(p => p.tasks || []);
    const total = allTasks.length;
    const completed = allTasks.filter(t => t.isCompleted).length;
    return {
      total,
      completed,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  };

  // 空状态：无规划时
  if (!loading && !generatingPlan) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
        <PlanEmptyState onCreatePlan={() => router.push("/(plan)/create-plan")} colors={COLORS} />
      </SafeAreaView>
    );
  }

  const planWithPhases = generatingPlan ? { ...generatingPlan, phases } : null;
  const progress = getProgress();
  const type = generatingPlan ? (typeConfig[generatingPlan.type as string] || typeConfig.tourism) : null;
  const status = generatingPlan ? (statusConfig[generatingPlan.status as string] || statusConfig.draft) : null;
  const IconComp = type?.icon;
  const destinationText = generatingPlan?.destination.country ||
    generatingPlan?.destination.city ||
    generatingPlan?.destination.province || "";

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
          >
            <Text style={styles.allPlansText}>所有规划</Text>
            <ChevronRight size={14} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* 加载中 */}
        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>加载中...</Text>
          </View>
        )}

        {/* 进行中规划卡片 */}
        {generatingPlan && type && status && planWithPhases && (
          <View style={styles.featuredSection}>
            {/* 主卡片 */}
            <TouchableOpacity
              style={styles.mainCard}
              activeOpacity={0.95}
              onPress={() => router.push({
                pathname: "/(plan)/plan-detail",
                params: { id: String(generatingPlan.id) },
              })}
            >
              {/* 顶部色条 */}
              <View style={[styles.mainCardAccent, { backgroundColor: type.color }]} />

              <View style={styles.mainCardContent}>
                {/* 标签行 */}
                <View style={styles.mainCardHeader}>
                  <View style={[styles.typeBadge, { backgroundColor: type.bg }]}>
                    <IconComp size={14} color={type.color} />
                    <Text style={[styles.typeLabel, { color: type.color }]}>{type.label}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                    <View style={[styles.statusDot, { backgroundColor: status.text }]} />
                    <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
                  </View>
                </View>

                {/* 标题与目的地 */}
                <Text style={styles.planTitle}>{generatingPlan.title}</Text>
                <View style={styles.destinationRow}>
                  <MapPin size={13} color={COLORS.textMuted} />
                  <Text style={styles.destinationText}>{destinationText}</Text>
                </View>

                {/* 进度条 */}
                {progress.total > 0 && (
                  <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressLabel}>整体进度</Text>
                      <Text style={[styles.progressValue, { color: type.color }]}>
                        {progress.completed}/{progress.total}
                      </Text>
                    </View>
                    <View style={[styles.progressBarBg, { backgroundColor: COLORS.muted }]}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${progress.percent}%`, backgroundColor: type.color }
                        ]}
                      />
                    </View>
                  </View>
                )}

                {/* 底部操作栏 */}
                <View style={styles.mainCardFooter}>
                  <View style={styles.footerLeft}>
                    <Calendar1 size={12} color={COLORS.textMuted} />
                    <Text style={styles.footerDateText}>{formatDate(generatingPlan.createdAt)}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.continueBtn, { backgroundColor: type.color }]}
                    activeOpacity={0.8}
                    onPress={() => router.push({
                      pathname: "/(plan)/plan-detail",
                      params: { id: String(generatingPlan.id) },
                    })}
                  >
                    <Text style={styles.continueBtnText}>继续</Text>
                    <ArrowRight size={14} color={COLORS.onPrimary} />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>

            {/* 统计概览 */}
            <StatsOverview plan={planWithPhases} />

            {/* 阶段概览 */}
            {phases.length > 0 && (
              <PhaseOverview phases={phases} planTypeColor={type.color} />
            )}

            {/* 当前任务 */}
            {phases.length > 0 && (
              <CurrentTasksSection
                phases={phases}
                planTypeColor={type.color}
                onTaskToggle={handleTaskToggle}
              />
            )}

            {/* AI建议 */}
            <NextActionCard
              suggestion="建议先完成语言考试备考，这将为后续申请材料准备打下坚实基础。"
              planTypeColor={type.color}
            />

            {/* 时间节点 */}
            {phases.length > 0 && (
              <TimelineSection phases={phases} />
            )}
          </View>
        )}

        {/* 快捷操作 */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.85}
            onPress={() => router.push("/(plan)/create-plan")}
          >
            <View style={[styles.actionIcon, { backgroundColor: `${COLORS.primary}12` }]}>
              <Plus size={22} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.actionTitle}>新建规划</Text>
              <Text style={styles.actionDesc}>开始创建新的出国计划</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================
// Styles - Soft UI Evolution Design System
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

  // Featured Section
  featuredSection: { paddingHorizontal: 20, gap: 16 },

  // Main Card
  mainCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  mainCardAccent: { height: 6 },
  mainCardContent: { padding: 20 },
  mainCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  typeLabel: { fontSize: 12, fontWeight: "600" },
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
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  destinationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 20,
  },
  destinationText: { fontSize: 14, color: COLORS.textSecondary },

  // Progress
  progressSection: { marginBottom: 20 },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  progressLabel: { fontSize: 13, color: COLORS.textMuted, fontWeight: "500" },
  progressValue: { fontSize: 14, fontWeight: "700" },
  progressBarBg: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressBarFill: { height: "100%", borderRadius: 3 },

  // Main Card Footer
  mainCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  footerLeft: { flexDirection: "row", alignItems: "center", gap: 5 },
  footerDateText: { fontSize: 12, color: COLORS.textMuted },
  continueBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  continueBtnText: { fontSize: 14, fontWeight: "600", color: COLORS.onPrimary },

  // Stats Overview
  statsContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 22, fontWeight: "700", color: COLORS.textPrimary, marginBottom: 4 },
  statLabel: { fontSize: 12, color: COLORS.textMuted },
  statDivider: { width: 1, marginVertical: 4 },

  // Phase Overview
  phaseOverviewContainer: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  phasesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  phaseItem: {
    alignItems: "center",
    flex: 1,
  },
  phaseIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  phaseLabel: {
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 2,
  },
  phaseCount: {
    fontSize: 10,
  },

  // Current Tasks
  currentTasksContainer: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  currentTasksHeader: { marginBottom: 12 },
  currentTasksBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  currentTasksBadgeText: { fontSize: 12, fontWeight: "600" },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  taskCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  taskCheckboxInner: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  moreTasksBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 4,
  },
  moreTasksText: { fontSize: 13, color: COLORS.textMuted },

  // Next Action
  nextActionContainer: {
    backgroundColor: COLORS.warningLight,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.15)",
  },
  nextActionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  nextActionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.accent
  },
  nextActionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  nextActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  nextActionBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },

  // Timeline
  timelineContainer: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  timelineHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 12,
  },
  timelineContent: { flex: 1 },
  timelineItemTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  timelineDate: { fontSize: 12 },

  // Quick Actions
  quickActions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  actionDesc: { fontSize: 12, color: COLORS.textMuted },
});