import {
  Calendar1,
  MapPin,
  Plane,
  GraduationCap,
  Briefcase,
  Home,
  Play,
  Trash2,
  Plus,
} from "lucide-react-native";
import { Text, TouchableOpacity, View, StyleSheet, Animated } from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Plan, PlanType } from "@/src/types";
import { formatDate } from "@/src/utils/time";

interface Colors {
  primary: string;
  onPrimary: string;
  secondary: string;
  background: string;
  foreground: string;
  muted: string;
  border: string;
  cardBg: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  destructive: string;
  success: string;
  warning: string;
  info: string;
}

interface SwipeableRef {
  close: () => void;
}

interface PlanListProps {
  featuredPlan?: Plan;
  plans: Plan[];
  onPlanPress?: (plan: Plan) => void;
  onCreatePlan?: () => void;
  onStart?: (plan: Plan) => Promise<void>;
  onDelete?: (plan: Plan) => Promise<void>;
  colors?: Colors;
}

const DEFAULT_COLORS = {
  primary: "#0D9488",
  onPrimary: "#FFFFFF",
  secondary: "#14B8A6",
  background: "#F0FDFA",
  foreground: "#134E4A",
  muted: "#E8F1F4",
  border: "#99F6E4",
  cardBg: "#FFFFFF",
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
  destructive: "#DC2626",
  success: "#059669",
  warning: "#D97706",
  info: "#2563EB",
};

const typeConfig = {
  tourism: { icon: Plane, label: "旅游", color: "#3B82F6" },
  study: { icon: GraduationCap, label: "留学", color: "#8B5CF6" },
  work: { icon: Briefcase, label: "工作", color: "#F59E0B" },
  immigration: { icon: Home, label: "定居", color: "#10B981" },
};

const statusConfig = {
  completed: { label: "已完成", bg: "#ECFDF5", text: "#059669" },
  generating: { label: "进行中", bg: "#EFF6FF", text: "#2563EB" },
  draft: { label: "待开始", bg: "#FEF3C7", text: "#D97706" },
  archived: { label: "已归档", bg: "#F3F4F6", text: "#6B7280" },
};

