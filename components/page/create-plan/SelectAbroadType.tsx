import { router } from "expo-router";
import { Briefcase, ChevronLeft, ChevronRight, GraduationCap, Home, Plane } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type AbroadType = "tourism" | "study" | "work" | "immigration";

interface AbroadTypeOption {
  key: AbroadType;
  title: string;
  subtitle: string;
  icon: typeof Plane;
  iconColor: string;
}

const abroadTypes: AbroadTypeOption[] = [
  { 
    key: "tourism", 
    title: "出国旅游", 
    subtitle: "行程体验、预算控制、签证便捷", 
    icon: Plane,
    iconColor: "#0076D6"
  },
  { 
    key: "study", 
    title: "出国留学", 
    subtitle: "学业衔接、申请门槛、长期生存", 
    icon: GraduationCap,
    iconColor: "#7C3AED"
  },
  { 
    key: "work", 
    title: "出国工作", 
    subtitle: "法律合规、技能匹配、落地安家", 
    icon: Briefcase,
    iconColor: "#059669"
  },
  { 
    key: "immigration", 
    title: "出国定居", 
    subtitle: "打分门槛、资产评估、长期定居", 
    icon: Home,
    iconColor: "#EA580C"
  },
];

interface SelectAbroadTypeProps {
  onSelect: (type: AbroadType) => void;
}

export default function SelectAbroadType({ onSelect }: SelectAbroadTypeProps) {
  return (
    <>
      {/* 顶部返回 */}
      <View className="px-4 py-3">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 w-10">
          <ChevronLeft size={24} color="#374151" className="rotate-180" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text className="text-2xl font-bold text-gray-900 mb-2">选择出国目的</Text>
        <Text className="text-sm text-gray-500 mb-8">告诉我们你的出国计划是什么</Text>

        <View className="flex-col gap-4">
          {abroadTypes.map((type) => (
            <TouchableOpacity
              key={type.key}
              className="bg-white rounded-2xl p-5 flex-row items-center border border-gray-100"
              onPress={() => onSelect(type.key)}
              activeOpacity={0.7}
            >
              <View 
                className="w-14 h-14 rounded-xl items-center justify-center"
                style={{ backgroundColor: `${type.iconColor}15` }}
              >
                <type.icon size={28} color={type.iconColor} />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-lg font-semibold text-gray-900">{type.title}</Text>
                <Text className="text-sm text-gray-500 mt-0.5">{type.subtitle}</Text>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
});
