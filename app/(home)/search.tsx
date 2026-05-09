import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets, SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import {
  ChevronLeft,
  Clock,
  History,
  Search,
  TrendingUp,
  X,
} from "lucide-react-native";
import type { Article, Question } from "@/src/types/home";

const MOCK_ARTICLES: Article[] = [
  {
    id: 1,
    title: "日本关西7日深度游攻略",
    description: "京都大阪奈良完整路线",
    content: "",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400",
    tag: "日本",
    authorId: 1,
    views: 12580,
    favorites: 892,
    isPublished: true,
    isFeatured: true,
    createdAt: "2026-05-01",
    updatedAt: "2026-05-01",
  },
  {
    id: 2,
    title: "欧洲15天自由行",
    description: "巴黎到罗马经典路线",
    content: "",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400",
    tag: "欧洲",
    authorId: 2,
    views: 8934,
    favorites: 567,
    isPublished: true,
    isFeatured: false,
    createdAt: "2026-04-28",
    updatedAt: "2026-04-28",
  },
];

const MOCK_QUESTIONS: Question[] = [
  {
    id: 1,
    title: "如何申请日本旅游签证？",
    content: "需要准备哪些材料",
    authorId: 1,
    views: 2345,
    repliesCount: 12,
    isResolved: true,
    isDeleted: false,
    createdAt: "2026-05-05",
    updatedAt: "2026-05-06",
  },
  {
    id: 2,
    title: "欧洲签证申请被拒了怎么办？",
    content: "想申诉或重新申请",
    authorId: 2,
    views: 1890,
    repliesCount: 8,
    isResolved: false,
    isDeleted: false,
    createdAt: "2026-05-04",
    updatedAt: "2026-05-04",
  },
];

