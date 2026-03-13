import { router, useLocalSearchParams } from "expo-router";
import { Bookmark, BookmarkCheck, ChartNoAxesColumn, ChevronLeft, MessageCircle, MoreHorizontal, Send, Share2, ThumbsUp } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function QADetailScreen() {
  const { id, title, author, avatar, category, replies, views, date } = useLocalSearchParams<{
    id: string;
    title: string;
    author: string;
    avatar: string;
    category: string;
    replies: string;
    views: string;
    date: string;
  }>();

  const [liked, setLiked] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [likeCount, setLikeCount] = useState(23);
  const [replyText, setReplyText] = useState("");
  const [showReplyInput, setShowReplyInput] = useState(false);

  // 模拟回答数据
  const answers = [
    {
      id: "1",
      author: "留学顾问王老师",
      avatar: "王",
      isOfficial: true,
      content: "申请英国研究生需要准备以下材料：\n\n1. **学术材料**\n- 本科成绩单（需要学校盖章的英文版）\n- 在读证明/毕业证书\n- 学位证书（如已毕业）\n\n2. **语言成绩**\n- 雅思或托福成绩（建议雅思6.5分以上，托福92分以上）\n\n3. **文书材料**\n- 个人陈述（Personal Statement）\n- 两封推荐信\n- 简历（CV）\n\n4. **其他材料**\n- 护照复印件\n- 资金证明\n- 作品集（部分专业需要）\n\n建议提前6-9个月开始准备，祝申请顺利！",
      likes: 45,
      date: "30分钟前",
      replies: 2,
    },
    {
      id: "2",
      author: "英国留学生小李",
      avatar: "李",
      isOfficial: false,
      content: "补充一下我当时的经验：\n\n1. 成绩单一定要提前翻译好，有的学校可以提供英文版，有的需要自己找翻译机构\n\n2. 推荐信建议提前2个月联系老师，让老师有足够时间准备\n\n3. 个人陈述要突出自己的独特优势，不要泛泛而谈\n\n4. 记得关注各学校的申请截止日期，不要错过！",
      likes: 18,
      date: "1小时前",
      replies: 1,
    },
  ];

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  const handleReply = () => {
    if (replyText.trim()) {
      setReplyText("");
      setShowReplyInput(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
      {/* 头部 */}
      <View className="px-4 py-3 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
        <View className="flex-row items-center gap-4">
          <TouchableOpacity 
            onPress={() => setIsFavorite(!isFavorite)}
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

      <ScrollView showsVerticalScrollIndicator={false} className="px-4">
        {/* 整体卡片 */}
        <View className="bg-white rounded-2xl overflow-hidden">
          {/* 问题区域 */}
          <View className="px-5 pt-5 pb-4">
            {/* 用户信息 */}
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-2">
                <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                  <Text className="text-base text-gray-600 font-medium">{avatar}</Text>
                </View>
                <View>
                  <Text className="text-sm font-medium text-gray-900">{author}</Text>
                  <Text className="text-xs text-gray-400">{date}</Text>
                </View>
              </View>
              <View className="bg-orange-50 px-2 py-1 rounded-md">
                <Text className="text-xs font-medium text-orange-600">{category}</Text>
              </View>
            </View>
            
            {/* 问题标题 */}
            <Text className="text-xl font-bold text-gray-900 leading-tight mb-4">
              {title}
            </Text>
            
            {/* 统计数据 */}
            <View className="flex-row items-center gap-4">
              <View className="flex-row items-center gap-1">
                <MessageCircle size={16} color="#9CA3AF" />
                <Text className="text-sm text-gray-400">{replies}</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <ChartNoAxesColumn size={16} color="#9CA3AF" />
                <Text className="text-sm text-gray-400">{views}</Text>
              </View>
            </View>
          </View>

          {/* 分割线 */}
          <View className="h-[1] bg-gray-100" />

          {/* 回答列表 */}
          <View className="px-5 py-4">
            <Text className="text-base font-semibold text-gray-900 mb-4">
              {answers.length} 个回答
            </Text>

          <View className="gap-6">
            {answers.map((answer) => (
              <View key={answer.id}>
                {/* 回答者信息 */}
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center gap-3">
                    <View className={`w-10 h-10 rounded-full items-center justify-center ${
                      answer.isOfficial ? "bg-blue-100" : "bg-gray-100"
                    }`}>
                      <Text className={`text-base font-medium ${
                        answer.isOfficial ? "text-blue-600" : "text-gray-600"
                      }`}>{answer.avatar}</Text>
                    </View>
                    <View>
                      <View className="flex-row items-center gap-2">
                        <Text className="text-base font-medium text-gray-900">{answer.author}</Text>
                        {answer.isOfficial && (
                          <View className="bg-blue-50 px-1.5 py-0.5 rounded">
                            <Text className="text-xs text-blue-600">官方</Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-xs text-gray-400">{answer.date}</Text>
                    </View>
                  </View>
                  <TouchableOpacity>
                    <MoreHorizontal size={18} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>

                {/* 回答内容 */}
                <Text className="text-base text-gray-700 leading-7 mb-4 whitespace-pre-line">
                  {answer.content}
                </Text>

                {/* 点赞和回复 */}
                <View className="flex-row items-center gap-6">
                  <TouchableOpacity 
                    className="flex-row items-center gap-1"
                    onPress={() => {
                      // 点赞逻辑
                    }}
                  >
                    <ThumbsUp 
                      size={16} 
                      color={answer.likes > 0 ? "#3B82F6" : "#9CA3AF"} 
                      fill={answer.likes > 0 ? "#3B82F6" : "none"}
                    />
                    <Text className={`text-sm ${answer.likes > 0 ? "text-blue-600" : "text-gray-400"}`}>
                      {answer.likes}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-row items-center gap-1">
                    <MessageCircle size={16} color="#9CA3AF" />
                    <Text className="text-sm text-gray-400">{answer.replies} 回复</Text>
                  </TouchableOpacity>
                </View>

                {/* 分割线 */}
                <View className="h-px bg-gray-100 mt-5" />
              </View>
            ))}
          </View>
          </View>
        </View>
        {/* 底部空隙 */}
        <View className="h-4" />
      </ScrollView>

      {/* 底部输入框 */}
      <View className="absolute bottom-0 left-0 right-0 bg-white px-4 py-2 border-t border-gray-100">
        {showReplyInput ? (
          <View className="flex-row items-center gap-2">
            <TextInput
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-gray-700 text-sm"
              placeholder="写下你的回答..."
              placeholderTextColor="#9CA3AF"
              value={replyText}
              onChangeText={setReplyText}
              multiline
            />
            <TouchableOpacity 
              className="w-10 h-10 bg-blue-600 rounded-full items-center justify-center"
              onPress={handleReply}
            >
              <Send size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            className="bg-gray-100 rounded-full px-4 py-3"
            onPress={() => setShowReplyInput(true)}
          >
            <Text className="text-gray-400 text-sm">写下你的回答...</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
