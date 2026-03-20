import {
  Calendar1,
  MapPin,
  Plane,
  GraduationCap,
  Briefcase,
  Home,
  Play,
  Trash2,
} from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Plan, PlanType } from "@/src/types";
import { formatDate } from "@/src/utils/time";

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
}

const typeConfig = {
  tourism: { icon: Plane, label: "旅游", color: "#3B82F6" },
  study: { icon: GraduationCap, label: "留学", color: "#8B5CF6" },
  work: { icon: Briefcase, label: "工作", color: "#F59E0B" },
  immigration: { icon: Home, label: "定居", color: "#10B981" },
};

const statusConfig = {
  completed: { label: "已完成", bg: "#F0FDF4", text: "#16A34A" },
  generating: { label: "进行中", bg: "#EFF6FF", text: "#2563EB" },
  draft: { label: "待开始", bg: "#FEF3C7", text: "#D97706" },
  archived: { label: "已归档", bg: "#F3F4F6", text: "#6B7280" },
};

// 重点展示的卡片（进行中规划）
function FeaturedPlanCard({ plan, onPress }: { plan: Plan; onPress?: (plan: Plan) => void }) {
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
      className="rounded-2xl overflow-hidden mb-6 active-opacity-90"
      activeOpacity={0.85}
      onPress={() => onPress?.(plan)}
    >
      <View className="px-5 pt-6 pb-5" style={{ backgroundColor: `${config.color}18` }}>
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-2">
            <View
              className="w-10 h-10 rounded-xl items-center justify-center"
              style={{ backgroundColor: `${config.color}30` }}
            >
              <Icon size={22} color={config.color} />
            </View>
            <Text className="text-base font-semibold" style={{ color: config.color }}>
              {config.label}
            </Text>
          </View>
          <View className="px-3 py-1 rounded-full" style={{ backgroundColor: status.bg }}>
            <Text className="text-xs font-medium" style={{ color: status.text }}>
              {status.label}
            </Text>
          </View>
        </View>

        <Text className="text-xl font-bold text-gray-900 mb-1">{plan.title}</Text>

        <View className="flex-row items-center gap-1 mb-4">
          <MapPin size={14} color="#6B7280" />
          <Text className="text-sm text-gray-500">{destinationText}</Text>
        </View>

        {progress.total > 0 && (
          <View className="mb-2">
            <View className="flex-row justify-between mb-1.5">
              <Text className="text-xs text-gray-400">进度</Text>
              <Text className="text-xs font-medium" style={{ color: config.color }}>
                {progress.completed}/{progress.total} 已完成 · {progress.percent}%
              </Text>
            </View>
            <View className="h-1.5 bg-white/60 rounded-full overflow-hidden">
              <View
                className="h-full rounded-full"
                style={{ width: `${progress.percent}%`, backgroundColor: config.color }}
              />
            </View>
          </View>
        )}

        <View className="flex-row items-center gap-1.5">
          <Calendar1 size={13} color="#9CA3AF" />
          <Text className="text-xs text-gray-400">{formatDate(plan.createdAt)}</Text>
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
}: {
  plan: Plan;
  onPress?: (plan: Plan) => void;
  onStart?: (plan: Plan) => void;
  onDelete?: (plan: Plan) => void;
}) {
  const config = typeConfig[plan.type as PlanType] || typeConfig.tourism;
  const Icon = config.icon;
  const destinationText =
    plan.destination.country || plan.destination.city || plan.destination.province || "";
  const status = statusConfig[plan.status] || statusConfig.draft;

  const swipeableRef = useRef<SwipeableRef>(null);

  const renderRightActions = useCallback(() => (
    <View className="flex-row items-center self-stretch">
      {/* 开始按钮 */}
      <TouchableOpacity
        className="w-16 h-full items-center justify-center"
        style={{ backgroundColor: "#10B981" }}
        onPress={() => {
          onStart?.(plan);
          swipeableRef.current?.close();
        }}
      >
        <Play size={20} color="#FFFFFF" />
        <Text className="text-white text-xs mt-1">开始</Text>
      </TouchableOpacity>

      {/* 删除按钮 */}
      <TouchableOpacity
        className="w-16 h-full items-center justify-center"
        style={{ backgroundColor: "#EF4444" }}
        onPress={() => {
          onDelete?.(plan);
          swipeableRef.current?.close();
        }}
      >
        <Trash2 size={20} color="#FFFFFF" />
        <Text className="text-white text-xs mt-1">删除</Text>
      </TouchableOpacity>
    </View>
  ), [onStart, onDelete, plan]);

  return (
    <Swipeable
      ref={swipeableRef as any}
      renderRightActions={renderRightActions}
      rightThreshold={40}
      overshootRight={false}
    >
      <TouchableOpacity
        className="bg-white rounded-2xl p-4 flex-row items-center border border-gray-100"
        activeOpacity={0.7}
        onPress={() => onPress?.(plan)}
      >
        <View
          className="w-10 h-10 rounded-xl items-center justify-center mr-3"
          style={{ backgroundColor: `${config.color}15` }}
        >
          <Icon size={20} color={config.color} />
        </View>

        <View className="flex-1 mr-3">
          <Text className="text-sm font-semibold text-gray-900 mb-1" numberOfLines={1}>
            {plan.title}
          </Text>
          <View className="flex-row items-center gap-1">
            <MapPin size={12} color="#9CA3AF" />
            <Text className="text-xs text-gray-400">{destinationText}</Text>
          </View>
        </View>

        <View className="items-end gap-1.5">
          <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: status.bg }}>
            <Text className="text-xs font-medium" style={{ color: status.text }}>
              {status.label}
            </Text>
          </View>
          <Text className="text-xs text-gray-400">{formatDate(plan.createdAt)}</Text>
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
}: PlanListProps) {
  return (
    <View className="flex-1 px-5 pt-5">
      <View className="flex-row items-center justify-between mb-5">
        <Text className="text-2xl font-bold text-gray-900">我的规划</Text>
        <TouchableOpacity
          className="bg-gray-900 px-4 py-2 rounded-lg active-opacity-80"
          activeOpacity={0.8}
          onPress={onCreatePlan}
        >
          <Text className="text-white text-sm font-medium">+ 新建</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1">
        {/* 重点展示：进行中的规划 */}
        {featuredPlan ? (
          <FeaturedPlanCard plan={featuredPlan} onPress={onPlanPress} />
        ) : (
          <TouchableOpacity
            className="rounded-2xl border-2 border-dashed border-gray-200 mb-6 active-opacity-80"
            activeOpacity={0.7}
            onPress={onCreatePlan}
          >
            <View className="px-5 py-8 items-center">
              <Text className="text-base font-medium text-gray-400 mb-1">
                您还没有正在进行的规划
              </Text>
              <Text className="text-sm text-gray-400">请选择规划开始</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* 其余列表（可左滑） */}
        {plans.map((plan) => (
          <View key={plan.id} className="mb-3">
            <PlanListCard
              plan={plan}
              onPress={onPlanPress}
              onStart={onStart}
              onDelete={onDelete}
            />
          </View>
        ))}
      </View>
    </View>
  );
}
