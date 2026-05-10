import type { Resource, ResourceCategory } from "@/src/types/resource";
import { getCategoryList, getResourceList } from "@/src/api/resource";
import { Image } from "expo-image";
import * as Linking from "expo-linking";
import {
  Car,
  ChevronRight,
  ExternalLink,
  Flag,
  Hotel,
  IdCardLanyard,
  MapPin,
  ShieldAlert,
  ShoppingBag,
  Smartphone,
  Star,
  Utensils
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { storage } from "@/src/utils/storage";

// icon 名称 → Lucide 组件映射
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
  return iconMap[name] ?? Star;
}

interface ResourceCardProps {
  resource: Resource;
  icon: React.ComponentType<any>;
  color: string;
  onPress: () => void;
}

function ResourceCard({ resource, icon: IconComp, color, onPress }: ResourceCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="bg-white rounded-2xl p-4 mb-3 flex-row items-center"
      style={{ borderWidth: 1, borderColor: "#F0F0F0" }}
    >
      <View
        className="w-12 h-12 rounded-xl items-center justify-center"
        style={{ backgroundColor: `${color}15` }}
      >
        <IconComp size={22} color={color} />
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-base font-semibold text-gray-900">{resource.title}</Text>
        <Text className="text-sm text-gray-500 mt-0.5" numberOfLines={1}>
          {resource.description}
        </Text>
      </View>
      <ExternalLink size={16} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

interface FeaturedCardProps {
  resource: Resource;
  icon: React.ComponentType<any>;
  color: string;
  onPress: () => void;
}

function FeaturedCard({ resource, icon: IconComp, color, onPress }: FeaturedCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="rounded-2xl overflow-hidden mb-6"
      style={{ backgroundColor: "white", borderWidth: 1, borderColor: "#F0F0F0" }}
    >
      {resource.imageUrl && (
        <Image
          source={{ uri: resource.imageUrl }}
          style={{ width: "100%", height: 160 }}
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
            <Text className="text-lg font-bold text-gray-900">{resource.title}</Text>
            <Text className="text-xs text-gray-400 mt-0.5">{resource.description}</Text>
          </View>
        </View>
        <View
          className="rounded-xl py-2.5 items-center flex-row justify-center mt-3"
          style={{ backgroundColor: color }}
        >
          <Text className="text-white font-medium text-sm mr-2">
            {resource.meta?.cta ?? "打开应用"}
          </Text>
          <ExternalLink size={14} color="#FFFFFF" strokeWidth={2.5} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

interface CategorySectionProps {
  category: ResourceCategory;
  resources: Resource[];
  onOpenLink: (url: string, webUrl?: string) => void;
}

function CategorySection({ category, resources, onOpenLink }: CategorySectionProps) {
  const [expanded, setExpanded] = useState(true);
  const IconComp = getIcon(category.icon);
  const featured = resources.find((r) => r.isFeatured) ?? resources[0];
  const rest = resources.filter((r) => r.id !== featured?.id);

  if (resources.length === 0) return null;

  return (
    <View className="mb-6">
      {/* 分类标题 */}
      <TouchableOpacity
        activeOpacity={0.7}
        className="flex-row items-center justify-between mb-4"
        onPress={() => setExpanded((v) => !v)}
      >
        <View className="flex-row items-center">
          <View
            className="w-10 h-10 rounded-xl items-center justify-center mr-3"
            style={{ backgroundColor: `${category.color}15` }}
          >
            <IconComp size={22} color={category.color} />
          </View>
          <Text className="text-lg font-bold text-gray-900">{category.name}</Text>
          <Text className="text-sm text-gray-400 ml-2">({resources.length})</Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-sm text-gray-400 mr-1">
            {expanded ? "收起" : "展开"}
          </Text>
          <ChevronRight
            size={16}
            color="#9CA3AF"
            style={{ transform: [{ rotate: expanded ? "90deg" : "0deg" }] }}
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View>
          {/* 精选卡片 */}
          {featured && (
            <FeaturedCard
              resource={featured}
              icon={IconComp}
              color={category.color}
              onPress={() => onOpenLink(featured.url, featured.webUrl)}
            />
          )}

          {/* 其他资源列表 */}
          {rest.map((item) => (
            <ResourceCard
              key={item.id}
              resource={item}
              icon={IconComp}
              color={category.color}
              onPress={() => onOpenLink(item.url, item.webUrl)}
            />
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
  const [selectedCountry, setSelectedCountry] = useState("日本");

  const handleOpenLink = async (url: string, webUrl?: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      if (webUrl) await Linking.openURL(webUrl);
    }
  };

  // 每次进入页面时实时刷新数据
  useFocusEffect(
    useCallback(() => {
      const loadAll = async () => {
        const plan = await storage.getGeneratingPlan();
        const country = plan?.destination.country ?? "日本";
        setSelectedCountry(country);
        setLoading(true);
        try {
          const [categoriesData, toolData, countryData] = await Promise.all([
            getCategoryList(),
            getResourceList("全球"),
            getResourceList(country),
          ]);
          setCategories(categoriesData.filter((c) => c.isActive && c.name !== "实用工具"));
          setToolApps(toolData.filter((r) => r.isActive));
          setCountryResources(countryData.filter((r) => r.isActive));
        } catch (error) {
          console.error("加载资源失败:", error);
        } finally {
          setLoading(false);
        }
      };
      loadAll();
    }, [])
  );

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-gray-50">
      {/* 头部 */}
      <View className="px-5 pt-4 pb-3 bg-white border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-900">实用资源</Text>
            <View className="flex-row items-center mt-1">
              <MapPin size={14} color="#6B7280" />
              <Text className="text-sm text-gray-500 ml-1">{selectedCountry}</Text>
            </View>
          </View>
          <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
            <Flag size={18} color="#6B7280" />
          </View>
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

        {/* 工具类横滑卡片 */}
        {!loading && toolApps.length > 0 && (
          <View className="px-5 pt-5">
            <Text className="text-base font-semibold text-gray-900 mb-3">
              旅行工具
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              contentContainerStyle={{ gap: 12 }}
            >
              {toolApps.map((tool) => {
                const IconComp = getIcon(
                  categories.find((c) => c.id === tool.categoryId)?.icon ?? "Smartphone"
                );
                const color =
                  categories.find((c) => c.id === tool.categoryId)?.color ?? "#0EA5E9";
                return (
                  <TouchableOpacity
                    key={tool.id}
                    activeOpacity={0.85}
                    onPress={() => handleOpenLink(tool.url, tool.webUrl)}
                    className="rounded-2xl p-5"
                    style={{
                      width: 200,
                      backgroundColor: "white",
                      borderWidth: 1,
                      borderColor: "#F0F0F0",
                    }}
                  >
                    <View
                      className="w-12 h-12 rounded-xl items-center justify-center mb-3"
                      style={{ backgroundColor: `${color}15` }}
                    >
                      <IconComp size={24} color={color} />
                    </View>
                    <Text className="text-base font-bold text-gray-900 mb-1">
                      {tool.title}
                    </Text>
                    <Text
                      className="text-sm text-gray-500 leading-snug"
                      numberOfLines={2}
                    >
                      {tool.description}
                    </Text>
                    <View
                      className="rounded-lg py-2 items-center flex-row justify-center mt-3"
                      style={{ backgroundColor: color }}
                    >
                      <Text className="text-white text-xs font-medium mr-1">
                        {tool.meta?.cta ?? "打开"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* 分类资源 */}
        {!loading && (
          <View className="px-5 pt-6">
            <Text className="text-base font-semibold text-gray-900 mb-4">
              分类推荐
            </Text>
            {categories.map((cat) => {
              const items = countryResources.filter((r) => r.categoryId === cat.id);
              return (
                <CategorySection
                  key={cat.id}
                  category={cat}
                  resources={items}
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