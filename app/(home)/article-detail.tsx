import { router, useLocalSearchParams } from "expo-router";
import { Bookmark, BookmarkCheck, ChevronLeft, Plus, UserCheck } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { Alert, Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import * as homeApi from "@/src/api/home";
import type { Article } from "@/src/types/home";
import { HtmlRenderer } from "@/src/components/HtmlRenderer";

function AlertMessage({ message }: { message: string }) {
  Alert.alert(message);
}

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
  const [isFollowed, setIsFollowed] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadArticleDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await homeApi.getArticleDetail(Number(id));
      setArticle(data);
      setIsFavorite(data.isFavorited || false);
      setIsFollowed(data.isFollowed || false);
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

  const handleToggleFollow = async () => {
    if (!article?.authorId) return;
    const currentState = isFollowed;
    setIsFollowed(!currentState);
    try {
      await homeApi.toggleFollow({ targetId: article.authorId, targetType: "user", action: "follow" });
      Alert.alert(currentState ? "已取消关注" : "关注成功");
    } catch (error) {
      setIsFollowed(currentState);
      console.error("关注操作失败:", error);
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
              <Image source={{ uri: article.image }} style={{ width: '100%', height: 220 }} />
            </View>
          </Animated.View>
        )}

        {/* 内容区域 */}
        <Animated.View entering={FadeIn.duration(400).delay(100)} className="mx-4 mt-4 rounded-t-3xl bg-white overflow-hidden" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 3, paddingBottom: 60 }}>
          {/* 作者信息 */}
          {article.author && (
            <View className="px-6 pt-5 pb-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-4">
                {article.author.avatar ? (
                  <Image source={{ uri: article.author.avatar }} style={{ width: 56, height: 56, borderRadius: 28 }} />
                ) : (
                  <View className="w-14 h-14 rounded-full bg-blue-50 items-center justify-center">
                    <Text className="text-xl font-semibold text-blue-500">
                      {(article.author.nickname || '游').charAt(0)}
                    </Text>
                  </View>
                )}
                <View>
                  <Text className="text-base font-semibold text-gray-900">
                    {article.author.nickname || "旅行用户"}
                  </Text>
                  <Text className="text-sm text-gray-400 mt-1">
                    {article.favorites || 0} 收藏 · {article.views || 0} 阅读
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={handleToggleFollow}
                className={`flex-row items-center gap-1.5 px-4 py-2 rounded-full ${
                  isFollowed ? "bg-gray-100 border border-gray-300" : "bg-blue-50 border border-blue-200"
                }`}
              >
                {isFollowed ? (
                  <>
                    <UserCheck size={16} color="#6B7280" />
                    <Text className="text-sm text-gray-500 font-medium">已关注</Text>
                  </>
                ) : (
                  <>
                    <Plus size={16} color="#3B82F6" />
                    <Text className="text-sm text-blue-500 font-medium">关注</Text>
                  </>
                )}
              </Pressable>
            </View>
          )}

          {/* 标题 */}
          <Text className="text-2xl font-bold text-gray-900 px-6 leading-tight tracking-tight">
            {article.title}
          </Text>

          {/* 标签 */}
          {article.tag && (
            <View className="px-6 pt-3 pb-2 flex-row items-center">
              <View className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100">
                <Text className="text-xs font-semibold text-blue-600">{article.tag}</Text>
              </View>
            </View>
          )}

          {/* 描述 */}
          {article.description && (
            <Text className="text-sm text-gray-500 px-6 leading-relaxed mt-2">
              {article.description}
            </Text>
          )}

          {/* 分隔线 */}
          <View className="h-px bg-gray-100 mx-6 mt-4" />

          {/* 文章正文 */}
          <View className="px-6 py-6">
            <HtmlRenderer html={article.content || ''} />
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}