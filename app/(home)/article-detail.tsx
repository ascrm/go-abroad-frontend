import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { Bookmark, BookmarkCheck, ChevronLeft, Share2 } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as homeApi from "@/src/api/home";
import type { Article } from "@/src/types/home";
import { formatRelativeTime } from "@/src/utils/time";

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  // 加载文章详情
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

  // 首次加载
  useEffect(() => {
    loadArticleDetail();
  }, [loadArticleDetail]);

  // 切换收藏
  const handleToggleFavorite = async () => {
    if (!article) return;
    const currentState = isFavorite;
    setIsFavorite(!currentState);

    try {
      await homeApi.toggleFavorite({
        targetId: article.id,
        targetType: "article",
        action: "favorite",
      });
    } catch (error) {
      setIsFavorite(currentState);
      console.error("收藏操作失败:", error);
    }
  };

  // 记录浏览
  useEffect(() => {
    if (article) {
      homeApi.recordView({
        targetId: article.id,
        targetType: "article",
        action: "view",
      }).catch(console.error);
    }
  }, [article]);

  if (loading || !article) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
        <View className="px-4 py-3 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="p-1">
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-400">加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
      {/* 头部 */}
      <View className="px-4 py-3 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
        <View className="flex-row items-center gap-4">
          <TouchableOpacity
            onPress={handleToggleFavorite}
            className="p-1"
          >
            {isFavorite ? (
              <BookmarkCheck size={20} color="#3B82F6" fill="#3B82F6" />
            ) : (
              <Bookmark size={20} color="#374151" />
            )}
          </TouchableOpacity>
          <TouchableOpacity className="p-1">
            <Share2 size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 封面图 */}
        {article.image && (
          <View className="mx-4 mt-4 overflow-hidden rounded-2xl">
            <Image
              source={{ uri: article.image }}
              style={{ width: '100%', height: 220 }}
              contentFit="cover"
            />
          </View>
        )}

        {/* 内容区域 */}
        <View className="bg-white mx-4 mt-4 rounded-2xl">
          {/* 标签和时间 */}
          <View className="flex-row items-center justify-between px-5 pt-5">
            <View className="flex-row items-center gap-2">
              {article.tag && (
                <View className="bg-blue-50 px-2 py-1 rounded-md">
                  <Text className="text-xs font-medium text-blue-600">{article.tag}</Text>
                </View>
              )}
            </View>
            <Text className="text-xs text-gray-400">
              {formatRelativeTime(article.createdAt)}
            </Text>
          </View>

          {/* 标题 */}
          <Text className="text-[32px] font-bold text-gray-900 px-5 mt-4 leading-snug">
            {article.title}
          </Text>

          {/* 描述 */}
          {article.description && (
            <Text className="text-sm text-gray-500 px-5 mt-3 leading-relaxed">
              {article.description}
            </Text>
          )}

          {/* 分割线 */}
          <View className="h-1 bg-gray-100 mx-5 mt-5" />

          {/* 文章正文 */}
          <View className="px-5 py-6">
            <Text className="text-base text-gray-700 leading-7 whitespace-pre-line">
              {article.content}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
