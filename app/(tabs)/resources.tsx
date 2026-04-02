import PlanContextHeader from "@/components/common/PlanContextHeader";
import { usePlanStore } from "@/src/stores/planStore";
import type { Resource, ResourceCategory } from "@/src/types/resource";
import { getCategoryList, getResourceList } from "@/src/api/resource";
import { Image } from "expo-image";
import * as Linking from "expo-linking";
import {
  Car,
  ExternalLink,
  Hotel,
  IdCardLanyard,
  ShieldAlert,
  ShoppingBag,
  Smartphone,
  Utensils
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_GAP = 12;
const H_PADDING = 20;
const CARD_WIDTH = SCREEN_WIDTH - H_PADDING * 2;
const CARD_HEIGHT = 240;

// ----------------------------------------------------------------
// icon 名称 → Lucide 组件映射（分类图标渲染）
// ----------------------------------------------------------------
const iconMap: Record<string, React.ComponentType<any>> = {
  ShieldAlert,
  Hotel,
  Car,
  Utensils,
  ShoppingBag,
  Smartphone,
  IdCardLanyard,
};

function getIcon(name: string): React.ComponentType<any> {
  return iconMap[name] ?? Smartphone;
}

// ----------------------------------------------------------------
// Sub-component: each category manages its own expanded state
// (Hooks must not be called inside .map() callbacks)
// ----------------------------------------------------------------
interface CategoryCardProps {
  cat: ResourceCategory;
  items: Resource[];
  onOpenLink: (url: string, webUrl?: string) => void;
}

function CategoryCard({ cat, items, onOpenLink }: CategoryCardProps) {
  const [expanded, setExpanded] = useState(true);
  const featured = items[0];
  const rest = items.slice(1);
  const IconComp = getIcon(cat.icon);

  return (
    <View className="mb-6">
      {/* 分类标题行 */}
      <TouchableOpacity
        activeOpacity={0.7}
        className="flex-row items-center mb-3 mt-6"
        onPress={() => setExpanded((v) => !v)}
      >
        <View
          className="w-10 h-10 rounded-lg items-center justify-center mr-2"
          style={{ backgroundColor: `${cat.color}18` }}
        >
          <IconComp size={24} color={cat.color} />
        </View>
        <Text className="text-2xl font-bold text-gray-900 flex-1">{cat.name}</Text>
      </TouchableOpacity>

      {/* 展开时展示内容 */}
      {expanded && (
        <View>
          {/* 精选大卡片 */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onOpenLink(featured.url, featured.webUrl)}
            className="rounded-2xl overflow-hidden mb-2"
            style={{ backgroundColor: "white", borderWidth: 1, borderColor: "#F0F0F0" }}
          >
            {featured.imageUrl && (
              <Image
                source={{ uri: featured.imageUrl }}
                style={{ width: "100%", height: 200 }}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
            )}
            <View className="p-4">
              <View className="flex-row items-center mb-3">
                <View
                  className="w-11 h-11 rounded-xl items-center justify-center mr-3"
                  style={{ backgroundColor: `${cat.color}15` }}
                >
                  <IconComp size={24} color={cat.color} />
                </View>
                <Text className="text-xl font-bold text-gray-900 flex-1">{featured.title}</Text>
              </View>
              <Text className="text-sm text-gray-500 leading-5">{featured.description}</Text>
            </View>
            <View className="px-4 pb-4">
              <TouchableOpacity
                activeOpacity={0.7}
                className="rounded-xl py-3 items-center flex-row justify-center"
                style={{ backgroundColor: "#111111" }}
                onPress={() => onOpenLink(featured.url, featured.webUrl)}
              >
                <Text className="text-sm font-semibold text-white mr-2">打开应用</Text>
                <ExternalLink size={14} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          {/* 其余小条目 */}
          {rest.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.7}
              onPress={() => onOpenLink(item.url, item.webUrl)}
              className="flex-row items-center justify-between py-4 bg-white rounded-xl px-4 mb-2"
              style={{ borderWidth: 1, borderColor: "#F5F5F5" }}
            >
              <View className="flex-row items-center flex-1">
                <View className="flex-1">
                  <Text className="text-base font-medium text-gray-900">{item.title}</Text>
                  <Text className="text-sm text-gray-400 mt-0.5">{item.description}</Text>
                </View>
              </View>
              <ExternalLink size={16} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

export default function ResourcesScreen() {
  const [toolApps, setToolApps] = useState<Resource[]>([]);
  const [countryResources, setCountryResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [loading, setLoading] = useState(false);

  const handleOpenLink = async (url: string, webUrl?: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      if (webUrl) await Linking.openURL(webUrl);
    }
  };

  const { plans } = usePlanStore();
  const activePlan = plans.find((p) => p.status === "generating") ?? plans[0];
  const selectedCountry = (activePlan?.destination.country as string) || "日本";

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [categoriesData, toolData, countryData] = await Promise.all([
        getCategoryList(),
        getResourceList('全球'),
        getResourceList(selectedCountry),
      ]);
      // 按 sortOrder 排序，排除"实用工具"分类（工具 App 以 country="全球" 展示）
      setCategories(categoriesData.filter((c) => c.isActive && c.name !== '实用工具'));
      setToolApps(toolData.filter((r) => r.isActive));
      setCountryResources(countryData.filter((r) => r.isActive));
    } catch (error) {
      console.error('加载资源失败:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCountry]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>

        {/* 规划上下文顶栏 */}
        <PlanContextHeader />

        {/* 加载中 */}
        {loading && (
          <View className="items-center justify-center py-8">
            <ActivityIndicator size="large" color="#6B7280" />
          </View>
        )}

        {/* 实用工具横滑 */}
        {!loading && toolApps.length > 0 && (
          <View className="mb-8" style={{ paddingHorizontal: H_PADDING }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              snapToInterval={CARD_WIDTH + CARD_GAP}
              snapToAlignment="start"
              contentContainerStyle={{ gap: CARD_GAP }}
            >
              {toolApps.map((tool) => (
                <TouchableOpacity
                  key={tool.id}
                  activeOpacity={0.8}
                  onPress={() => handleOpenLink(tool.url, tool.webUrl)}
                  style={{
                    width: CARD_WIDTH,
                    height: CARD_HEIGHT,
                    backgroundColor: "white",
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: "#F0F0F0",
                    padding: 24,
                    justifyContent: "space-between",
                  }}
                >
                  <View className="flex-row items-center">
                    <Image
                      source={{ uri: tool.logo ?? tool.imageUrl ?? "" }}
                      style={{ width: 44, height: 44 }}
                      contentFit="contain"
                      cachePolicy="memory-disk"
                    />
                    <Text className="text-xl font-bold text-gray-900 ml-4">{tool.title}</Text>
                  </View>
                  <Text className="text-sm text-gray-400 leading-6 mt-3 mb-auto">{tool.description}</Text>
                  <View
                    className="rounded-xl py-3 items-center mt-4 flex-row justify-center"
                    style={{ backgroundColor: "#111111" }}
                  >
                    <Text className="text-sm font-semibold text-white mr-2">
                      {tool.meta?.cta ?? "打开应用"}
                    </Text>
                    <ExternalLink size={14} color="#FFFFFF" strokeWidth={2.5} />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* 分类资源竖向 */}
        {!loading && (
          <View className="px-4">
            {categories.map((cat) => {
              const items = countryResources.filter((r) => r.categoryId === cat.id);
              if (items.length === 0) return null;
              return (
                <CategoryCard
                  key={cat.id}
                  cat={cat}
                  items={items}
                  onOpenLink={handleOpenLink}
                />
              );
            })}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
