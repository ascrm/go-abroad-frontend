import { User as UserType } from "@/src/types/auth";
import { profileApi, BrowseHistoryItem } from "@/src/api/profile";
import { getPlanList, Plan } from "@/src/api/plan";
import { storage } from "@/src/utils/storage";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { Bell, Bookmark, ChevronDown, FileText, Folder, Plus, Settings } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const [user, setUser] = useState<UserType | null>(null);
  const [history, setHistory] = useState<BrowseHistoryItem[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const userStr = await storage.getUser();
      if (userStr) {
        const userData = JSON.parse(userStr) as UserType;
        setUser(userData);
      }
      const [historyData, plansData] = await Promise.all([
        profileApi.getBrowseHistory(),
        getPlanList({ page: 1, pageSize: 10 }),
      ]);
      setHistory(historyData);
      setPlans(plansData.list || []);
    } catch (error) {
      console.error("加载数据失败:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      {/* 顶部导航栏 */}
      <View className="bg-white px-4 py-2 flex-row items-center justify-between">
        {/* 左上角账号按钮 */}
        <Pressable
          accessibilityLabel="切换账号"
          accessibilityHint="点击切换或管理账号"
          className="flex-row items-center px-3 py-1.5 rounded-full border border-gray-200"
          style={{ minWidth: 72 }}
          onPress={() => router.push("/(profile)/switch-account")}
        >
          <Text className="text-sm font-medium text-gray-700">账号</Text>
          <ChevronDown size={14} color="#6B7280" style={{ marginLeft: 2 }} />
        </Pressable>

        {/* 右上角按钮组 */}
        <View className="flex-row items-center gap-1">
          <TouchableOpacity
            accessibilityLabel="消息通知"
            className="p-2 rounded-full active:bg-gray-100"
            onPress={() => router.push("/(profile)/messages")}
          >
            <Bell size={22} color="#4B5563" />
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityLabel="设置"
            className="p-2 rounded-full active:bg-gray-100"
            onPress={() => router.push("/(profile)/settings")}
          >
            <Settings size={22} color="#4B5563" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        {/* 用户信息区 */}
        <View className="bg-white px-5 py-6">
          <Pressable
            accessibilityLabel={`${user?.nickname || "未登录用户"}，点击编辑资料`}
            className="flex-row items-center active:opacity-80"
            onPress={() => router.push("/(profile)/edit-profile")}
          >
            <View className="w-20 h-20 rounded-full border-2 border-gray-100 overflow-hidden mr-4 items-center justify-center bg-gray-100">
              <Image
                source={{
                  uri: user?.avatar || "https://api.dicebear.com/7.x/avataaars/png?seed=default",
                }}
                style={{ width: 76, height: 76 }}
                contentFit="cover"
                contentPosition="center"
              />
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-900">
                {user?.nickname || "未登录用户"}
              </Text>
              <Text className="text-gray-500 mt-1">@{user?.username || "guest_user"}</Text>
            </View>
          </Pressable>
        </View>

        {/* 加载状态 */}
        {loading ? (
          <View className="items-center justify-center py-16">
            <ActivityIndicator size="large" color="#6B7280" />
          </View>
        ) : (
          <>
            {/* 历史记录区 */}
            <View className="px-4 pt-6">
              <View className="flex-row justify-between items-center mb-4 px-1">
                <Text className="text-lg font-bold text-gray-900">历史记录</Text>
                <TouchableOpacity>
                  <Text className="text-sm font-medium text-blue-600">查看全部</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 16 }}
              >
                {history.map((item) => (
                  <Pressable
                    key={item.id}
                    className="bg-white rounded-2xl mr-3 overflow-hidden active:scale-95"
                    style={{ width: 160 }}
                    accessibilityLabel={item.title}
                  >
                    <View className="h-28 bg-gray-200 items-center justify-center">
                      <FileText size={28} color="#9CA3AF" />
                    </View>
                    <View className="p-3">
                      <Text className="text-sm font-semibold text-gray-800 leading-snug mb-1" numberOfLines={2}>
                        {item.title}
                      </Text>
                      <Text className="text-xs text-gray-400">
                        {item.author} · {item.views}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* 规划列表区 */}
            <View className="px-4 pt-6">
              <View className="flex-row justify-between items-center mb-4 px-1">
                <Text className="text-lg font-bold text-gray-900">规划列表</Text>
                <TouchableOpacity>
                  <Text className="text-sm font-medium text-blue-600">管理</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 16 }}
              >
                {plans.map((plan) => (
                  <Pressable
                    key={plan.id}
                    className="bg-white rounded-2xl mr-3 overflow-hidden active:scale-95"
                    style={{ width: 160 }}
                    accessibilityLabel={plan.title}
                  >
                    <View className="h-28 bg-gray-200 items-center justify-center relative">
                      <Folder size={32} color="#9CA3AF" />
                    </View>
                    <View className="p-3">
                      <Text className="text-sm font-semibold text-gray-800 leading-snug mb-0.5" numberOfLines={2}>
                        {plan.title}
                      </Text>
                      <Text className="text-xs text-gray-400">{plan.type}</Text>
                    </View>
                  </Pressable>
                ))}

                {/* 新建规划按钮 */}
                <Pressable
                  className="bg-white rounded-2xl border-2 border-dashed border-gray-300 active:scale-95"
                  style={{ width: 160, height: 160 }}
                  accessibilityLabel="新建规划"
                >
                  <View className="flex-1 items-center justify-center">
                    <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mb-2">
                      <Plus size={24} color="#6B7280" />
                    </View>
                    <Text className="text-sm font-medium text-gray-500">新建规划</Text>
                  </View>
                </Pressable>
              </ScrollView>
            </View>

            {/* 功能菜单区 */}
            <View className="px-4 pt-8 pb-6">
              <View className="bg-white rounded-2xl overflow-hidden">
                <TouchableOpacity
                  className="flex-row items-center px-4 py-4 active:bg-gray-50"
                  accessibilityLabel="文档集合"
                >
                  <FileText size={22} color="#374151" />
                  <Text className="flex-1 ml-3 text-base font-medium text-gray-800">文档集合</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center px-4 py-4 active:bg-gray-50"
                  accessibilityLabel="收藏集合"
                >
                  <Bookmark size={22} color="#374151" />
                  <Text className="flex-1 ml-3 text-base font-medium text-gray-800">收藏集合</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}