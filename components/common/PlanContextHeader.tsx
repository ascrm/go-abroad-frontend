import { usePlanStore } from "@/src/stores/planStore";
import { useFocusEffect } from "expo-router";
import {
  Calendar,
  ChevronDown,
  Cloud,
  CloudRain,
  Droplets,
  Eye,
  MapPin,
  Snowflake,
  Sun,
  TrendingUp,
  Wind
} from "lucide-react-native";
import { useCallback, useRef, useState } from "react";
import {
  Animated,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

// ============================================
// 天气相关类型与 mock 数据
// ============================================

interface WeatherData {
  temperature: number;
  condition: "sunny" | "cloudy" | "rainy" | "snowy";
  humidity: number;
  wind: number;
  visibility: number;
  bestTime: string;
  currency: string;
  currencyRate: number;
  localTime: string;
  timezone: string;
}

const weatherMockData: Record<string, WeatherData> = {
  "日本": {
    temperature: 18,
    condition: "cloudy",
    humidity: 65,
    wind: 12,
    visibility: 10,
    bestTime: "3月-5月 / 10月-11月",
    currency: "JPY",
    currencyRate: 0.051,
    localTime: "14:30",
    timezone: "JST (UTC+9)",
  },
  "泰国": {
    temperature: 32,
    condition: "sunny",
    humidity: 78,
    wind: 8,
    visibility: 10,
    bestTime: "11月-2月",
    currency: "THB",
    currencyRate: 0.21,
    localTime: "13:30",
    timezone: "ICT (UTC+7)",
  },
  "美国": {
    temperature: 22,
    condition: "sunny",
    humidity: 55,
    wind: 15,
    visibility: 16,
    bestTime: "5月-9月",
    currency: "USD",
    currencyRate: 7.24,
    localTime: "06:30",
    timezone: "EST (UTC-5)",
  },
};

// ============================================
// 工具函数
// ============================================

function getWeatherIcon(condition: WeatherData["condition"]) {
  switch (condition) {
    case "sunny":
      return Sun;
    case "cloudy":
      return Cloud;
    case "rainy":
      return CloudRain;
    case "snowy":
      return Snowflake;
  }
}

function getConditionText(condition: WeatherData["condition"]) {
  switch (condition) {
    case "sunny":
      return "晴";
    case "cloudy":
      return "多云";
    case "rainy":
      return "小雨";
    case "snowy":
      return "小雪";
  }
}

// ============================================
// 进度映射
// ============================================

const STATUS_STEPS = [
  { label: "创建中", key: "draft" },
  { label: "生成中", key: "generating" },
  { label: "已完成", key: "completed" },
  { label: "已归档", key: "archived" },
];

function getProgressSteps(status: string) {
  const idx = STATUS_STEPS.findIndex((s) => s.key === status);
  return { steps: STATUS_STEPS, activeIndex: idx >= 0 ? idx : 0 };
}

// ============================================
// 组件 Props
// ============================================

export interface PlanContextHeaderProps {
  collapsedHeight?: number;
  expandedHeight?: number;
}

// ============================================
// PlanContextHeader 组件
// ============================================

export default function PlanContextHeader({
  collapsedHeight = 120,
  expandedHeight = 360,
}: PlanContextHeaderProps) {
  const { plans, fetchPlans } = usePlanStore();
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const expandAnim = useRef(new Animated.Value(0)).current;
  const contentOpacityAnim = useRef(new Animated.Value(0)).current;
  const contentSlideAnim = useRef(new Animated.Value(0)).current;

  // 优先取 generating，没有则取第一个
  const activePlan = plans.find((p) => p.status === "generating") ?? plans[0];

  useFocusEffect(
    useCallback(() => {
      fetchPlans();
    }, [fetchPlans])
  );

  // 切换展开/收起
  const toggleExpand = useCallback(() => {
    const toValue = expanded ? 0 : 1;
    Animated.parallel([
      Animated.timing(expandAnim, {
        toValue,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(contentOpacityAnim, {
        toValue,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(contentSlideAnim, {
        toValue,
        duration: 240,
        useNativeDriver: true,
      }),
    ]).start();
    setExpanded((prev) => !prev);
  }, [expanded, expandAnim, contentOpacityAnim, contentSlideAnim]);

  const weather = activePlan?.destination.country
    ? weatherMockData[activePlan.destination.country] ?? weatherMockData["日本"]
    : null;

  const { steps, activeIndex } = activePlan ? getProgressSteps(activePlan.status) : { steps: STATUS_STEPS, activeIndex: -1 };

  const WeatherIcon = weather ? getWeatherIcon(weather.condition) : Sun;

  return (
    <View
      className="bg-white mx-4 mb-4 rounded-2xl overflow-hidden"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      {/* ====== 顶部：始终可见（点击展开） ====== */}
      <TouchableOpacity activeOpacity={0.7} onPress={toggleExpand}>
        <View className="px-5 pt-5 pb-4">
          {/* 目的地 + 类型标签 */}
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center gap-2 flex-1">
              <MapPin size={22} color="#3B82F6" className="mr-1" />
              <Text className="text-3xl font-bold text-gray-900">
                {activePlan?.destination.country ?? "暂无规划"}
              </Text>
              {activePlan?.destination.city && (
                <Text className="text-base text-gray-400">{activePlan.destination.city}</Text>
              )}
            </View>
            <View className="flex-row items-center gap-2">
              {/* 圆形进度 */}
              {activePlan && (
                <View className="mr-1 items-center justify-center">
                  <Svg width={42} height={42} viewBox="0 0 42 42">
                    {/* 背景环 */}
                    <Circle
                      cx="21"
                      cy="21"
                      r="16"
                      stroke="#E5E7EB"
                      strokeWidth="3"
                      fill="none"
                    />
                    {/* 进度环 */}
                    <Circle
                      cx="21"
                      cy="21"
                      r="16"
                      stroke="#2563EB"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 16}`}
                      strokeDashoffset={`${2 * Math.PI * 16 * (1 - ((activeIndex + 1) / steps.length))}`}
                      strokeLinecap="round"
                      transform="rotate(-90 21 21)"
                    />
                  </Svg>
                  <View className="absolute inset-0 items-center justify-center">
                    <Text className="text-xs font-bold text-gray-800">
                      {Math.round(((activeIndex + 1) / steps.length) * 100)}%
                    </Text>
                  </View>
                </View>
              )}
              <Animated.View style={{ transform: [{ rotate: expandAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0deg", "180deg"],
              })}] }}>
                <ChevronDown size={18} color="#9CA3AF" />
              </Animated.View>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* ====== 展开内容 ====== */}
      {activePlan && (
        <Animated.View
          style={{
            height: expandAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, contentHeight+155 || 1],
            }),
            overflow: "hidden",
          }}
        >
          <Animated.View
            onLayout={(e) => {
              if (contentHeight === 0) {
                setContentHeight(e.nativeEvent.layout.height);
              }
            }}
            style={{
              opacity: contentOpacityAnim,
              transform: [{
                translateY: contentSlideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-10, 0],
                }),
              }],
            }}
          >
          <View className="px-5  pb-5">
          {weather && (
            <View className="mt-4 bg-blue-50 rounded-xl p-4 mb-4">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2">
                  <WeatherIcon size={28} color="#3B82F6" />
                  <View>
                    <Text className="text-2xl font-bold text-gray-900">{weather.temperature}°C</Text>
                    <Text className="text-xs text-gray-500">{getConditionText(weather.condition)}</Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-sm font-medium text-gray-700">{activePlan.destination.country} {activePlan.destination.city}</Text>
                  <Text className="text-xs text-gray-400">{weather.localTime} {weather.timezone}</Text>
                </View>
              </View>

              {/* 天气详情网格 */}
              <View className="flex-row justify-between">
                {[
                  { icon: Droplets, label: "湿度", value: `${weather.humidity}%` },
                  { icon: Wind, label: "风速", value: `${weather.wind} km/h` },
                  { icon: Eye, label: "能见度", value: `${weather.visibility} km` },
                ].map((item) => (
                  <View key={item.label} className="items-center flex-1">
                    <item.icon size={16} color="#6B7280" />
                    <Text className="text-xs text-gray-500 mt-1">{item.label}</Text>
                    <Text className="text-sm font-semibold text-gray-800">{item.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* 快捷信息行 */}
          <View className="flex-row gap-3">
            {/* 最佳出行时间 */}
            <View className="flex-1 bg-gray-50 rounded-xl p-3">
              <View className="flex-row items-center gap-2 mb-1">
                <Calendar size={14} color="#6B7280" />
                <Text className="text-xs text-gray-500">最佳出行</Text>
              </View>
              <Text className="text-sm font-semibold text-gray-800 leading-tight">
                {weather?.bestTime ?? "—"}
              </Text>
            </View>

            {/* 汇率 */}
            <View className="flex-1 bg-gray-50 rounded-xl p-3">
              <View className="flex-row items-center gap-2 mb-1">
                <TrendingUp size={14} color="#6B7280" />
                <Text className="text-xs text-gray-500">参考汇率</Text>
              </View>
              <Text className="text-sm font-semibold text-gray-800 leading-tight">
                1 CNY ≈ {weather ? (1 * weather.currencyRate).toFixed(2) : "—"} {weather?.currency}
              </Text>
            </View>
          </View>
          </View>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}
