import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { Bookmark, BookmarkCheck, ChevronLeft } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import * as homeApi from "@/src/api/home";
import type { Article } from "@/src/types/home";
import { formatRelativeTime } from "@/src/utils/time";
import { HtmlRenderer } from "@/src/components/HtmlRenderer";

function AnimatedFavoriteBtn({ isFavorite, onPress }: { isFavorite: boolean; onPress: () => void }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    scale.value = withSpring(1.3, { damping: 10, stiffness: 400 });
    setTimeout(() => { scale.value = withSpring(1, { damping: 10, stiffness: 400 }); }, 100);
    onPress();
  };

  return (
    <Pressable onPress={handlePress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      <Animated.View style={animatedStyle}>
        {isFavorite ? (
          <BookmarkCheck size={22} color="#3B82F6" fill="#3B82F6" />
        ) : (
          <Bookmark size={22} color="#6B7280" />
        )}
      </Animated.View>
    </Pressable>
  );
}

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadArticleDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await homeApi.getArticleDetail(Number(id));
      setArticle(data);
      setIsFavorite(data.isFavorited || false);
    } catch (error) {
      console.error("加载文章详情失败:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadArticleDetail();
  }, [loadArticleDetail]);

  const handleToggleFavorite = async () => {
    if (!article) return;
    const currentState = isFavorite;
    setIsFavorite(!currentState);
    try {
      await homeApi.toggleFavorite({ targetId: article.id, targetType: "article", action: "favorite" });
    } catch (error) {
      setIsFavorite(currentState);
      console.error("收藏操作失败:", error);
    }
  };

  useEffect(() => {
    if (article) {
      homeApi.recordView({ targetId: article.id, targetType: "article", action: "view" }).catch(console.error);
    }
  }, [article]);

  if (loading || !article) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
        <View className="px-4 py-3 flex-row items-center">
          <Pressable onPress={() => router.back()} className="p-2 -ml-2">
            <ChevronLeft size={26} color="#374151" />
          </Pressable>
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-400 text-base">加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
      {/* 头部 */}
      <Animated.View entering={FadeIn.duration(300)} className="px-4 py-3 flex-row items-center justify-between">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2">
          <ChevronLeft size={26} color="#374151" />
        </Pressable>
        <AnimatedFavoriteBtn isFavorite={isFavorite} onPress={handleToggleFavorite} />
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* 封面图 */}
        {article.image && (
          <Animated.View entering={FadeIn.duration(400)} className="px-4 pt-4">
            <View className="rounded-2xl overflow-hidden shadow-md" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 }}>
              <Image source={{ uri: article.image }} style={{ width: '100%', height: 220 }} contentFit="cover" />
            </View>
          </Animated.View>
        )}

        {/* 内容区域 */}
        <Animated.View entering={FadeIn.duration(400).delay(100)} className="mx-4 mt-4 rounded-t-3xl bg-white overflow-hidden" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 3, paddingBottom: 60 }}>
          {/* 标签和时间 */}
          <View className="px-6 pt-6 pb-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              {article.tag && (
                <View className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100">
                  <Text className="text-xs font-semibold text-blue-600">{article.tag}</Text>
                </View>
              )}
              <View className="flex-row items-center gap-1.5">
                <View className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                <Text className="text-xs text-gray-400">{article.views} 阅读</Text>
              </View>
            </View>
            <Text className="text-xs text-gray-400">{formatRelativeTime(article.createdAt)}</Text>
          </View>

          {/* 标题 */}
          <Text className="text-2xl font-bold text-gray-900 px-6 leading-tight tracking-tight">
            {article.title}
          </Text>

          {/* 描述 */}
          {article.description && (
            <Text className="text-sm text-gray-500 px-6 mt-3 leading-relaxed">
              {article.description}
            </Text>
          )}

          {/* 分隔线 */}
          <View className="h-px bg-gray-100 mx-6 mt-5" />

          {/* 文章正文 */}
          <View className="px-6 py-6">
            <HtmlRenderer html={article.content || ''} />
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
