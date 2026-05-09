import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert, FlatList, StyleSheet, Text, TouchableOpacity, View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Calendar1, ChevronLeft, Clock, MapPin, Plane,
  GraduationCap, Briefcase, Home, Plus, List, Trash2, Archive, Play, X
} from "lucide-react-native";
import * as planApi from "@/src/api/plan";
import { usePlanStore } from "@/src/stores/planStore";
import type { Plan, PlanType } from "@/src/types/plan";
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

type FilterKey = "all" | "generating" | "draft" | "completed" | "archived";

const filterStats: { key: FilterKey; label: string; colorKey: keyof typeof COLORS }[] = [
  { key: "all", label: "全部", colorKey: "primary" },
  { key: "generating", label: "进行中", colorKey: "info" },
  { key: "draft", label: "待开始", colorKey: "warning" },
  { key: "completed", label: "已完成", colorKey: "success" },
];

// ============================================
// 规划卡片组件
// ============================================
function PlanCard({
  plan,
  onPress,
  onStart,
  onArchive,
  onDelete,
}: {
  plan: Plan;
  onPress?: (plan: Plan) => void;
  onStart?: (plan: Plan) => void;
  onArchive?: (plan: Plan) => void;
  onDelete?: (plan: Plan) => void;
}) {
  const config = typeConfig[plan.type as PlanType] || typeConfig.tourism;
  const status = statusConfig[plan.status] || statusConfig.draft;
  const Icon = config.icon;
  const destinationText = plan.destination.country || plan.destination.city || plan.destination.province || "";

  const totalTasks = plan.phases?.flatMap(p => p.tasks || []).length || 0;
  const completedTasks = plan.phases?.flatMap(p => p.tasks || []).filter(t => t.isCompleted).length || 0;
  const percent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => onPress?.(plan)}
    >
      {/* 左侧类型标识条 */}
      <View style={[styles.cardLeftBar, { backgroundColor: config.color }]} />

      <View style={styles.cardBody}>
        {/* 头部：类型 + 状态 */}
        <View style={styles.cardHeader}>
          <View style={[styles.typeBadge, { backgroundColor: config.bg }]}>
            <Icon size={12} color={config.color} />
            <Text style={[styles.typeLabel, { color: config.color }]}>{config.label}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
          </View>
        </View>

        {/* 标题 */}
        <Text style={styles.cardTitle} numberOfLines={1}>{plan.title}</Text>

        {/* 目的地 */}
        <View style={styles.cardMeta}>
          <MapPin size={11} color={COLORS.textMuted} />
          <Text style={styles.cardMetaText}>{destinationText}</Text>
        </View>

        {/* 进度条 */}
        {totalTasks > 0 && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>进度</Text>
              <Text style={[styles.progressValue, { color: config.color }]}>
                {completedTasks}/{totalTasks}
              </Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: COLORS.muted }]}>
              <View
                style={[styles.progressFill, { width: `${percent}%`, backgroundColor: config.color }]}
              />
            </View>
          </View>
        )}

        {/* 底部 */}
        <View style={styles.cardFooter}>
          <View style={styles.footerLeft}>
            <Calendar1 size={11} color={COLORS.textMuted} />
            <Text style={styles.footerDate}>{formatDate(plan.createdAt)}</Text>
          </View>

          {/* 操作按钮 */}
          <View style={styles.cardActions}>
            {plan.status === "draft" && (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}
                onPress={(e) => {
                  e.stopPropagation();
                  onStart?.(plan);
                }}
              >
                <Play size={12} color="#FFFFFF" />
                <Text style={styles.actionBtnText}>开始</Text>
              </TouchableOpacity>
            )}
            {plan.status !== "archived" && (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: COLORS.muted }]}
                onPress={(e) => {
                  e.stopPropagation();
                  onArchive?.(plan);
                }}
              >
                <Archive size={12} color={COLORS.textSecondary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: COLORS.muted }]}
              onPress={(e) => {
                e.stopPropagation();
                onDelete?.(plan);
              }}
            >
              <Trash2 size={12} color={COLORS.destructive} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ============================================
