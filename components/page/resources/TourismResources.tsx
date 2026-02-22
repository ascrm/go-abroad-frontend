import {
  Building2,
  Car,
  Coffee,
  Languages,
  Map,
  MapPin,
  Phone,
  Plane,
  ShieldCheck,
  Ticket,
  Train,
  Utensils,
  Wallet,
  Zap
} from "lucide-react-native";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

// 1. 官方与合规资源
const officialResources = [
  { id: 1, title: "签证申请中心", desc: "各国签证办理入口", url: "#", icon: ShieldCheck },
  { id: 2, title: "Visit Japan Web", desc: "日本入境电子申报", url: "#", icon: Plane },
  { id: 3, title: "泰国旅游局", desc: "官方旅游资讯", url: "#", icon: Building2 },
];

// 2. 住宿与安家速达
const stayResources = [
  { id: 1, title: "Booking.com", desc: "全球酒店预订", url: "#", icon: MapPin },
  { id: 2, title: "Airbnb", desc: "特色民宿体验", url: "#", icon: Building2 },
  { id: 3, title: "Agoda", desc: "亚洲特价酒店", url: "#", icon: MapPin },
  { id: 4, title: "星野集团", desc: "高端温泉度假", url: "#", icon: Building2 },
];

// 3. 交通与移动枢纽
const transportResources = [
  { id: 1, title: "Skyscanner", desc: "机票比价预订", url: "#", icon: Plane },
  { id: 2, title: "欧铁 Eurail", desc: "欧洲铁路通票", url: "#", icon: Train },
  { id: 3, title: "Google Maps", desc: "必备导航地图", url: "#", icon: Map },
  { id: 4, title: "Uber / Grab", desc: "网约车平台", url: "#", icon: Car },
];

// 4. 体验与门票直达
const experienceResources = [
  { id: 1, title: "Klook", desc: "景点门票/一日游", url: "#", icon: Ticket },
  { id: 2, title: "GetYourGuide", desc: "当地体验预订", url: "#", icon: Ticket },
  { id: 3, title: "Tabelog", desc: "日本餐厅点评", url: "#", icon: Utensils },
  { id: 4, title: "OpenTable", desc: "餐厅预订", url: "#", icon: Coffee },
];

// 5. 应急与生存工具
const utilityResources = [
  { id: 1, title: "汇率计算器", desc: "实时汇率换算", url: "#", icon: Wallet },
  { id: 2, title: "Google Translate", desc: "即时语音翻译", url: "#", icon: Languages },
  { id: 3, title: "紧急求助", desc: "使领馆联系名录", url: "#", icon: Phone },
  { id: 4, title: "ATM 地图", desc: "附近取现点", url: "#", icon: Zap },
];

const ResourceSection = ({ title, resources, color, count }: { title: string, resources: any[], color: string, count?: number }) => (
  <View className="mb-8">
    <View className="flex-row items-center justify-between px-4 mb-4">
      <View className="flex-row items-center gap-2">
        <View className={`w-1 h-4 rounded-full`} style={{ backgroundColor: color }} />
        <Text className="text-base font-bold text-gray-900">{title}</Text>
      </View>
    </View>

    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-4 pr-2 gap-3">
      {resources.map((item) => (
        <TouchableOpacity 
          key={item.id} 
          className="w-32 bg-white rounded-xl p-4 mr-4"
          onPress={() => console.log(item.url)}
        >
          <View className="w-10 h-10 rounded-lg items-center justify-center mb-2" style={{ backgroundColor: `${color}15` }}>
            <item.icon size={20} color={color} />
          </View>
          <Text className="text-sm font-semibold text-gray-900 mb-1" numberOfLines={1}>{item.title}</Text>
          <Text className="text-xs text-gray-400" numberOfLines={1}>{item.desc}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

export const TourismResources = () => {
  return (
    <View className="flex-1 bg-gray-50">
      {/* Search Header */}
      {/* <View className="bg-white px-4 pt-4 pb-4">
        <View className="bg-gray-100 rounded-xl flex-row items-center px-3 py-2.5">
          <Search size={18} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-sm text-gray-700"
            placeholder="搜索旅游攻略或工具..."
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View> */}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        
        {/* 1. 官方与合规 */}
        <View className="mt-4">
          <ResourceSection 
            title="官方与合规" 
            resources={officialResources} 
            color="#3B82F6" 
          />
        </View>

        {/* 2. 住宿与安家 */}
        <ResourceSection 
          title="住宿与安家" 
          resources={stayResources} 
          color="#8B5CF6" 
        />

        {/* 3. 交通与移动 */}
        <ResourceSection 
          title="交通与移动" 
          resources={transportResources} 
          color="#10B981" 
        />

        {/* 4. 体验与门票 */}
        <ResourceSection 
          title="体验与门票" 
          resources={experienceResources} 
          color="#F59E0B" 
        />

        {/* 5. 应急与工具 */}
        <ResourceSection 
          title="应急与工具" 
          resources={utilityResources} 
          color="#EF4444" 
        />

      </ScrollView>
    </View>
  );
};
