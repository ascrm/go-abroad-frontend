import { router } from "expo-router";
import { ChevronLeft, Search, X } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Keyboard, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { searchAll, type ArticleSearchItem, type PlanSearchItem, type QuestionSearchItem, type UserSearchItem } from "@/src/api/search";

type SearchResultType = "all" | "article" | "plan" | "qa" | "user";

interface SearchResult {
  id: string;
  type: Exclude<SearchResultType, "all">;
  title: string;
  subtitle: string;
  time?: string;
  tag?: string;
}

// Tab 配置
const tabs: { key: SearchResultType; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "article", label: "文章" },
  { key: "plan", label: "规划" },
  { key: "qa", label: "问答" },
  { key: "user", label: "用户" },
];

// 转换后端数据为页面需要的格式
const convertResults = (data: { articles?: ArticleSearchItem[], plans?: PlanSearchItem[], questions?: QuestionSearchItem[], users?: UserSearchItem[] }): SearchResult[] => {
  const results: SearchResult[] = [];

  data.articles?.forEach(item => {
    results.push({
      id: `article-${item.id}`,
      type: "article",
      title: item.title,
      subtitle: item.description || "",
      time: item.time,
      tag: item.tag,
    });
  });

  data.plans?.forEach(item => {
    results.push({
      id: `plan-${item.id}`,
      type: "plan",
      title: item.title,
      subtitle: item.description || "",
      tag: "规划",
    });
  });

  data.questions?.forEach(item => {
    results.push({
      id: `qa-${item.id}`,
      type: "qa",
      title: item.title,
      subtitle: item.category || "",
      tag: "问答",
    });
  });

  data.users?.forEach(item => {
    results.push({
      id: `user-${item.id}`,
      type: "user",
      title: item.nickname || item.username,
      subtitle: item.username,
    });
  });

  return results;
};

const getTypeColor = (type: SearchResult["type"]) => {
  switch (type) {
    case "article":
      return "#3B82F6";
    case "plan":
      return "#10B981";
    case "qa":
      return "#8B5CF6";
    case "user":
      return "#F59E0B";
    default:
      return "#6B7280";
  }
};

const getTypeLabel = (type: SearchResult["type"]) => {
  switch (type) {
    case "article":
      return "文章";
    case "plan":
      return "规划";
    case "qa":
      return "问答";
    case "user":
      return "用户";
    default:
      return "";
  }
};

export default function SearchScreen() {
  const [keyword, setKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<SearchResultType>("all");

  // 根据当前 tab 过滤结果
  const filteredResults = activeTab === "all"
    ? searchResults
    : searchResults.filter(item => item.type === activeTab);

  // 防抖搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      if (keyword.trim()) {
        doSearch(keyword);
      } else {
        setSearchResults([]);
        setHasSearched(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword]);

  const doSearch = async (text: string) => {
    setLoading(true);
    try {
      const data = await searchAll(text);
      setSearchResults(convertResults(data));
      setHasSearched(true);
    } catch (error: any) {
      Alert.alert("搜索失败", error.message || "请稍后重试");
      setSearchResults([]);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    Keyboard.dismiss();
    if (keyword.trim()) {
      doSearch(keyword);
    }
  };

  const handleClear = () => {
    setKeyword("");
    setSearchResults([]);
    setHasSearched(false);
    Keyboard.dismiss();
  };

  const renderItem = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity style={styles.resultItem} activeOpacity={0.7}>
      <View style={styles.resultContent}>
        <View style={styles.resultHeader}>
          <View style={[styles.typeTag, { backgroundColor: getTypeColor(item.type) + "20" }]}>
            <Text style={[styles.typeText, { color: getTypeColor(item.type) }]}>
              {getTypeLabel(item.type)}
            </Text>
          </View>
          {item.tag && (
            <View style={styles.tagBadge}>
              <Text style={styles.tagText}>{item.tag}</Text>
            </View>
          )}
        </View>
        <Text style={styles.resultTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.resultSubtitle} numberOfLines={1}>{item.subtitle}</Text>
      </View>
      {item.time && <Text style={styles.resultTime}>{item.time}</Text>}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索文章、规划、问答..."
            placeholderTextColor="#9CA3AF"
            value={keyword}
            onChangeText={setKeyword}
            onSubmitEditing={handleSubmit}
            returnKeyType="search"
            autoFocus
          />
          {keyword.length > 0 && (
            <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
              <X size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tab 标签栏 */}
      {hasSearched && !loading && searchResults.length > 0 && (
        <View style={styles.tabContainer}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.content}>
        {!hasSearched ? (
          <View style={styles.emptyContainer}>
            <Search size={48} color="#E5E7EB" />
            <Text style={styles.emptyText}>输入关键词搜索</Text>
          </View>
        ) : loading ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.emptyText}>搜索中...</Text>
          </View>
        ) : filteredResults.length > 0 ? (
          <FlatList
            data={filteredResults}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            keyboardShouldPersistTaps="handled"
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>未找到相关结果</Text>
            <Text style={styles.emptySubText}>尝试其他关键词搜索</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
  },
  tabActive: {
    backgroundColor: "#1F2937",
  },
  tabText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9CA3AF",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: "#D1D5DB",
    marginTop: 8,
  },
  listContent: {
    flexGrow: 1,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "white",
  },
  resultContent: {
    flex: 1,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  tagBadge: {
    marginLeft: 8,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 11,
    color: "#D97706",
    fontWeight: "500",
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  resultSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  resultTime: {
    fontSize: 12,
    color: "#9CA3AF",
    marginLeft: 12,
  },
  separator: {
    height: 1,
    backgroundColor: "#F9FAFB",
    marginLeft: 16,
  },
});