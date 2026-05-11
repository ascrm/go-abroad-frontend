import { User as UserType } from "@/src/types/auth";
import { profileApi } from "@/src/api/profile";
import { getArticleBatch, getQuestionBatch, ArticleItem, QuestionItem } from "@/src/api/home";
import { getPlanList, Plan } from "@/src/api/plan";
import { storage } from "@/src/utils/storage";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { Bell, ChevronDown, FileText, Settings, MapPin, Clock } from "lucide-react-native";
import { useCallback, useState } from "react";
import { ActivityIndicator, ImageBackground, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolate } from "react-native-reanimated";

type HistoryTab = 'article' | 'question';

export default function ProfileScreen() {
  const [user, setUser] = useState<UserType | null>(null);
  const [articleHistory, setArticleHistory] = useState<ArticleItem[]>([]);
  const [articleFavorites, setArticleFavorites] = useState<ArticleItem[]>([]);
  const [questionHistory, setQuestionHistory] = useState<QuestionItem[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyTab, setHistoryTab] = useState<HistoryTab>('article');

  const tabIndicatorPosition = useSharedValue(0);
  const scrollY = useSharedValue(0);

  const handleTabChange = (tab: HistoryTab) => {
    setHistoryTab(tab);
    tabIndicatorPosition.value = tab === 'article' ? 0 : 1;
  };

  const indicatorAnimatedStyle = useAnimatedStyle(() => {
    return {
      left: withTiming(88 + tabIndicatorPosition.value * 190, { duration: 250 }),
    };
  });

  const navbarAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 50], [0, 1], 'clamp');
    return {
      backgroundColor: `rgba(0, 0, 0, ${opacity})`,
    };
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const userStr = await storage.getUser();
      if (userStr) {
        const userData = JSON.parse(userStr) as UserType;
        setUser(userData);
      }

      // 1. 获取历史记录
      const historyData = await profileApi.getBrowseHistory();
      const historyList = historyData.list || [];

      // 2. 根据 sourceType 分组获取 articleIds 和 questionIds
      const articleIds = historyList
        .filter(item => item.sourceType === 'article')
        .map(item => item.sourceId);
      const questionIds = historyList
        .filter(item => item.sourceType === 'question')
        .map(item => item.sourceId);

      // 3. 批量获取文章和问答详情
      const [articles, questions] = await Promise.all([
        articleIds.length > 0 ? getArticleBatch(articleIds) : [],
        questionIds.length > 0 ? getQuestionBatch(questionIds) : [],
      ]);

      setArticleHistory(articles);
      setQuestionHistory(questions);

      // 4. 获取收藏列表
      const favoritesData = await profileApi.getPlaylists();
      const favoritesList = favoritesData.list || [];
      const favoriteArticleIds = favoritesList
        .filter(item => item.sourceType === 'article')
        .map(item => item.sourceId);
      const favoriteArticles = favoriteArticleIds.length > 0 ? await getArticleBatch(favoriteArticleIds) : [];
      setArticleFavorites(favoriteArticles);

      // 5. 获取规划列表
      const plansData = await getPlanList({ page: 1, pageSize: 10 });
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
    <View className="flex-1 bg-white">
      {/* 固定在顶部的导航栏 - 在 ScrollView 外部 */}
      <Animated.View
        style={[{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 }, navbarAnimatedStyle]}>
      >
        <SafeAreaView edges={['top']}>
          <View className="flex-row items-center justify-between px-5 py-2">
            {/* 左上角账号按钮 */}
            <Pressable
              accessibilityLabel="切换账号"
              accessibilityHint="点击切换或管理账号"
              className="flex-row items-center px-3 py-1.5 rounded-full border bg-transparent"
              style={{ minWidth: 72, borderColor: '#fff' }}
              onPress={() => router.push("/(profile)/switch-account")}
            >
              <Text className="text-sm font-medium text-white">账号</Text>
              <ChevronDown size={14} color="#fff" style={{ marginLeft: 2 }} />
            </Pressable>

            {/* 右上角按钮组 */}
            <View className="flex-row items-center gap-1">
              <TouchableOpacity
                accessibilityLabel="消息通知"
                className="p-2 rounded-full active:bg-white/20"
                onPress={() => router.push("/(profile)/messages")}
              >
                <Bell size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityLabel="设置"
                className="p-2 rounded-full active:bg-white/20"
                onPress={() => router.push("/(profile)/settings")}
              >
                <Settings size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Animated.View>

      {/* 滚动内容区域 */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
        onScroll={(e) => { scrollY.value = e.nativeEvent.contentOffset.y; }}
        scrollEventThrottle={16}
      >
        {/* 背景图区域 */}
        <ImageBackground
          source={require('@/assets/images/profile-bg.png')}
          style={{ width: '100%', height: 200 }}
          resizeMode="cover"
        >
          <View className="px-5 pb-6"
            style={{ paddingTop: 118 }}>
            {/* 用户信息 */}
            <Pressable
              accessibilityLabel={`${user?.nickname || "未登录用户"}，点击编辑资料`}
              className="flex-row items-center active:opacity-80"
              onPress={() => router.push("/(profile)/edit-profile")}
            >
              <View className="w-20 h-20 rounded-full overflow-hidden mr-4 items-center justify-center bg-white/20"
                style={{ borderWidth: 2, borderColor: '#fff' }}>
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
                <Text className="text-2xl font-bold text-white">
                  {user?.nickname || "未登录用户"}
                </Text>
                <Text className="text-white mt-1">@{user?.username || "guest_user"}</Text>
              </View>
            </Pressable>
          </View>
        </ImageBackground>

      {/* 加载状态 */}
      {loading ? (
        <View className="items-center justify-center py-16">
          <ActivityIndicator size="large" color="#6B7280" />
        </View>
      ) : (
        <>
          {/* Tab 切换栏 - X 风格下划线指示器 */}
            <View className="px-4 mb-4 mt-4 relative">
              {/* 标签行 */}
              <View className="flex-row bg-white rounded-t-xl">
                <TouchableOpacity
                  className="flex-1 py-3 items-center"
                  onPress={() => handleTabChange('article')}
                >
                  <Text className={`text-base font-semibold ${historyTab === 'article' ? 'text-blue-500' : 'text-gray-500'}`}>
                    文章
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 py-3 items-center"
                  onPress={() => handleTabChange('question')}
                >
                  <Text className={`text-base font-semibold ${historyTab === 'question' ? 'text-blue-500' : 'text-gray-500'}`}>
                    问答
                  </Text>
                </TouchableOpacity>
              </View>
              {/* 蓝色下划线指示器 - 居中于每个 tab */}
              <View className="absolute bottom-0 left-0 right-0 border-b border-gray-200"
               style={{  marginHorizontal: -16 }}>
                <Animated.View
                  className="h-0.5 bg-blue-500 rounded-full"
                  style={[
                    { width: 64 },
                    indicatorAnimatedStyle,
                  ]}
                />
              </View>
            </View>

            {historyTab === 'article' ? (
              <View className="px-4">
                {/* 历史记录板块 */}
                <View className="mb-6">
                  <Text className="text-base font-semibold text-gray-800 mb-3">历史记录</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingRight: 16 }}
                  >
                    {articleHistory.length > 0 ? (
                      articleHistory.map((item) => (
                        <Pressable
                          key={item.id}
                          className="bg-white rounded-2xl mr-3 overflow-hidden active:scale-95"
                          style={{ width: 160 }}
                          accessibilityLabel={item.title}
                        >
                          {item.thumbnail ? (
                            <Image
                              source={{ uri: item.thumbnail }}
                              style={{ width: 160, height: 100 }}
                              contentFit="cover"
                            />
                          ) : (
                            <View className="h-24 bg-gray-100 items-center justify-center">
                              <FileText size={28} color="#9CA3AF" />
                            </View>
                          )}
                          <View className="p-3">
                            <Text className="text-sm font-semibold text-gray-800 leading-snug mb-1" numberOfLines={2}>
                              {item.title}
                            </Text>
                            <Text className="text-xs text-gray-400">
                              {item.author} · {item.views}
                            </Text>
                          </View>
                        </Pressable>
                      ))
                    ) : (
                      <View className="flex-1 items-center justify-center py-8">
                        <Text className="text-gray-400 text-sm">暂无文章记录</Text>
                      </View>
                    )}
                  </ScrollView>
                </View>

                {/* 收藏记录板块 */}
                <View>
                  <Text className="text-base font-semibold text-gray-800 mb-3">收藏记录</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingRight: 16 }}
                  >
                    {articleFavorites.length > 0 ? (
                      articleFavorites.map((item) => (
                        <Pressable
                          key={item.id}
                          className="bg-white rounded-2xl mr-3 overflow-hidden active:scale-95"
                          style={{ width: 160 }}
                          accessibilityLabel={item.title}
                        >
                          {item.thumbnail ? (
                            <Image
                              source={{ uri: item.thumbnail }}
                              style={{ width: 160, height: 100 }}
                              contentFit="cover"
                            />
                          ) : (
                            <View className="h-24 bg-gray-100 items-center justify-center">
                              <FileText size={28} color="#9CA3AF" />
                            </View>
                          )}
                          <View className="p-3">
                            <Text className="text-sm font-semibold text-gray-800 leading-snug mb-1" numberOfLines={2}>
                              {item.title}
                            </Text>
                            <Text className="text-xs text-gray-400">
                              {item.author} · {item.views}
                            </Text>
                          </View>
                        </Pressable>
                      ))
                    ) : (
                      <View className="flex-1 items-center justify-center py-8">
                        <Text className="text-gray-400 text-sm">暂无收藏记录</Text>
                      </View>
                    )}
                  </ScrollView>
                </View>
              </View>
            ) : historyTab === 'question' ? (
              <View className="px-4 bg-white mx-4 rounded-2xl">
                {questionHistory.length > 0 ? (
                  questionHistory.map((item, index) => (
                    <Pressable
                      key={item.id}
                      className={`px-4 py-3 active:opacity-80 ${index < questionHistory.length - 1 ? 'border-b border-gray-100' : ''}`}
                      accessibilityLabel={item.title}
                    >
                      <View className="flex-row items-center mb-2">
                        <View className="w-6 h-6 rounded-full bg-gray-200 items-center justify-center mr-2">
                          <Text className="text-xs text-gray-600 font-medium">
                            {item.author.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <Text className="text-sm text-gray-500">{item.author}</Text>
                      </View>
                      <Text className="text-base font-semibold text-gray-800 leading-snug mb-2" numberOfLines={2}>
                        {item.title}
                      </Text>
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                          <Text className="text-xs text-gray-400">{item.views} 回答</Text>
                          <Text className="text-xs text-gray-300 mx-2">·</Text>
                          <Text className="text-xs text-gray-400">{item.views} 关注</Text>
                        </View>
                        <View className="bg-blue-50 px-3 py-1.5 rounded-full">
                          <Text className="text-xs font-medium text-blue-500">写回答</Text>
                        </View>
                      </View>
                    </Pressable>
                  ))
                ) : (
                  <View className="items-center justify-center py-8">
                    <Text className="text-gray-400 text-sm">暂无问答记录</Text>
                  </View>
                )}
              </View>
            ) : (
              <View className="px-4 bg-white mx-4 rounded-2xl">
                <View className="items-center justify-center py-8">
                  <Text className="text-gray-400 text-sm">暂无记录</Text>
                </View>
              </View>
            )}

            {/* 规划列表区 */}
            <View className="px-4 pt-6">
              <View className="flex-row justify-between items-center mb-4 px-1">
                <Text className="text-lg font-bold text-gray-900">规划列表</Text>
                <TouchableOpacity>
                  <Text className="text-sm font-medium text-blue-600">管理</Text>
                </TouchableOpacity>
              </View>

              <View className="bg-white rounded-2xl">
                {plans.length > 0 ? (
                  plans.map((plan, index) => {
                    const totalTasks = plan.phases?.flatMap(p => p.tasks || []).length || 0;
                    const completedTasks = plan.phases?.flatMap(p => p.tasks || []).filter(t => t.isCompleted).length || 0;
                    const percent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                    return (
                      <Pressable
                        key={plan.id}
                        className={`px-4 py-3 active:opacity-80 ${index < plans.length - 1 ? 'border-b border-gray-100' : ''}`}
                        accessibilityLabel={plan.title}
                      >
                        {/* 类型标签 */}
                        <View className="flex-row items-center mb-2">
                          <View className={`px-2 py-1 rounded-full ${plan.type === 'tourism' ? 'bg-blue-50' : 'bg-gray-100'}`}>
                            <Text className={`text-xs font-medium ${plan.type === 'tourism' ? 'text-blue-500' : 'text-gray-500'}`}>
                              {plan.type === 'tourism' ? '旅游' : plan.type}
                            </Text>
                          </View>
                        </View>

                        {/* 标题 */}
                        <Text className="text-base font-semibold text-gray-800 mb-2" numberOfLines={1}>
                          {plan.title}
                        </Text>

                        {/* 目的地 */}
                        <View className="flex-row items-center mb-1">
                          <MapPin size={12} color="#9CA3AF" />
                          <Text className="text-sm text-gray-500 ml-1.5">
                            {[plan.destination?.city, plan.destination?.country].filter(Boolean).join(' · ') || '未设置目的地'}
                          </Text>
                        </View>

                        {/* 截止时间 + 进度 */}
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center">
                            <Clock size={12} color="#9CA3AF" />
                            <Text className="text-xs text-gray-400 ml-1.5">
                              {plan.endDate ? `截止 ${plan.endDate.slice(5)}` : '未设置截止时间'}
                            </Text>
                          </View>
                          <Text className="text-sm font-bold text-blue-500">{percent}%</Text>
                        </View>
                      </Pressable>
                    );
                  })
                ) : (
                  <View className="items-center justify-center py-8">
                    <Text className="text-gray-400 text-sm">暂无规划</Text>
                  </View>
                )}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}