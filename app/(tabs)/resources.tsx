import PlanContextHeader from "@/components/common/PlanContextHeader";
import { usePlanStore } from "@/src/stores/planStore";
import type { Resource } from "@/src/types/resource";
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
  Ticket,
  Utensils
} from "lucide-react-native";
import React from "react";
import { Dimensions, ScrollView, Text, TouchableOpacity, View } from "react-native";
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
  Ticket,
  Smartphone,
  IdCardLanyard,
};

function getIcon(name: string): React.ComponentType<any> {
  return iconMap[name] ?? Smartphone;
}

// ----------------------------------------------------------------
// 统一数据（全部是 tb_resource 结构，categoryName = "实用工具" 的条目横滑展示）
// ----------------------------------------------------------------
const resourcesData: Resource[] = [
  // ===================== 实用工具（通用，country = "全球"） =====================
  {
    id: 1, country: "全球",
    categoryId: -1,
    title: "极简汇率",
    description: "简洁高效的汇率换算，多币种实时对照，出国消费心中有数。",
    url: "xcurrency0appsflyer://",
    webUrl: "https://xcurrency.com/",
    logo: "https://play-lh.googleusercontent.com/6_vMtF4gG-fbe1Ir2RGvFQ0l42QWDUOeA6eb9yjtFsEYZ-8xDYLgUTuLHvJZpAt_8lMz=w240-h480-rw",
    imageUrl: "",
    isFeatured: true,
    isActive: true,
    sortOrder: 1,
    createdAt: "", updatedAt: "",
    meta: {
      highlights: ["支持全球主流货币换算", "查看历史走势辅助决策"],
    },
  },
  {
    id: 2, country: "全球", categoryId: -1,
    title: "Google 翻译",
    description: "百余种语言互译，拍照、语音、对话模式覆盖旅途沟通场景。",
    url: "googletranslate://", webUrl: "https://translate.google.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Google_Translate_logo.svg/960px-Google_Translate_logo.svg.png?_=20210606111727",
    imageUrl: "",
    isFeatured: true,
    isActive: true,
    sortOrder: 2,
    createdAt: "", updatedAt: "",
    meta: {
      highlights: ["拍照翻译菜单与路牌", "可下载离线语言包"],
      cta: "打开应用",
    },
  },
  {
    id: 3, country: "全球", categoryId: -1,
    title: "Google 地图",
    description: "步行、驾车与公共交通路线规划，离线地图与收藏地点随时可用。",
    url: "comgooglemaps://", webUrl: "https://www.google.com/maps",
    logo: "https://logores.yrucd.com/wp-content/uploads/2023/08/Google_Maps_logo_PNG4.png!a",
    imageUrl: "",
    isFeatured: true,
    isActive: true,
    sortOrder: 3,
    createdAt: "", updatedAt: "",
    meta: {
      highlights: ["实时路况与预计到达时间", "下载区域离线包省流量"],
      cta: "打开应用",
    },
  },
];

// ----------------------------------------------------------------
// Sub-component: each category manages its own expanded state
// (Hooks must not be called inside .map() callbacks)
// ----------------------------------------------------------------
interface CategoryCardProps {
  cat: { key: string; icon: string; color: string };
  items: Resource[];
  onOpenLink: (url: string, webUrl?: string) => void;
}

function CategoryCard({ cat, items, onOpenLink }: CategoryCardProps) {
  const [expanded, setExpanded] = React.useState(true);
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
        <Text className="text-2xl font-bold text-gray-900 flex-1">{cat.key}</Text>
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
          {rest.map((item, index) => (
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

  // 实用工具横滑（country === "全球"）
  const toolApps = resourcesData.filter((r) => r.country === "全球" && r.isActive);

  // 选中国家的分类资源
  const countryResources = resourcesData.filter(
    (r) => r.country === selectedCountry && r.isActive
  );

  // 按 categoryName 分组，遍历固定顺序
  const categoryOrder = ["签证办理", "酒店住宿", "交通出行", "餐饮美食", "线上购物"];
  const categoryMeta: Record<string, { icon: string; color: string }> = {
    "签证办理": { icon: "ShieldAlert", color: "#3B82F6" },
    "酒店住宿": { icon: "Hotel", color: "#8B5CF6" },
    "交通出行": { icon: "Car", color: "#10B981" },
    "餐饮美食": { icon: "Utensils", color: "#EF4444" },
    "线上购物": { icon: "ShoppingBag", color: "#F59E0B" },
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>

        {/* 规划上下文顶栏 */}
        <PlanContextHeader />

        {/* 实用工具横滑（来自 resourcesData 中 country === "全球"） */}
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

        {/* 分类资源竖向（来自 resourcesData 中 country === selectedCountry） */}
        <View className="px-4">
          {categoryOrder.map((catName) => {
            const items = countryResources.filter((r) => r.categoryName === catName);
            if (items.length === 0) return null;
            const meta = categoryMeta[catName];
            return (
              <CategoryCard
                key={catName}
                cat={{ key: catName, icon: meta.icon, color: meta.color }}
                items={items}
                onOpenLink={handleOpenLink}
              />
            );
          })}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
