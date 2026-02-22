import { ChevronRight, Eye, MessageCircle, Search, Sparkles } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type TabType = "recommend" | "qa";

// 模拟数据
const recommendData = [
  {
    id: "1",
    title: "2024年留学申请全攻略",
    description: "从选校到拿到offer的完整指南",
    tag: "攻略",
    date: "2小时前",
  },
  {
    id: "2",
    title: "QS排名前100的英国大学一览",
    description: "申请条件、学费信息一文搞定",
    tag: "排名",
    date: "昨天",
  },
  {
    id: "3",
    title: "出国行李清单汇总",
    description: "留学生必带的物品推荐",
    tag: "生活",
    date: "3天前",
  },
];

const qaData = [
  {
    id: "1",
    title: "申请英国研究生需要哪些材料？",
    author: "小明同学",
    avatar: "明",
    category: "申请",
    replies: 12,
    views: 156,
    date: "1小时前",
  },
  {
    id: "2",
    title: "雅思口语复议成功率高吗？",
    author: "烤鸭达人",
    avatar: "烤",
    category: "语言",
    replies: 8,
    views: 89,
    date: "3小时前",
  },
  {
    id: "3",
    title: "有没有靠谱的留学中介推荐？",
    author: "留学小白",
    avatar: "小",
    category: "中介",
    replies: 25,
    views: 342,
    date: "昨天",
  },
  {
    id: "4",
    title: "英国留学签证肺结核检查在哪做？",
    author: "伦敦梦",
    avatar: "伦",
    category: "签证",
    replies: 6,
    views: 78,
    date: "昨天",
  },
];

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("recommend");

  return (
    <SafeAreaView className="flex-1 bg-gray-50">

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

        {/* 内容列表 */}
        <View className="mt-6 px-6 pb-8">
          {activeTab === "recommend" ? (
            // 推荐内容
            <View className="gap-4">
              {recommendData.map((item) => (
                <TouchableOpacity key={item.id} className="bg-white rounded-2xl p-5">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-2">
                        <View className="bg-blue-50 px-2 py-1 rounded-md">
                          <Text className="text-xs font-medium text-blue-600">{item.tag}</Text>
                        </View>
                        <Text className="text-xs text-gray-400">{item.date}</Text>
                      </View>
                      <Text className="text-base font-semibold text-gray-900 leading-tight mb-1">
                        {item.title}
                      </Text>
                      <Text className="text-sm text-gray-500" numberOfLines={2}>
                        {item.description}
                      </Text>
                    </View>
                    <ChevronRight size={18} color="#D1D5DB" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            // 问答内容
            <View className="gap-3">
              {qaData.map((item) => (
                <TouchableOpacity key={item.id} className="bg-white rounded-2xl p-5">
                  {/* 分类标签 */}
                  <View className="flex-row items-center gap-2 mb-3">
                    <View className="bg-orange-50 px-2 py-1 rounded-md">
                      <Text className="text-xs font-medium text-orange-600">{item.category}</Text>
                    </View>
                    <Text className="text-xs text-gray-400">{item.date}</Text>
                  </View>
                  
                  {/* 问题标题 */}
                  <Text className="text-base font-semibold text-gray-900 leading-tight mb-3">
                    {item.title}
                  </Text>
                  
                  {/* 底部信息 */}
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center gap-2">
                      <View className="w-7 h-7 bg-gray-100 rounded-full items-center justify-center">
                        <Text className="text-xs text-gray-600 font-medium">{item.avatar}</Text>
                      </View>
                      <Text className="text-sm text-gray-500">{item.author}</Text>
                    </View>
                    <View className="flex-row items-center gap-4">
                      <View className="flex-row items-center gap-1">
                        <MessageCircle size={14} color="#9CA3AF" />
                        <Text className="text-sm text-gray-400">{item.replies}</Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <Eye size={14} color="#9CA3AF" />
                        <Text className="text-sm text-gray-400">{item.views}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingBottom: 20,
  },
});
