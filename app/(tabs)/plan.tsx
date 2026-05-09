import * as planApi from "@/src/api/plan";
import { usePlanStore } from "@/src/stores/planStore";
import type { Plan } from "@/src/types/plan";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PlanEmptyState from "../../components/page/plan/PlanEmptyState";
import { Calendar1, MapPin, Plane, GraduationCap, Briefcase, Home, ChevronRight, List, Plus } from "lucide-react-native";
import { formatDate } from "@/src/utils/time";

// Design System - Soft UI Evolution (Light Theme)
const COLORS = {
  primary: "#0D9488",
  onPrimary: "#FFFFFF",
  secondary: "#14B8A6",
  accent: "#EA580C",
  background: "#F8FAFC",
  foreground: "#0F172A",
  muted: "#F1F5F9",
  border: "#E2E8F0",
  cardBg: "#FFFFFF",
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
  destructive: "#DC2626",
  success: "#16A34A",
  warning: "#D97706",
  info: "#2563EB",
};

const typeConfig: Record<string, { icon: any; label: string; color: string }> = {
  tourism: { icon: Plane, label: "旅游", color: "#3B82F6" },
  study: { icon: GraduationCap, label: "留学", color: "#8B5CF6" },
  work: { icon: Briefcase, label: "工作", color: "#F59E0B" },
  immigration: { icon: Home, label: "定居", color: "#10B981" },
};

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  completed: { label: "已完成", bg: "#DCFCE7", text: "#16A34A" },
  generating: { label: "进行中", bg: "#DBEAFE", text: "#2563EB" },
  draft: { label: "待开始", bg: "#FEF3C7", text: "#D97706" },
  archived: { label: "已归档", bg: "#F1F5F9", text: "#64748B" },
};

export default function PlanScreen() {
  const { plans, fetchPlans, updatePlan, deletePlan } = usePlanStore();

  useFocusEffect(
    useCallback(() => {
      fetchPlans();
    }, [fetchPlans])
  );

  const handlePlanPress = useCallback((plan: Plan) => {
    router.push({
      pathname: "/(plan)/plan-detail",
      params: { id: String(plan.id) },
    });
  }, []);

  // 正在进行中的规划（最多一个）
  const generatingPlan = plans.find((p) => p.status === "generating") || null;

  const handleStart = async (plan: Plan) => {
    await planApi.updatePlan({ id: plan.id, status: "generating" }).then((data) => {
      if (data) updatePlan({ ...plan, status: "generating" });
    });
  };

  const handleDelete = (plan: Plan) => {
    Alert.alert("确认删除", `确定要删除规划「${plan.title}」吗？`, [
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

  // 计算进度
  const getProgress = (plan: Plan) => {
    if (!plan.phases || plan.phases.length === 0) return { completed: 0, total: 0, percent: 0 };
    const allTasks = plan.phases.flatMap((p) => p.tasks ?? []);
    const total = allTasks.length;
    const completed = allTasks.filter((t) => t.isCompleted).length;
    return {
      total,
      completed,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  };

  if (!generatingPlan && plans.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
        <PlanEmptyState onCreatePlan={() => router.push("/(plan)/create-plan")} colors={COLORS} />
      </SafeAreaView>
    );
  }

  const progress = getProgress(generatingPlan!);
  const type = typeConfig[generatingPlan?.type as string] || typeConfig.tourism;
  const status = statusConfig[generatingPlan?.status as string] || statusConfig.draft;
  const IconComp = type.icon;
  const destinationText = generatingPlan?.destination.country ||
    generatingPlan?.destination.city ||
    generatingPlan?.destination.province || "";

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 头部 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>出国规划</Text>
          <TouchableOpacity
            style={styles.allPlansBtn}
            onPress={() => router.push("/(plan)/plan-list")}
          >
            <List size={16} color={COLORS.textSecondary} />
            <Text style={styles.allPlansText}>所有规划</Text>
            <ChevronRight size={14} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* 进行中规划卡片 */}
        {generatingPlan && (
          <TouchableOpacity
            style={styles.featuredCard}
            onPress={() => handlePlanPress(generatingPlan)}
            activeOpacity={0.9}
          >
            <View style={[styles.cardAccentBar, { backgroundColor: type.color }]} />
            <View style={styles.cardBody}>
              <View style={styles.cardHeader}>
                <View style={[styles.typeBadge, { backgroundColor: `${type.color}15` }]}>
                  <IconComp size={14} color={type.color} />
                  <Text style={[styles.typeLabel, { color: type.color }]}>{type.label}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
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
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>整体进度</Text>
                    <Text style={[styles.progressValue, { color: type.color }]}>
                      {progress.completed}/{progress.total} · {progress.percent}%
                    </Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${progress.percent}%`, backgroundColor: type.color }]} />
                  </View>
                </View>
              )}
              <View style={styles.cardFooter}>
                <View style={styles.footerItem}>
                  <Calendar1 size={12} color={COLORS.textMuted} />
                  <Text style={styles.footerText}>{formatDate(generatingPlan.createdAt)}</Text>
                </View>
                <TouchableOpacity style={[styles.continueBtn, { backgroundColor: type.color }]} onPress={() => handlePlanPress(generatingPlan)}>
                  <Text style={styles.continueBtnText}>继续</Text>
                  <ChevronRight size={14} color={COLORS.onPrimary} />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* 快捷操作 */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/(plan)/create-plan")}>
            <View style={[styles.actionIcon, { backgroundColor: `${COLORS.primary}15` }]}>
              <Plus size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.actionTitle}>新建规划</Text>
            <Text style={styles.actionDesc}>开始创建新的出国计划</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/(plan)/plan-list")}>
            <View style={[styles.actionIcon, { backgroundColor: `${COLORS.accent}15` }]}>
              <List size={20} color={COLORS.accent} />
            </View>
            <Text style={styles.actionTitle}>查看全部</Text>
            <Text style={styles.actionDesc}>管理所有规划</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 40 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 16, paddingBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: "700", color: COLORS.textPrimary },
  allPlansBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: COLORS.muted, borderRadius: 8 },
  allPlansText: { fontSize: 13, color: COLORS.textSecondary },
  featuredCard: { backgroundColor: COLORS.cardBg, borderRadius: 20, overflow: "hidden", marginBottom: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  cardAccentBar: { height: 5 },
  cardBody: { padding: 20 },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  typeBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  typeLabel: { fontSize: 12, fontWeight: "600" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: "600" },
  planTitle: { fontSize: 22, fontWeight: "700", color: COLORS.textPrimary, marginBottom: 8 },
  destinationRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 16 },
  destinationText: { fontSize: 13, color: COLORS.textSecondary },
  progressSection: { marginBottom: 16 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  progressLabel: { fontSize: 12, color: COLORS.textMuted },
  progressValue: { fontSize: 12, fontWeight: "600" },
  progressBarBg: { height: 5, backgroundColor: COLORS.muted, borderRadius: 3, overflow: "hidden" },
  progressBarFill: { height: "100%", borderRadius: 3 },
  cardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  footerItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  footerText: { fontSize: 11, color: COLORS.textMuted },
  continueBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  continueBtnText: { fontSize: 13, fontWeight: "600", color: COLORS.onPrimary },
  quickActions: { flexDirection: "row", gap: 12 },
  actionCard: { flex: 1, backgroundColor: COLORS.cardBg, borderRadius: 16, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  actionIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  actionTitle: { fontSize: 14, fontWeight: "600", color: COLORS.textPrimary, marginBottom: 3 },
  actionDesc: { fontSize: 11, color: COLORS.textMuted },
});