import type { Plan, RecommendedResource } from "@/src/types/plan";
import { getPlanList } from "@/src/api/plan";
import { Image } from "expo-image";
import * as Linking from "expo-linking";
import {
  Car,
  ExternalLink,
  MapPin,
  ShieldAlert,
  ShoppingBag,
  Smartphone,
  Star,
  Utensils,
  Bookmark,
  Info,
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";

// icon 名称 → Lucide 组件映射
const iconMap: Record<string, React.ComponentType<any>> = {
  ShieldAlert,
  Car,
  Utensils,
  ShoppingBag,
  Smartphone,
};

// 分类颜色映射
const categoryColorMap: Record<string, string> = {
  "签证": "#F59E0B",
  "住宿": "#3B82F6",
  "交通": "#10B981",
  "餐饮": "#EF4444",
  "购物": "#EC4899",
  "支付": "#8B5CF6",
  "通讯": "#6366F1",
  "安全": "#F97316",
  "语言学习": "#0EA5E9",
  "学术资源": "#14B8A6",
  "求职招聘": "#84CC16",
  "其他": "#6B7280",
};

function getCategoryColor(category: string): string {
  return categoryColorMap[category] ?? "#6B7280";
}

// 通用工具固定配置
interface ToolApp {
  title: string;
  description: string;
  icon: string;
  url: string;
  webUrl?: string;
  color: string;
}

const TOOL_APPS: ToolApp[] = [
  {
    title: "Google Maps",
    description: "全球地图导航",
    icon: "https://www.gstatic.com/images/branding/product/1x/maps_64dp.png",
    url: "comgooglemaps://",
    webUrl: "https://www.google.com/maps",
    color: "#4285F4",
  },
  {
    title: "Google Translate",
    description: "即时语音翻译",
    icon: "https://www.gstatic.com/images/branding/product/1x/translate_64dp.png",
    url: "googletranslate://",
    webUrl: "https://translate.google.com",
    color: "#4285F4",
  },
  {
    title: "Uber",
    description: "全球出行打车",
    icon: "https://ts2.tc.mm.bing.net/th/id/OIP-C.a2QMcuXud9pqcQFq2REmEQHaHa?cb=thfc1&rs=1&pid=ImgDetMain&o=7&rm=3",
    url: "uber://",
    webUrl: "https://m.uber.com",
    color: "#000000",
  },
  {
    title: "Wise",
    description: "国际汇款/线下支付",
    icon: "https://ts3.tc.mm.bing.net/th/id/OIP-C.CBZnEmIuyE2Rjbuh9qbINwAAAA?cb=thfc1&rs=1&pid=ImgDetMain&o=7&rm=3",
    url: "wise://",
    webUrl: "https://wise.com",
    color: "#009452",
  },
  {
    title: "Booking",
    description: "全球酒店预订",
    icon: "https://ts3.tc.mm.bing.net/th/id/OIP-C.OYAYSjTzqDebrq-OXTL0SQAAAA?cb=thfc1&rs=1&pid=ImgDetMain&o=7&rm=3",
    url: "booking://",
    webUrl: "https://www.booking.com",
    color: "#003580",
  },
  {
    title: "Amazon Shopping",
    description: "全球购物配送",
    icon: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    url: "amazon://",
    webUrl: "https://www.amazon.com",
    color: "#FF9900",
  },
];

interface RecommendCardProps {
  resource: RecommendedResource;
  onPress: () => void;
}

function RecommendCard({ resource, onPress }: RecommendCardProps) {
  const color = getCategoryColor(resource.category);
  const IconComp = iconMap[resource.category] ?? Star;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="rounded-2xl overflow-hidden mb-3"
      style={{
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#F0F0F0",
      }}
    >
      {/* 封面图 */}
      {resource.coverImage && (
        <Image
          source={{ uri: resource.coverImage }}
          style={{ width: "100%", height: 120 }}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      )}
      <View className="p-4">
        <View className="flex-row items-center mb-2">
          <View
            className="w-10 h-10 rounded-lg items-center justify-center mr-2"
            style={{ backgroundColor: `${color}15` }}
          >
            <IconComp size={20} color={color} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900">{resource.title}</Text>
            <Text className="text-xs text-gray-400 mt-0.5">{resource.description}</Text>
          </View>
        </View>
        {resource.cta && (
          <View
            className="rounded-lg py-2.5 items-center flex-row justify-center mt-3"
            style={{ backgroundColor: color }}
          >
            <Text className="text-white text-xs font-medium mr-2">{resource.cta}</Text>
            <ExternalLink size={12} color="#FFFFFF" strokeWidth={2.5} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

interface ToolAppCardProps {
  tool: ToolApp;
  onPress: () => void;
}

function ToolAppCard({ tool, onPress }: ToolAppCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="rounded-2xl p-4 mr-3"
      style={{
        width: 220,
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#F0F0F0",
      }}
    >
      <View className="w-16 h-16 rounded-2xl items-center justify-center mb-3 overflow-hidden" style={{ backgroundColor: "#F9F9F9" }}>
        <Image
          source={{ uri: tool.icon }}
          style={{ width: 48, height: 48 }}
          contentFit="contain"
          cachePolicy="memory-disk"
        />
      </View>
      <Text className="text-base font-bold text-gray-900 mb-1">{tool.title}</Text>
      <Text className="text-sm text-gray-500 mb-4" numberOfLines={2}>{tool.description}</Text>
      <View className="rounded-lg py-2.5 items-center" style={{ backgroundColor: "#18181B" }}>
        <Text className="text-white text-sm font-medium">打开应用</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function ResourcesScreen() {
  const [recommendations, setRecommendations] = useState<RecommendedResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [planType, setPlanType] = useState<string>("");
  const [hasActivePlan, setHasActivePlan] = useState(false);

  const handleOpenLink = async (url: string, webUrl?: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      if (webUrl) await Linking.openURL(webUrl);
    }
  };

  // 每次进入页面时查询正在进行中的规划
  useFocusEffect(
    useCallback(() => {
      const loadPlanData = async () => {
        setLoading(true);
        try {
          // 查询正在进行中的规划
          const response = await getPlanList({ status: "generating", pageSize: 1 });
          const plans = response.list || [];

          if (plans.length > 0) {
            const plan = plans[0];
            setHasActivePlan(true);
            setSelectedCountry(plan.destination?.country ?? null);
            setPlanType(plan.type ?? "");

            // 从规划中读取推荐资源
            if (plan.resource && plan.resource.length > 0) {
              setRecommendations(plan.resource);
            } else {
              setRecommendations([]);
            }
          } else {
            // 没有进行中的规划，查询最新规划
            const latestResponse = await getPlanList({ pageSize: 1 });
            const latestPlans = latestResponse.list || [];

            if (latestPlans.length > 0) {
              const plan = latestPlans[0];
              setHasActivePlan(true);
              setSelectedCountry(plan.destination?.country ?? null);
              setPlanType(plan.type ?? "");

              if (plan.resource && plan.resource.length > 0) {
                setRecommendations(plan.resource);
              } else {
                setRecommendations([]);
              }
            } else {
              setHasActivePlan(false);
              setSelectedCountry(null);
              setRecommendations([]);
            }
          }
        } catch (error) {
          console.error("加载规划数据失败:", error);
          setHasActivePlan(false);
        } finally {
          setLoading(false);
        }
      };
      loadPlanData();
    }, [])
  );

  // 根据规划类型生成推荐标题
  const getRecommendTitle = () => {
    switch (planType) {
      case "tourism":
        return "旅游推荐";
      case "study":
        return "留学推荐";
      case "work":
        return "工作推荐";
      case "immigration":
        return "移民推荐";
      default:
        return "为你推荐";
    }
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-gray-50">
      {/* 头部 - 无背景色 */}
      <View className="px-5 pt-4 pb-3">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-900">实用资源</Text>
          </View>
          {selectedCountry && (
            <View className="flex-row items-center px-3 py-1.5 rounded-full">
              <MapPin size={16} color="#3B82F6" />
              <Text className="text-base font-medium text-blue-600 ml-1">{selectedCountry}</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {/* 加载中 */}
        {loading && (
          <View className="items-center justify-center py-16">
            <ActivityIndicator size="large" color="#6B7280" />
          </View>
        )}

        {/* 通用工具 - 始终显示 */}
        {!loading && (
          <View className="px-5 pt-5">
            <Text className="text-base font-semibold text-gray-900 mb-3">
              通用工具
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              contentContainerStyle={{ paddingRight: 20 }}
            >
              {TOOL_APPS.map((tool) => (
                <ToolAppCard
                  key={tool.title}
                  tool={tool}
                  onPress={() => handleOpenLink(tool.url, tool.webUrl)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* AI 推荐资源 - 有规划且有资源才显示 */}
        {!loading && hasActivePlan && recommendations.length > 0 && (
          <View className="px-5 pt-6">
            <View className="flex-row items-center mb-3">
              <Bookmark size={18} color="#6B7280" className="mr-2" />
              <Text className="text-base font-semibold text-gray-900">
                {getRecommendTitle()}
              </Text>
              <View className="ml-2 px-2 py-0.5 rounded-full bg-blue-50">
                <Text className="text-xs text-blue-600">AI 智能推荐</Text>
              </View>
            </View>
            {recommendations.map((item, index) => (
              <RecommendCard
                key={index}
                resource={item}
                onPress={() => handleOpenLink(item.url, item.webUrl)}
              />
            ))}
          </View>
        )}

        {/* 没有进行中的规划时显示提示文字 */}
        {!loading && (!hasActivePlan || recommendations.length === 0) && (
          <View className="px-5 pt-6">
            <View className="flex-row items-center mb-3">
              <Info size={18} color="#6B7280" className="mr-2" />
              <Text className="text-base font-semibold text-gray-900">
                AI 智能推荐
              </Text>
            </View>
            <View className="bg-white rounded-2xl p-4" style={{ borderWidth: 1, borderColor: "#F0F0F0" }}>
              <Text className="text-sm text-gray-500 leading-5">
                {hasActivePlan
                  ? "当前规划暂无推荐资源，请在规划详情页面生成完整的规划后，再来查看 AI 为您推荐的实用资源。"
                  : "暂无进行中的规划，请在首页创建规划后，AI 将根据您的规划目的地为推荐相关实用资源。"}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}