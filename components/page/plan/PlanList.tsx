import { Clock, MapPin, MoreVertical, Plane, GraduationCap, Briefcase, Home } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";
import type { Plan, PlanType } from "@/types/plan";

interface PlanListProps {
  plans: Plan[];
  onPlanPress?: (plan: Plan) => void;
  onCreatePlan?: () => void;
}

const typeConfig = {
  tourism: { icon: Plane, label: "旅游", color: "#3B82F6" },
  study: { icon: GraduationCap, label: "留学", color: "#8B5CF6" },
  work: { icon: Briefcase, label: "工作", color: "#F59E0B" },
  immigration: { icon: Home, label: "定居", color: "#10B981" },
};

export default function PlanList({ plans, onPlanPress, onCreatePlan }: PlanListProps) {
  const renderPlanCard = (plan: Plan) => {
    const config = typeConfig[plan.type as PlanType] || typeConfig.tourism;
    const Icon = config.icon;
    const destinationText = plan.destination.country || plan.destination.city || plan.destination.province || "";

    return (
      <TouchableOpacity
        key={plan.id}
        className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100"
        activeOpacity={0.7}
        onPress={() => onPlanPress?.(plan)}
      >
        <View className="flex-row items-start justify-between mb-4">
          <View className="flex-row items-center gap-3">
            <View 
              className="w-12 h-12 rounded-xl items-center justify-center"
              style={{ backgroundColor: `${config.color}15` }}
            >
              <Icon size={24} color={config.color} />
            </View>
            <View>
              <Text className="text-lg font-semibold text-gray-900">{plan.title}</Text>
              <View className="flex-row items-center gap-1 mt-1">
                <MapPin size={14} color="#9CA3AF" />
                <Text className="text-sm text-gray-500">{destinationText}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity className="p-1">
            <MoreVertical size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            <Clock size={14} color="#9CA3AF" />
            <Text className="text-xs text-gray-400">{plan.createdAt}</Text>
          </View>
          <View 
            className="px-3 py-1 rounded-full"
            style={{ 
              backgroundColor: plan.status === "completed" ? "#F0FDF4" : "#FEF3C7" 
            }}
          >
            <Text 
              className="text-xs font-medium"
              style={{ 
                color: plan.status === "completed" ? "#16A34A" : "#D97706" 
              }}
            >
              {plan.status === "completed" ? "已完成" : plan.status === "generating" ? "生成中" : "草稿"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 px-5 pt-5">
      <View className="flex-row items-center justify-between mb-5">
        <Text className="text-2xl font-bold text-gray-900">我的规划</Text>
        <TouchableOpacity
          className="bg-gray-900 px-4 py-2 rounded-lg"
          activeOpacity={0.8}
          onPress={onCreatePlan}
        >
          <Text className="text-white text-sm font-medium">+ 新建</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1">
        {plans.map(renderPlanCard)}
      </View>
    </View>
  );
}
