import OptionsMenu from "@/components/page/home/OptionsMenu";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Bookmark, ChartNoAxesColumn, Ellipsis, MessageCircle, Search, Sparkles } from "lucide-react-native";
import { useRef, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type TabType = "recommend" | "qa";

// 模拟数据
const recommendData = [
  {
    id: "1",
    title: "2024年留学申请全攻略",
    description: "从选校到拿到offer的完整指南，包含选校、申请材料、面试技巧等全方位指导",
    tag: "攻略",
    date: "2小时前",
    image: "https://picsum.photos/400/200?random=1",
    views: 1234,
    favorites: 89,
  },
  {
    id: "2",
    title: "QS排名前100的英国大学一览",
    description: "申请条件、学费信息一文搞定",
    tag: "排名",
    date: "昨天",
    image: "https://picsum.photos/200/150?random=2",
    views: 856,
    favorites: 45,
  },
  {
    id: "3",
    title: "出国行李清单汇总",
    description: "留学生必带的物品推荐",
    tag: "生活",
    date: "3天前",
    image: "https://picsum.photos/200/150?random=3",
    views: 2100,
    favorites: 120,
  },
  {
    id: "4",
    title: "各国签证政策汇总2024",
    description: "最新各国入境政策及签证办理指南",
    tag: "签证",
    date: "5天前",
    image: "https://picsum.photos/200/150?random=4",
    views: 1567,
    favorites: 78,
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
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [menuDirection, setMenuDirection] = useState<'down' | 'up'>('down');
  const buttonRefs = useRef<Record<string, View | null>>({});

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const showOptions = (id: string) => {
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
              {/* 大卡片 - 第一条 */}
              <TouchableOpacity 
                className="bg-white rounded-2xl overflow-hidden"
                onPress={() => router.push({
                  pathname: "/(home)/article-detail",
                  params: { 
                    id: recommendData[0].id,
                    title: recommendData[0].title,
                    description: recommendData[0].description,
                    tag: recommendData[0].tag,
                    date: recommendData[0].date,
                    image: recommendData[0].image,
                    views: recommendData[0].views,
                    favorites: recommendData[0].favorites
                  }
                })}
              >
                <Image
                  source={{ uri: recommendData[0].image }}
                  style={{ width: '100%', height: 180 }}
                  contentFit="cover"
                />
                <View className="px-5 pt-5 pb-3">
                  <View className="flex-row items-center gap-2 mb-2">
                    <View className="bg-blue-50 px-2 py-1 rounded-md">
                      <Text className="text-xs font-medium text-blue-600">{recommendData[0].tag}</Text>
                    </View>
                    <Text className="text-xs text-gray-400">{recommendData[0].date}</Text>
                  </View>
                  <Text className="text-base font-semibold text-gray-900 leading-tight mb-1">
                    {recommendData[0].title}
                  </Text>
                  <Text className="text-sm text-gray-500" numberOfLines={2}>
                    {recommendData[0].description}
                  </Text>
                  <View className="flex-row justify-between items-center mt-4">
                    <View className="flex-row items-center gap-4">
                      <TouchableOpacity 
                        className="flex-row items-center gap-1"
                        onPress={() => toggleFavorite(recommendData[0].id)}
                      >
                        <Bookmark 
                          size={16} 
                          color={favorites[recommendData[0].id] ? "#3B82F6" : "#9CA3AF"} 
                          fill={favorites[recommendData[0].id] ? "#3B82F6" : "none"}
                        />
                        <Text className="text-sm text-gray-400">{recommendData[0].favorites}</Text>
                      </TouchableOpacity>
                      <View className="flex-row items-center gap-1">
                        <ChartNoAxesColumn size={16} color="#9CA3AF" />
                        <Text className="text-sm text-gray-400">{recommendData[0].views}</Text>
                      </View>
                    </View>
                    <TouchableOpacity 
                      onPress={() => showOptions(recommendData[0].id)}
                      ref={(el) => { buttonRefs.current[recommendData[0].id] = el; }}
                    >
                      <Ellipsis size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>

              {/* 小卡片 - 剩余条目 */}
              {recommendData.slice(1).map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  className="bg-white rounded-2xl overflow-hidden"
                  onPress={() => router.push({
                    pathname: "/(home)/article-detail",
                    params: { 
                      id: item.id,
                      title: item.title,
                      description: item.description,
                      tag: item.tag,
                      date: item.date,
                      image: item.image,
                      views: item.views,
                      favorites: item.favorites
                    }
                  })}
                >
                  <View className="flex-row p-4">
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
                    <Image
                      source={{ uri: item.image }}
                      className="ml-3"
                      style={{ width: 96, height: 96, borderRadius: 12 }}
                      contentFit="cover"
                    />
                  </View>
                  <View className="flex-row justify-between items-center px-5 pb-3">
                    <View className="flex-row items-center gap-4">
                      <TouchableOpacity 
                        className="flex-row items-center gap-1"
                        onPress={() => toggleFavorite(item.id)}
                      >
                        <Bookmark 
                          size={16} 
                          color={favorites[item.id] ? "#3B82F6" : "#9CA3AF"} 
                          fill={favorites[item.id] ? "#3B82F6" : "none"}
                        />
                        <Text className="text-sm text-gray-400">{item.favorites}</Text>
                      </TouchableOpacity>
                      <View className="flex-row items-center gap-1">
                        <ChartNoAxesColumn size={16} color="#9CA3AF" />
                        <Text className="text-sm text-gray-400">{item.views}</Text>
                      </View>
                    </View>
                    <TouchableOpacity 
                      onPress={() => showOptions(item.id)}
                      ref={(el) => { buttonRefs.current[item.id] = el; }}
                    >
                      <Ellipsis size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            // 问答内容
            <View className="gap-3">
              {qaData.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  className="bg-white rounded-2xl p-5"
                  onPress={() => router.push({
                    pathname: "/(home)/qa-detail",
                    params: { 
                      id: item.id,
                      title: item.title,
                      author: item.author,
                      avatar: item.avatar,
                      category: item.category,
                      replies: item.replies,
                      views: item.views,
                      date: item.date
                    }
                  })}
                >
                  {/* 右上角更多按钮 */}
                  <TouchableOpacity 
                    className="absolute top-4 right-4"
                    onPress={() => showOptions(item.id)}
                    ref={(el) => { buttonRefs.current[item.id] = el; }}
                  >
                    <Ellipsis size={20} color="#9CA3AF" />
                  </TouchableOpacity>

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
                      <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center">
                        <Text className="text-sm text-gray-600 font-medium">{item.avatar}</Text>
                      </View>
                      <Text className="text-sm text-gray-500">{item.author}</Text>
                    </View>
                    <View className="flex-row items-center gap-4">
                      <View className="flex-row items-center gap-1">
                        <MessageCircle size={16} color="#9CA3AF" />
                        <Text className="text-sm text-gray-400">{item.replies}</Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <ChartNoAxesColumn size={16} color="#9CA3AF" />
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
