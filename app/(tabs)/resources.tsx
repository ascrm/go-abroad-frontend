import { TourismResources } from "@/components/page/resources/TourismResources";
import { MapPin, X } from "lucide-react-native";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ResourcesScreen() {
  // In the future, this would come from user context or state
  const currentType: "tourism" | "study" | "work" | "immigration" = "tourism";
  let waitType;

  // Mock data for the current plan context
  const planContext = {
    country: "日本",
    city: "东京",
    type: "旅游"
  };

  const [showTip, setShowTip] = useState(true);

  return (
    <SafeAreaView className="flex-1 bg-white">
      
      {/* Header Context */}
      <View className="px-4 pt-4 pb-2">
        <View className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-sm text-blue-600 font-medium">当前规划</Text>
            <View className="bg-white px-2 py-0.5 rounded border border-blue-100">
               <Text className="text-xs font-medium text-blue-700">{planContext.type}</Text>
            </View>
          </View>
          
          <Text className="text-xl font-bold text-gray-900 mb-1">{planContext.country}</Text>
          
          <View className="flex-row items-center gap-1">
            <MapPin size={12} color="#4B5563" />
            <Text className="text-xs text-gray-600">{planContext.city}</Text>
          </View>
        </View>
      </View>

      {showTip && (
        <View className="px-4 pb-2 flex-row items-center justify-between">
          <Text className="text-xs text-gray-400">以下资源基于当前出国规划提供</Text>
          <TouchableOpacity onPress={() => setShowTip(false)}>
            <X size={14} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      )}

      {currentType === "tourism" && <TourismResources />}
      
      {/* Placeholders for other types */}
      {waitType === "study" && (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-400">留学资源组件开发中...</Text>
        </View>
      )}
      
      {waitType === "work" && (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-400">工作资源组件开发中...</Text>
        </View>
      )}

      {waitType === "immigration" && (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-400">移民资源组件开发中...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}
