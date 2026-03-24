import OptionsMenu from "@/components/page/home/OptionsMenu";
import * as homeApi from "@/src/api/home";
import type { Article, Question } from "@/src/types/home";
import { formatRelativeTime } from "@/src/utils/time";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Bookmark, ChartNoAxesColumn, Ellipsis, MessageCircle, Search, Sparkles } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type TabType = "recommend" | "qa";

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("recommend");
  const [articles, setArticles] = useState<Article[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [favorites, setFavorites] = useState<Record<number, boolean>>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [menuDirection, setMenuDirection] = useState<'down' | 'up'>('down');
  const [loading, setLoading] = useState(false);
  const buttonRefs = useRef<Record<number, View | null>>({});

  // 加载文章列表
  const loadArticles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await homeApi.getArticleList({ pageSize: 10 });
      setArticles(response.list);
      // 初始化收藏状态
      const favoriteState: Record<number, boolean> = {};
      response.list.forEach((article) => {
        favoriteState[article.id] = article.isFavorited || false;
      });
      setFavorites((prev) => ({ ...prev, ...favoriteState }));
    } catch (error) {
      console.error("加载文章失败:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 加载问题列表
  const loadQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await homeApi.getQuestionList({ pageSize: 10 });
      setQuestions(response.list);
      // 初始化收藏状态
      const favoriteState: Record<number, boolean> = {};
      response.list.forEach((question) => {
        favoriteState[question.id] = question.isFavorited || false;
      });
      setFavorites((prev) => ({ ...prev, ...favoriteState }));
    } catch (error) {
      console.error("加载问题失败:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 首次加载 + Tab 切换时加载对应数据
  useEffect(() => {
    if (activeTab === "recommend") {
      loadArticles();
    } else {
      loadQuestions();
    }
  }, [activeTab, loadArticles, loadQuestions]);

  // 切换收藏状态
  const handleToggleFavorite = async (id: number, type: "article" | "question") => {
    const targetType = type === "article" ? "article" : "question";
    const currentState = favorites[id] || false;

    // 先更新本地状态
    setFavorites((prev) => ({
      ...prev,
      [id]: !currentState,
    }));

    try {
      await homeApi.toggleFavorite({
        targetId: id,
        targetType,
        action: "favorite",
      });
    } catch (error) {
      // 失败时回滚状态
      setFavorites((prev) => ({
        ...prev,
        [id]: currentState,
      }));
      console.error("收藏操作失败:", error);
    }
  };

  const showOptions = (id: number) => {
    setSelectedId(id);
    if (buttonRefs.current[id]) {
      buttonRefs.current[id].measureInWindow((x: number, y: number, width: number, height: number) => {
        const screenHeight = Dimensions.get('window').height;
        const menuHeight = 160;
        if (y + height + menuHeight > screenHeight-80) {
          setMenuDirection('up');
          setMenuPosition({ x: x + width - 160, y: y - menuHeight - 8 });
        } else {
          setMenuDirection('down');
          setMenuPosition({ x: x + width - 160, y: y + height + 8 });
        }
      });
    }
    setModalVisible(true);
  };

  // 渲染文章卡片（大卡片样式，第一条）
  const renderArticleCard = (article: Article, isLarge: boolean = false) => (
    <TouchableOpacity
      key={article.id}
      className="bg-white rounded-2xl overflow-hidden"
      onPress={() => router.push({
        pathname: "/(home)/article-detail",
        params: { id: String(article.id) }
      })}
    >
      {isLarge && article.image && (
        <Image
          source={{ uri: article.image }}
          style={{ width: '100%', height: 180 }}
          contentFit="cover"
        />
      )}
      {isLarge ? (
        // 大卡片布局
        <View className="px-5 pt-5 pb-3">
          <View className="flex-row items-center gap-2 mb-2">
            {article.tag && (
              <View className="bg-blue-50 px-2 py-1 rounded-md">
                <Text className="text-xs font-medium text-blue-600">{article.tag}</Text>
              </View>
            )}
            <Text className="text-xs text-gray-400">
              {formatRelativeTime(article.createdAt)}
            </Text>
          </View>
          <Text className="text-base font-semibold text-gray-900 leading-tight mb-1">
            {article.title}
          </Text>
          {article.description && (
            <Text className="text-sm text-gray-500" numberOfLines={2}>
              {article.description}
            </Text>
          )}
        </View>
      ) : (
        // 小卡片布局：左侧文字，右侧图片
        <View className="flex-row p-4">
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-2">
              {article.tag && (
                <View className="bg-blue-50 px-2 py-1 rounded-md">
                  <Text className="text-xs font-medium text-blue-600">{article.tag}</Text>
                </View>
              )}
              <Text className="text-xs text-gray-400">
                {formatRelativeTime(article.createdAt)}
              </Text>
            </View>
            <Text className="text-base font-semibold text-gray-900 leading-tight mb-1">
              {article.title}
            </Text>
            {article.description && (
              <Text className="text-sm text-gray-500" numberOfLines={2}>
                {article.description}
              </Text>
            )}
          </View>
          {article.image && (
            <Image
              source={{ uri: article.image }}
              style={{ width: 96, height: 96, borderRadius: 12 }}
              contentFit="cover"
            />
          )}
        </View>
      )}
      <View className={`flex-row justify-between items-center ${isLarge ? 'px-5 pb-3' : 'px-5 pb-3'}`}>
        <View className="flex-row items-center gap-4">
          <TouchableOpacity
            className="flex-row items-center gap-1"
            onPress={() => handleToggleFavorite(article.id, "article")}
          >
            <Bookmark
              size={16}
              color={favorites[article.id] ? "#3B82F6" : "#9CA3AF"}
              fill={favorites[article.id] ? "#3B82F6" : "none"}
            />
            <Text className="text-sm text-gray-400">{article.favorites}</Text>
          </TouchableOpacity>
          <View className="flex-row items-center gap-1">
            <ChartNoAxesColumn size={16} color="#9CA3AF" />
            <Text className="text-sm text-gray-400">{article.views}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => showOptions(article.id)}
          ref={(el) => { buttonRefs.current[article.id] = el; }}
        >
          <Ellipsis size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // 渲染问题卡片
  const renderQuestionCard = (question: Question) => (
    <TouchableOpacity
      key={question.id}
      className="bg-white rounded-2xl p-5"
      onPress={() => router.push({
        pathname: "/(home)/qa-detail",
        params: { id: String(question.id) }
      })}
    >
      <TouchableOpacity
        className="absolute top-4 right-4"
        onPress={() => showOptions(question.id)}
        ref={(el) => { buttonRefs.current[question.id] = el; }}
      >
        <Ellipsis size={20} color="#9CA3AF" />
      </TouchableOpacity>

      <View className="flex-row items-center gap-2 mb-3">
        {question.category && (
          <View className="bg-orange-50 px-2 py-1 rounded-md">
            <Text className="text-xs font-medium text-orange-600">{question.category}</Text>
          </View>
        )}
        <Text className="text-xs text-gray-400">
          {formatRelativeTime(question.createdAt)}
        </Text>
      </View>

      <Text className="text-base font-semibold text-gray-900 leading-tight mb-3">
        {question.title}
      </Text>

      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center">
            <Text className="text-sm text-gray-600 font-medium">
              {question.author?.nickname?.charAt(0) || "用"}
            </Text>
          </View>
          <Text className="text-sm text-gray-500">
            {question.author?.nickname || "未知用户"}
          </Text>
        </View>
        <View className="flex-row items-center gap-4">
          <View className="flex-row items-center gap-1">
            <MessageCircle size={16} color="#9CA3AF" />
            <Text className="text-sm text-gray-400">{question.repliesCount}</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <ChartNoAxesColumn size={16} color="#9CA3AF" />
            <Text className="text-sm text-gray-400">{question.views}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* 搜索框 */}
        <View className="bg-white mx-6 mt-4 rounded-xl flex-row items-center px-4 py-3">
          <Search size={18} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-3 text-gray-700 text-base"
            placeholder="搜索相关内容..."
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Tab 切换 */}
        <View className="mx-6 mt-6 flex-row bg-gray-100 rounded-xl p-1">
          <TouchableOpacity
            className={`flex-1 py-2.5 rounded-lg ${activeTab === "recommend" ? "bg-white" : ""}`}
            onPress={() => setActiveTab("recommend")}
          >
            <View className="flex-row items-center justify-center gap-2">
              <Sparkles size={16} color={activeTab === "recommend" ? "#0076D6" : "#9CA3AF"} />
              <Text className={`text-sm font-medium ${activeTab === "recommend" ? "text-gray-900" : "text-gray-500"}`}>
                推荐
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-2.5 rounded-lg ${activeTab === "qa" ? "bg-white" : ""}`}
            onPress={() => setActiveTab("qa")}
          >
            <View className="flex-row items-center justify-center gap-2">
              <MessageCircle size={16} color={activeTab === "qa" ? "#0076D6" : "#9CA3AF"} />
              <Text className={`text-sm font-medium ${activeTab === "qa" ? "text-gray-900" : "text-gray-500"}`}>
                问答
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 内容区域 */}
        <View className="mx-6 mt-6 gap-6">
          {activeTab === "recommend" ? (
            <View className="gap-6">
              {articles.length > 0 ? (
                <>
                  {renderArticleCard(articles[0], true)}
                  {articles.slice(1).map((article) => renderArticleCard(article, false))}
                </>
              ) : (
                <View className="items-center justify-center py-10">
                  <Text className="text-gray-400">暂无推荐内容</Text>
                </View>
              )}
            </View>
          ) : (
            <View className="gap-3">
              {questions.length > 0 ? (
                questions.map((question) => renderQuestionCard(question))
              ) : (
                <View className="items-center justify-center py-10">
                  <Text className="text-gray-400">暂无问答内容</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* 更多选项弹窗 */}
      <OptionsMenu
        visible={modalVisible}
        position={menuPosition}
        direction={menuDirection}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingBottom: 20,
  },
});
