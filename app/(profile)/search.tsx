import { router } from "expo-router";
import { ChevronLeft, Search, X } from "lucide-react-native";
import { useState } from "react";
import { FlatList, Keyboard, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface SearchResult {
  id: string;
  type: "article" | "plan" | "user" | "qa";
  title: string;
  subtitle: string;
  time?: string;
  tag?: string;
}

const mockSearchResults: SearchResult[] = [
  { id: "1", type: "article", title: "英国留学签证办理指南", subtitle: "详细解析英国学生签证申请流程及所需材料", time: "2024-01-15" },
  { id: "2", type: "article", title: "2024各国入境政策汇总", subtitle: "美国、英国、澳大利亚最新入境政策", time: "2024-01-10" },
  { id: "3", type: "plan", title: "我的英国留学规划", subtitle: "包含选校、申请、签证全流程规划", tag: "规划" },
  { id: "4", type: "qa", title: "如何申请美国F1学生签证？", subtitle: "美国F1签证申请全攻略，包含面试技巧", tag: "问答" },
  { id: "5", type: "article", title: "留学生行李打包清单checklist", subtitle: "建议收藏！超详细的行李清单", time: "2024-01-08" },
];

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

  const doSearch = (text: string) => {
    if (!text.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }
    setHasSearched(true);
    setSearchResults(
      mockSearchResults.filter(
        (item) =>
          item.title.toLowerCase().includes(text.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(text.toLowerCase())
      )
    );
  };

  const handleSubmit = () => {
    Keyboard.dismiss();
    doSearch(keyword);
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

      <View style={styles.content}>
        {!hasSearched ? (
          <View style={styles.emptyContainer}>
            <Search size={48} color="#E5E7EB" />
            <Text style={styles.emptyText}>输入关键词搜索</Text>
          </View>
        ) : searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
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