import { usePlanStore } from "@/src/stores/planStore";
import { useFocusEffect } from "expo-router";
import {
  Car,
  Languages,
  Map,
  ShieldAlert, ShieldCheck, Smartphone, Ticket, Utensils, Wallet
} from "lucide-react-native";
import { useCallback } from "react";
import { Linking, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Common tools for the top bar
const commonTools = [
  { 
    id: 1, 
    title: "汇率", 
    icon: Wallet, 
    url: "https://www.imocha.cn",
    color: "#10B981" 
  },
  { 
    id: 2, 
    title: "翻译", 
    icon: Languages, 
    url: "https://translate.google.com",
    color: "#3B82F6" 
  },
  { 
    id: 3, 
    title: "地图", 
    icon: Map, 
    url: "https://www.google.com/maps",
    color: "#EF4444" 
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
  const { plans, fetchPlans } = usePlanStore();
  const activePlan = plans.find((p) => p.status === "generating") ?? plans[0];

  useFocusEffect(
    useCallback(() => {
      fetchPlans();
    }, [fetchPlans])
  );

  const handleOpenLink = async (url: string) => {
    if (url.startsWith('http')) {
      try {
        await Linking.openURL(url);
      } catch (error) {
        console.error('Error opening URL:', error);
      }
    } else if (url.startsWith('tel:')) {
      try {
        await Linking.openURL(url);
      } catch (error) {
        console.error('Error dialing:', error);
      }
    }
  };

  // Get country specific data or fallback to a default structure if needed
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
        
        {/* 1. Plan Context Header */}
        <View className="px-4 pt-4 mb-6">
          <View className="bg-white rounded-xl p-5 border-l-4 border-blue-500 shadow-sm">
             <View className="flex-row justify-between items-start mb-2">
                <Text className="text-sm text-gray-500 font-medium">当前规划</Text>
                <View className="bg-blue-50 px-2 py-1 rounded border border-blue-100">
                   <Text className="text-xs text-blue-600 font-bold">{activePlan?.type ?? "—"}</Text>
                </View>
             </View>
             
             <View className="flex-row items-baseline gap-2 mb-1">
               <Text className="text-2xl font-bold text-gray-900">{activePlan?.destination.country ?? "暂无规划"}</Text>
             </View>

             <Text className="text-base text-gray-500 mb-2">{activePlan?.destination.city ?? "—"}</Text>

             <Text className="text-xs text-gray-400">基于此规划为您提供以下个性化服务</Text>
          </View>
        </View>

        {/* 2. Common Tools (Quick Access) */}
        <View className="px-4 mb-8">
          <Text className="text-lg font-bold text-gray-900 mb-4">实用工具</Text>
          <View className="flex-row justify-between bg-white rounded-2xl p-4">
            {commonTools.map((tool) => (
              <TouchableOpacity 
                key={tool.id} 
                className="items-center flex-1"
                onPress={() => handleOpenLink(tool.url)}
              >
                <View className="w-12 h-12 rounded-full items-center justify-center mb-2" style={{ backgroundColor: `${tool.color}15` }}>
                  <tool.icon size={24} color={tool.color} />
                </View>
                <Text className="text-xs font-medium text-gray-700">{tool.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
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