// 重点展示的卡片（进行中规划）
function FeaturedPlanCard({ plan, onPress, colors }: { plan: Plan; onPress?: (plan: Plan) => void; colors: Colors }) {
  const config = typeConfig[plan.type as PlanType] || typeConfig.tourism;
  const Icon = config.icon;
  const destinationText =
    plan.destination.country || plan.destination.city || plan.destination.province || "";
  const status = statusConfig[plan.status] || statusConfig.draft;
  const [progress, setProgress] = useState({ completed: 0, total: 0, percent: 0 });

  useEffect(() => {
    if (plan.phases && plan.phases.length > 0) {
      const allTasks = plan.phases.flatMap((p) => p.tasks ?? []);
      const total = allTasks.length;
      const completed = allTasks.filter((t) => t.isCompleted).length;
      setProgress({ completed, total, percent: total > 0 ? Math.round((completed / total) * 100) : 0 });
    } else {
      import("@/src/api/plan")
        .then(({ getPhaseList }) => {
          getPhaseList(plan.id).then((res) => {
            if (!res || !Array.isArray(res.list)) return;
            const allTasks = res.list.flatMap((p) => p.tasks ?? []);
            const total = allTasks.length;
            const completed = allTasks.filter((t) => t.isCompleted).length;
            setProgress({ completed, total, percent: total > 0 ? Math.round((completed / total) * 100) : 0 });
          });
        });
    }
  }, [plan]);

  return (
    <TouchableOpacity
      style={[styles.featuredCard, { backgroundColor: colors.cardBg }]}
      activeOpacity={0.9}
      onPress={() => onPress?.(plan)}
    >
      <View style={[styles.featuredHeader, { backgroundColor: `${config.color}12` }]}>
        <View className="flex-row items-center justify-between">
          <View style={[styles.typeIconWrapper, { backgroundColor: `${config.color}20` }]}>
            <Icon size={20} color={config.color} />
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
          </View>
        </View>

        <Text style={[styles.featuredTitle, { color: colors.textPrimary }]} numberOfLines={1}>
          {plan.title}
        </Text>

        <View style={styles.destinationRow}>
          <MapPin size={13} color={colors.textMuted} />
          <Text style={[styles.destinationText, { color: colors.textMuted }]}>{destinationText}</Text>
        </View>

        {progress.total > 0 && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: colors.textMuted }]}>整体进度</Text>
              <Text style={[styles.progressValue, { color: config.color }]}>
                {progress.completed}/{progress.total} · {progress.percent}%
              </Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
              <View
                style={[styles.progressFill, { width: `${progress.percent}%`, backgroundColor: config.color }]}
              />
            </View>
          </View>
        )}

        <View style={styles.dateRow}>
          <Calendar1 size={12} color={colors.textMuted} />
          <Text style={[styles.dateText, { color: colors.textMuted }]}>{formatDate(plan.createdAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// 紧凑列表卡片（其余）——支持左滑
function PlanListCard({
  plan,
  onPress,
  onStart,
  onDelete,
  colors,
}: {
  plan: Plan;
  onPress?: (plan: Plan) => void;
  onStart?: (plan: Plan) => void;
  onDelete?: (plan: Plan) => void;
  colors: Colors;
}) {
  const config = typeConfig[plan.type as PlanType] || typeConfig.tourism;
  const Icon = config.icon;
  const destinationText =
    plan.destination.country || plan.destination.city || plan.destination.province || "";
  const status = statusConfig[plan.status] || statusConfig.draft;

  const swipeableRef = useRef<SwipeableRef>(null);

  const renderRightActions = useCallback(() => (
    <View style={styles.swipeActions}>
      <TouchableOpacity
        style={[styles.swipeAction, { backgroundColor: colors.success }]}
        onPress={() => {
          onStart?.(plan);
          swipeableRef.current?.close();
        }}
      >
        <Play size={18} color="#FFFFFF" />
        <Text style={styles.swipeActionText}>开始</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.swipeAction, { backgroundColor: colors.destructive }]}
        onPress={() => {
          onDelete?.(plan);
          swipeableRef.current?.close();
        }}
      >
        <Trash2 size={18} color="#FFFFFF" />
        <Text style={styles.swipeActionText}>删除</Text>
      </TouchableOpacity>
    </View>
  ), [onStart, onDelete, plan, colors.success, colors.destructive]);

  return (
    <Swipeable
      ref={swipeableRef as any}
      renderRightActions={renderRightActions}
      rightThreshold={40}
      overshootRight={false}
    >
      <TouchableOpacity
        style={[styles.listCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
        activeOpacity={0.7}
        onPress={() => onPress?.(plan)}
      >
        <View style={[styles.listIconWrapper, { backgroundColor: `${config.color}12` }]}>
          <Icon size={18} color={config.color} />
        </View>

        <View style={styles.listContent}>
          <Text style={[styles.listTitle, { color: colors.textPrimary }]} numberOfLines={1}>
            {plan.title}
          </Text>
          <View style={styles.listMeta}>
            <MapPin size={11} color={colors.textMuted} />
            <Text style={[styles.listMetaText, { color: colors.textMuted }]}>{destinationText}</Text>
          </View>
        </View>

        <View style={styles.listRight}>
          <View style={[styles.statusBadgeSmall, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusTextSmall, { color: status.text }]}>{status.label}</Text>
          </View>
          <Text style={[styles.listDate, { color: colors.textMuted }]}>{formatDate(plan.createdAt)}</Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
}

export default function PlanList({
  featuredPlan,
  plans,
  onPlanPress,
  onCreatePlan,
  onStart,
  onDelete,
  colors,
}: PlanListProps) {
  const c = colors || DEFAULT_COLORS;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: c.textPrimary }]}>我的规划</Text>
        <TouchableOpacity
          style={[styles.createBtn, { backgroundColor: c.primary }]}
          activeOpacity={0.85}
          onPress={onCreatePlan}
        >
          <Plus size={16} color={c.onPrimary} />
          <Text style={[styles.createBtnText, { color: c.onPrimary }]}>新建</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.list}>
        {/* 重点展示：进行中的规划 */}
        {featuredPlan ? (
          <FeaturedPlanCard plan={featuredPlan} onPress={onPlanPress} colors={c} />
        ) : (
          <TouchableOpacity
            style={[styles.emptyFeatured, { borderColor: c.border }]}
            activeOpacity={0.7}
            onPress={onCreatePlan}
          >
            <Text style={[styles.emptyFeaturedText, { color: c.textMuted }]}>
              您还没有正在进行的规划
            </Text>
            <Text style={[styles.emptyFeaturedSubtext, { color: c.textMuted }]}>请选择规划开始</Text>
          </TouchableOpacity>
        )}

        {/* 其余列表（可左滑） */}
        {plans.map((plan) => (
          <View key={plan.id} style={styles.listItem}>
            <PlanListCard
              plan={plan}
              onPress={onPlanPress}
              onStart={onStart}
              onDelete={onDelete}
              colors={c}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 4,
  },
  createBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
  list: {
    flex: 1,
  },
  listItem: {
    marginBottom: 12,
  },
  featuredCard: {
    borderRadius: 20,
    marginBottom: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  featuredHeader: {
    padding: 20,
  },
  typeIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 6,
  },
  destinationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  destinationText: {
    fontSize: 13,
  },
  progressSection: {
    marginTop: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
  },
  progressValue: {
    fontSize: 12,
    fontWeight: "600",
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 12,
  },
  dateText: {
    fontSize: 11,
  },
  emptyFeatured: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    marginBottom: 24,
  },
  emptyFeaturedText: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 4,
  },
  emptyFeaturedSubtext: {
    fontSize: 13,
  },
  listCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  listIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  listContent: {
    flex: 1,
    marginRight: 12,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  listMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  listMetaText: {
    fontSize: 12,
  },
  listRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  statusBadgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusTextSmall: {
    fontSize: 10,
    fontWeight: "600",
  },
  listDate: {
    fontSize: 11,
  },
  swipeActions: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  swipeAction: {
    width: 64,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  swipeActionText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "500",
  },
});