const HOT_SEARCHES = ["日本签证", "欧洲旅行", "泰国自由行", "环球影城", "机票预订"];
const RECENT_SEARCHES_KEY = "recent_searches";

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState<"article" | "question">("article");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    articles: Article[];
    questions: Question[];
  }>({ articles: [], questions: [] });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // 加载最近搜索
  useEffect(() => {
    // 模拟从 storage 加载
    const saved = [""];
    if (saved[0]) {
      setRecentSearches(saved);
    }
  }, []);

  // 搜索处理（带防抖）
  useEffect(() => {
    if (!searchText.trim()) {
      setSearchResults({ articles: [], questions: [] });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      // 模拟搜索结果
      const keyword = searchText.toLowerCase();
      const articles = MOCK_ARTICLES.filter(
        (a) =>
          a.title.toLowerCase().includes(keyword) ||
          a.description?.toLowerCase().includes(keyword)
      );
      const questions = MOCK_QUESTIONS.filter((q) =>
        q.title.toLowerCase().includes(keyword)
      );
      setSearchResults({ articles, questions });
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText]);

  // 保存搜索历史
  const saveSearch = (keyword: string) => {
    if (!keyword.trim()) return;
    const updated = [keyword, ...recentSearches.filter((s) => s !== keyword)].slice(0, 10);
    setRecentSearches(updated);
  };

  // 清空搜索
  const clearSearch = () => {
    setSearchText("");
    setSearchResults({ articles: [], questions: [] });
  };

  // 点击搜索结果
  const handleResultPress = (type: "article" | "question", id: number) => {
    saveSearch(searchText);
    if (type === "article") {
      router.push({ pathname: "/(home)/article-detail", params: { id: String(id) } });
    } else {
      router.push({ pathname: "/(home)/qa-detail", params: { id: String(id) } });
    }
  };

  // 热门搜索点击
  const handleHotPress = (keyword: string) => {
    setSearchText(keyword);
  };

  // 最近搜索删除
  const handleRecentDelete = (keyword: string) => {
    setRecentSearches(recentSearches.filter((s) => s !== keyword));
  };

  // 清空历史
  const handleClearHistory = () => {
    setRecentSearches([]);
  };

  const hasResults = searchResults.articles.length > 0 || searchResults.questions.length > 0;
  const showEmpty = searchText && !isSearching && !hasResults;
  const showHistory = !searchText;

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={{ flex: 1, paddingBottom: insets.bottom }}>
      {/* 顶部搜索栏 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
        <View style={styles.searchInputWrapper}>
          <Search size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索文章、问答..."
            placeholderTextColor="#9CA3AF"
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={() => saveSearch(searchText)}
          />
          {searchText ? (
            <TouchableOpacity onPress={clearSearch} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={18} color="#9CA3AF" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* 内容区域 */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.content}
        keyboardVerticalOffset={0}
      >
        {/* 最近搜索 & 热门搜索 */}
        {showHistory && (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* 最近搜索 */}
            {recentSearches.length > 0 && (
              <Animated.View entering={FadeInDown.duration(300)} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <Clock size={16} color="#6B7280" />
                    <Text style={styles.sectionTitle}>最近搜索</Text>
                  </View>
                  <TouchableOpacity onPress={handleClearHistory}>
                    <Text style={styles.clearBtn}>清空</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.tagList}>
                  {recentSearches.map((keyword, index) => (
                    <TouchableOpacity
                      key={`recent-${index}`}
                      style={styles.tag}
                      onPress={() => handleHotPress(keyword)}
                    >
                      <Text style={styles.tagText}>{keyword}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Animated.View>
            )}

            {/* 热门搜索 */}
            <Animated.View entering={FadeInDown.duration(300).delay(50)} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <TrendingUp size={16} color="#6B7280" />
                  <Text style={styles.sectionTitle}>热门搜索</Text>
                </View>
              </View>
              <View style={styles.tagList}>
                {HOT_SEARCHES.map((keyword, index) => (
                  <TouchableOpacity
                    key={`hot-${index}`}
                    style={styles.tag}
                    onPress={() => handleHotPress(keyword)}
                  >
                    <Text style={styles.tagText}>{keyword}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          </ScrollView>
        )}

        {/* 搜索结果 */}
        {searchText && (
          <Animated.View entering={FadeIn.duration(200)} style={styles.results}>
            {/* Tab 切换 */}
            <View style={styles.tabWrapper}>
              <View style={styles.tabContainer}>
                <View style={[styles.tabIndicator, activeTab === "question" && styles.tabIndicatorRight]} />
                <TouchableOpacity
                  style={styles.tabBtn}
                  onPress={() => setActiveTab("article")}
                >
                  <Text style={[styles.tabText, activeTab === "article" && styles.tabTextActive]}>
                    推荐
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.tabBtn}
                  onPress={() => setActiveTab("question")}
                >
                  <Text style={[styles.tabText, activeTab === "question" && styles.tabTextActive]}>
                    问答
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 结果列表 */}
            {activeTab === "article" ? (
              <FlatList
                data={searchResults.articles}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.resultCard}
                    onPress={() => handleResultPress("article", item.id)}
                  >
                    {item.image && (
                      <Image source={{ uri: item.image }} style={styles.resultImage} />
                    )}
                    <View style={styles.resultContent}>
                      <Text style={styles.resultTitle} numberOfLines={2}>
                        {item.title}
                      </Text>
                      <Text style={styles.resultDesc} numberOfLines={1}>
                        {item.description}
                      </Text>
                      <View style={styles.resultMeta}>
                        {item.tag && (
                          <View style={styles.resultTag}>
                            <Text style={styles.resultTagText}>{item.tag}</Text>
                          </View>
                        )}
                        <Text style={styles.resultViews}>{item.views} 阅读</Text>
                      </View>
                    </View>
                  </Pressable>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>未找到相关文章</Text>
                  </View>
                }
              />
            ) : (
              <FlatList
                data={searchResults.questions}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.resultCard}
                    onPress={() => handleResultPress("question", item.id)}
                  >
                    <View style={styles.questionIcon}>
                      <History size={20} color="#3B82F6" />
                    </View>
                    <View style={styles.resultContent}>
                      <Text style={styles.resultTitle} numberOfLines={2}>
                        {item.title}
                      </Text>
                      <Text style={styles.resultDesc} numberOfLines={1}>
                        {item.content}
                      </Text>
                      <View style={styles.resultMeta}>
                        <Text style={styles.resultViews}>{item.repliesCount} 回答</Text>
                        <Text style={styles.resultViews}>{item.views} 浏览</Text>
                      </View>
                    </View>
                  </Pressable>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>未找到相关问答</Text>
                  </View>
                }
              />
            )}
          </Animated.View>
        )}

        {/* 空状态 */}
        {showEmpty && (
          <Animated.View entering={FadeIn.duration(200)} style={styles.emptyState}>
            <Search size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>未找到结果</Text>
            <Text style={styles.emptySubtitle}>换个关键词试试吧</Text>
          </Animated.View>
        )}
      </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  clearBtn: {
    fontSize: 13,
    color: "#3B82F6",
  },
  tagList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tagText: {
    fontSize: 14,
    color: "#374151",
  },
  results: {
    flex: 1,
  },
  // Tab
  tabWrapper: { paddingHorizontal: 24, marginBottom: 16 },
  tabContainer: { flexDirection: "row", position: "relative" },
  tabIndicator: { position: "absolute", bottom: 0, left: 0, right: "50%", height: 2, backgroundColor: "#3B82F6", borderRadius: 1 },
  tabIndicatorRight: { left: "50%", right: 0 },
  tabBtn: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 10 },
  tabText: { fontSize: 15, fontWeight: "500", color: "#9CA3AF" },
  tabTextActive: { color: "#000000", fontWeight: "700" },
  resultCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  resultImage: {
    width: 100,
    height: 100,
  },
  questionIcon: {
    width: 100,
    height: 100,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  resultContent: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    lineHeight: 20,
  },
  resultDesc: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },
  resultMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  resultTag: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  resultTagText: {
    fontSize: 11,
    color: "#3B82F6",
    fontWeight: "500",
  },
  resultViews: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#374151",
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 4,
  },
});