// 主页面
// ============================================
export default function PlanListScreen() {
  const { plans, fetchPlans, updatePlan, deletePlan } = usePlanStore();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  useFocusEffect(
    useCallback(() => {
      fetchPlans();
    }, [fetchPlans])
  );

  const filteredPlans = activeFilter === "all"
    ? plans
    : plans.filter(p => p.status === activeFilter);

  const stats = {
    all: plans.length,
    generating: plans.filter(p => p.status === "generating").length,
    draft: plans.filter(p => p.status === "draft").length,
    completed: plans.filter(p => p.status === "completed").length,
  };

  const handlePlanPress = (plan: Plan) => {
    router.push({
      pathname: "/(plan)/plan-detail",
      params: { id: String(plan.id) },
    });
  };

  const handleStart = async (plan: Plan) => {
    await planApi.updatePlan({ id: plan.id, status: "generating" }).then((data) => {
      if (data) updatePlan({ ...plan, status: "generating" });
    });
  };

  const handleArchive = async (plan: Plan) => {
    Alert.alert("确认归档", `确定要归档规划「${plan.title}」吗？`, [
      { text: "取消", style: "cancel" },
      {
        text: "归档",
        onPress: async () => {
          await planApi.updatePlan({ id: plan.id, status: "archived" }).then((data) => {
            if (data) updatePlan({ ...plan, status: "archived" });
          });
        },
      },
    ]);
  };

  const handleDelete = (plan: Plan) => {
    Alert.alert("确认删除", `确定要删除规划「${plan.title}」吗？此操作不可恢复。`, [
      { text: "取消", style: "cancel" },
      {
        text: "删除",
        style: "destructive",
        onPress: async () => {
          await planApi.deletePlan(plan.id);
          deletePlan(plan.id);
        },
      },
    ]);
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconWrapper, { backgroundColor: COLORS.muted }]}>
        <List size={36} color={COLORS.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>
        {activeFilter === "all" ? "暂无规划" : "暂无符合条件的规划"}
      </Text>
      <Text style={styles.emptySubtitle}>
        {activeFilter === "all" ? "开始创建你的第一个出国规划吧" : "尝试切换筛选条件查看其他规划"}
      </Text>
      {activeFilter === "all" && (
        <TouchableOpacity
          style={[styles.emptyBtn, { backgroundColor: COLORS.primary }]}
          activeOpacity={0.85}
          onPress={() => router.push("/(plan)/create-plan")}
        >
          <Plus size={16} color={COLORS.onPrimary} />
          <Text style={[styles.emptyBtnText, { color: COLORS.onPrimary }]}>创建规划</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      {/* 头部 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <ChevronLeft size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>所有规划</Text>
        <TouchableOpacity
          style={styles.addBtn}
          activeOpacity={0.7}
          onPress={() => router.push("/(plan)/create-plan")}
        >
          <Plus size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* 统计/筛选栏 - 可点击切换 */}
      <View style={styles.statsContainer}>
        {filterStats.map((item, index) => (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.statItem,
              activeFilter === item.key && styles.statItemActive
            ]}
            onPress={() => setActiveFilter(item.key)}
          >
            <Text
              style={[
                styles.statValue,
                { color: activeFilter === item.key ? COLORS[item.colorKey] : COLORS.textPrimary }
              ]}
            >
              {stats[item.key]}
            </Text>
            <Text
              style={[
                styles.statLabel,
                { color: activeFilter === item.key ? COLORS[item.colorKey] : COLORS.textMuted }
              ]}
            >
              {item.label}
            </Text>
            {index < filterStats.length - 1 && (
              <View style={styles.statDivider} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* 规划列表 */}
      <FlatList
        data={filteredPlans}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <PlanCard
            plan={item}
            onPress={handlePlanPress}
            onStart={handleStart}
            onArchive={handleArchive}
            onDelete={handleDelete}
          />
        )}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          filteredPlans.length === 0 && styles.listContentEmpty
        ]}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// ============================================
// Styles - Soft UI Evolution
// ============================================
const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.muted,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: COLORS.textPrimary },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${COLORS.primary}12`,
    alignItems: "center",
    justifyContent: "center",
  },

  // Stats (Clickable Filter Bar)
  statsContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
  },
  statItemActive: {
    backgroundColor: COLORS.muted,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    marginRight: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },

  // List
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  listContentEmpty: { flex: 1 },

  // Card
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
  },
  cardLeftBar: {
    width: 4,
  },
  cardBody: {
    flex: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeLabel: { fontSize: 11, fontWeight: "600" },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: { fontSize: 10, fontWeight: "600" },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 12,
  },
  cardMetaText: { fontSize: 12, color: COLORS.textMuted },
  progressSection: { marginBottom: 12 },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressLabel: { fontSize: 11, color: COLORS.textMuted },
  progressValue: { fontSize: 11, fontWeight: "600" },
  progressBar: { height: 4, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2 },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerLeft: { flexDirection: "row", alignItems: "center", gap: 4 },
  footerDate: { fontSize: 11, color: COLORS.textMuted },

  // Card Actions
  cardActions: {
    flexDirection: "row",
    gap: 6,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: 20,
  },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  emptyBtnText: { fontSize: 13, fontWeight: "600" },
});