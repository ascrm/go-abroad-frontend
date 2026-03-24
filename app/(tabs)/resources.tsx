import PlanContextHeader from "@/components/common/PlanContextHeader";
import { usePlanStore } from "@/src/stores/planStore";
import { Image } from "expo-image";
import * as Linking from "expo-linking";
import {
  Car,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Ticket,
  Utensils
} from "lucide-react-native";
import { Dimensions, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_GAP = 12;
const H_PADDING = 20;
const CARD_WIDTH = SCREEN_WIDTH - H_PADDING * 2;
const CARD_HEIGHT = 240;

const toolApps = [
  {
    id: 1,
    title: "极简汇率",
    description: "简洁高效的汇率换算，多币种实时对照，出国消费心中有数。",
    highlights: ["支持全球主流货币换算", "查看历史走势辅助决策"],
    cta: "打开应用",
    logo: "https://play-lh.googleusercontent.com/6_vMtF4gG-fbe1Ir2RGvFQ0l42QWDUOeA6eb9yjtFsEYZ-8xDYLgUTuLHvJZpAt_8lMz=w240-h480-rw",
    brandColor: "#F97316",
    iconBg: "#DBEAFE",
    url: "xcurrency0appsflyer://",
    webUrl: "https://xcurrency.com/",
  },
  {
    id: 2,
    title: "Google 翻译",
    description: "百余种语言互译，拍照、语音、对话模式覆盖旅途沟通场景。",
    highlights: ["拍照翻译菜单与路牌", "可下载离线语言包"],
    cta: "打开应用",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Google_Translate_logo.svg/960px-Google_Translate_logo.svg.png?_=20210606111727",
    brandColor: "#4285F4",
    iconBg: "#DBEAFE",
    url: "googletranslate://",
    webUrl: "https://translate.google.com",
  },
  {
    id: 3,
    title: "Google 地图",
    description: "步行、驾车与公共交通路线规划，离线地图与收藏地点随时可用。",
    highlights: ["实时路况与预计到达时间", "下载区域离线包省流量"],
    cta: "打开应用",
    logo: "https://logores.yrucd.com/wp-content/uploads/2023/08/Google_Maps_logo_PNG4.png!a",
    brandColor: "#1D4ED8",
    iconBg: "#DBEAFE",
    url: "comgooglemaps://",
    webUrl: "https://www.google.com/maps",
  },
];

// Data for tourism vertical
const tourismData = {
  "日本": {
    "签证": [
      { title: "日本电子签 (e-Visa)", desc: "单次签证在线申请", url: "https://www.evisa.go.jp", icon: ShieldAlert },
      { title: "Visit Japan Web", desc: "入境海关电子申报", url: "https://www.vjw.go.jp", icon: ShieldAlert },
    ],
    "住宿": [
      { title: "Booking.com", desc: "全球酒店预订", url: "https://www.booking.com", icon: Smartphone },
      { title: "Airbnb", desc: "特色民宿体验", url: "https://www.airbnb.com", icon: Smartphone },
      { title: "JALAN", desc: "日本旅行网", url: "https://www.jalan.net", icon: Smartphone },
    ],
    "交通": [
      { title: "Uber", desc: "网约车", url: "https://www.uber.com", icon: Car },
      { title: "Japan Rail Pass", desc: "JR周游券购买", url: "https://www.japanrailpass.com", icon: Car },
    ],
    "门票": [
      { title: "Klook", desc: "景点门票预订", url: "https://www.klook.com", icon: Ticket },
      { title: "环球影城", desc: "门票快速通", url: "https://www.usj.co.jp", icon: Ticket },
    ],
    "餐饮": [
      { title: "Tabelog", desc: "日本餐厅点评", url: "https://www.tabelog.com", icon: Utensils },
      { title: "OpenTable", desc: "餐厅预订", url: "https://www.opentable.com", icon: Utensils },
    ]
  },
  "泰国": {
    "签证": [
      { title: "泰国电子签", desc: "泰国签证申请", url: "https://www.thaievisa.go.th", icon: ShieldAlert },
    ],
    "住宿": [
      { title: "Agoda", desc: "亚洲酒店预订", url: "https://www.agoda.com", icon: Smartphone },
      { title: "Booking.com", desc: "全球酒店预订", url: "https://www.booking.com", icon: Smartphone },
    ],
    "交通": [
      { title: "Grab", desc: "东南亚网约车", url: "https://www.grab.com", icon: Car },
    ],
    "门票": [
      { title: "Klook", desc: "景点门票预订", url: "https://www.klook.com", icon: Ticket },
    ],
    "餐饮": [
      { title: "Wongnai", desc: "泰国餐厅点评", url: "https://www.wongnai.com", icon: Utensils },
    ]
  },
  "美国": {
    "签证": [
      { title: "USTravelDocs", desc: "美国签证申请", url: "https://ustraveldocs.com", icon: ShieldAlert },
    ],
    "住宿": [
      { title: "Booking.com", desc: "全球酒店预订", url: "https://www.booking.com", icon: Smartphone },
      { title: "Airbnb", desc: "民宿预订", url: "https://www.airbnb.com", icon: Smartphone },
    ],
    "交通": [
      { title: "Uber", desc: "网约车", url: "https://www.uber.com", icon: Car },
      { title: "Lyft", desc: "网约车", url: "https://www.lyft.com", icon: Car },
    ],
    "门票": [
      { title: "Klook", desc: "景点门票预订", url: "https://www.klook.com", icon: Ticket },
      { title: "Ticketmaster", desc: "演出票务", url: "https://www.ticketmaster.com", icon: Ticket },
    ],
    "餐饮": [
      { title: "OpenTable", desc: "餐厅预订", url: "https://www.opentable.com", icon: Utensils },
      { title: "Yelp", desc: "餐厅点评", url: "https://www.yelp.com", icon: Utensils },
    ]
  }
};

export default function ResourcesScreen() {
  const handleOpenLink = async (url: string, webUrl?: string) => {
      try {
          // 1. 先尝试直接打开 App（不管它报不报错）
          await Linking.openURL(url);
      } catch (error) {
          // 2. 如果打开失败（没装 App 或 Scheme 错），再跳网页
          if(webUrl)
          await Linking.openURL(webUrl);
      }
  };

  // Get country specific data or fallback to a default structure if needed
  const { plans } = usePlanStore();
  const activePlan = plans.find((p) => p.status === "generating") ?? plans[0];
  const countryData = tourismData[activePlan?.destination.country as keyof typeof tourismData] || tourismData["日本"];

  const categories = [
    { key: "签证", icon: ShieldCheck, color: "#3B82F6" },
    { key: "住宿", icon: Smartphone, color: "#8B5CF6" },
    { key: "交通", icon: Car, color: "#10B981" },
    { key: "门票", icon: Ticket, color: "#F59E0B" },
    { key: "餐饮", icon: Utensils, color: "#EF4444" },
  ];

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>

        {/* 规划上下文顶栏 */}
        <PlanContextHeader />

        {/* 实用工具 */}
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
                {/* 顶部：图标 + 标题 */}
                <View className="flex-row items-center">
                  <Image
                    source={{ uri: tool.logo }}
                    style={{ width: 44, height: 44 }}
                    contentFit="contain"
                    cachePolicy="memory-disk"
                  />
                  <Text className="text-xl font-bold text-gray-900 ml-4">{tool.title}</Text>
                </View>

                {/* 描述 */}
                <Text className="text-sm text-gray-400 leading-6 mt-3 mb-auto">{tool.description}</Text>

                {/* 底部按钮 */}
                <View
                  className="rounded-xl py-3 items-center mt-4 flex-row justify-center"
                  style={{ backgroundColor: "#111111" }}
                >
                  <Text className="text-sm font-semibold text-white mr-2">{tool.cta}</Text>
                  <ExternalLink size={14} color="#FFFFFF" strokeWidth={2.5} />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 3. Vertical Categories (Tourism) */}
        <View className="px-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">个性化推荐</Text>

          {categories.map((cat) => {
            const items = countryData[cat.key as keyof typeof countryData];
            if (!items) return null;

            return (
              <View key={cat.key} className="bg-white rounded-2xl p-4 mb-6">
                <View className="flex-row items-center mb-4">
                  <View className="w-8 h-8 rounded-lg items-center justify-center mr-2" style={{ backgroundColor: `${cat.color}15` }}>
                    <cat.icon size={16} color={cat.color} />
                  </View>
                  <Text className="text-base font-bold text-gray-900">{cat.key}</Text>
                </View>

                {items.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    className="flex-row items-center justify-between py-4 border-t border-gray-100"
                    onPress={() => handleOpenLink(item.url)}
                  >
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 rounded-lg bg-gray-100 items-center justify-center mr-3">
                        <item.icon size={20} color="#4B5563" />
                      </View>
                      <Text className="text-base font-medium text-gray-900">{item.title}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            );
          })}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
