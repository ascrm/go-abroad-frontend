import { ClipboardList, Plus } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

interface PlanEmptyStateProps {
  onCreatePlan?: () => void;
}

export default function PlanEmptyState({ onCreatePlan }: PlanEmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-6">
        <ClipboardList size={40} color="#9CA3AF" />
      </View>
      
      <Text className="text-lg font-semibold text-gray-900 mb-2">
        你还没有创建任何出国规划哦
      </Text>
      
      <Text className="text-sm text-gray-500 text-center mb-8">
        开始创建你的出国规划，让出国变得更简单
      </Text>
      
      <TouchableOpacity
        className="bg-gray-900 px-8 py-3 rounded-xl flex-row items-center gap-2"
        activeOpacity={0.8}
        onPress={onCreatePlan}
      >
        <Text className="text-white font-medium">创建规划</Text>
        <Plus size={18} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}
