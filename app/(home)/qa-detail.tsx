import { router, useLocalSearchParams } from "expo-router";
import { Bookmark, BookmarkCheck, ChartNoAxesColumn, ChevronLeft, MessageCircle, MoreHorizontal, Send, Share2, ThumbsUp } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as homeApi from "@/src/api/home";
import type { Question, Answer } from "@/src/types/home";
import { formatRelativeTime } from "@/src/utils/time";

export default function QADetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [likedAnswers, setLikedAnswers] = useState<Record<number, boolean>>({});
  const [isFavorite, setIsFavorite] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [loading, setLoading] = useState(true);

  // 加载问题详情和回答列表
  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      // 并行加载问题和回答
      const [questionData, answersData] = await Promise.all([
        homeApi.getQuestionDetail(Number(id)),
        homeApi.getAnswerList({ questionId: Number(id), pageSize: 20 }),
      ]);
      setQuestion(questionData);
      setAnswers(answersData.list);
      setIsFavorite(questionData.isFavorited || false);

      // 初始化点赞状态
      const likeState: Record<number, boolean> = {};
      answersData.list.forEach((answer) => {
        likeState[answer.id] = answer.isLiked || false;
      });
      setLikedAnswers(likeState);
    } catch (error) {
      console.error("加载问答详情失败:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // 首次加载
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 记录浏览
  useEffect(() => {
    if (question) {
      homeApi.recordView({
        targetId: question.id,
        targetType: "question",
        action: "view",
      }).catch(console.error);
    }
  }, [question]);

  // 切换收藏
  const handleToggleFavorite = async () => {
    if (!question) return;
    const currentState = isFavorite;
    setIsFavorite(!currentState);

    try {
      await homeApi.toggleFavorite({
        targetId: question.id,
        targetType: "question",
        action: "favorite",
      });
    } catch (error) {
      setIsFavorite(currentState);
      console.error("收藏操作失败:", error);
    }
  };

  // 切换点赞
  const handleToggleLike = async (answerId: number) => {
    const currentState = likedAnswers[answerId] || false;
    setLikedAnswers((prev) => ({
      ...prev,
      [answerId]: !currentState,
    }));

    try {
      await homeApi.toggleLike({
        targetId: answerId,
        targetType: "answer",
        action: "like",
      });
    } catch (error) {
      setLikedAnswers((prev) => ({
        ...prev,
        [answerId]: currentState,
      }));
      console.error("点赞操作失败:", error);
    }
  };

  // 提交回答
  const handleReply = async () => {
    if (!replyText.trim() || !question) return;

    try {
      const newAnswer = await homeApi.createAnswer({
        questionId: question.id,
        content: replyText.trim(),
      });
      setAnswers((prev) => [newAnswer, ...prev]);
      setReplyText("");
      setShowReplyInput(false);
    } catch (error) {
      console.error("提交回答失败:", error);
    }
  };

  if (loading || !question) {
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

      <ScrollView showsVerticalScrollIndicator={false} className="px-4">
        {/* 整体卡片 */}
        <View className="bg-white rounded-2xl overflow-hidden">
          {/* 问题区域 */}
          <View className="px-5 pt-5 pb-4">
            {/* 用户信息 */}
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-2">
                <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                  <Text className="text-base text-gray-600 font-medium">
                    {question.author?.nickname?.charAt(0) || "用"}
                  </Text>
                </View>
                <View>
                  <Text className="text-sm font-medium text-gray-900">
                    {question.author?.nickname || "未知用户"}
                  </Text>
                  <Text className="text-xs text-gray-400">
                    {formatRelativeTime(question.createdAt)}
                  </Text>
                </View>
              </View>
              {question.category && (
                <View className="bg-orange-50 px-2 py-1 rounded-md">
                  <Text className="text-xs font-medium text-orange-600">{question.category}</Text>
                </View>
              )}
            </View>

            {/* 问题标题 */}
            <Text className="text-xl font-bold text-gray-900 leading-tight mb-4">
              {question.title}
            </Text>

            {/* 统计数据 */}
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
                        }`}>
                          {answer.author?.nickname?.charAt(0) || "用"}
                        </Text>
                      </View>
                      <View>
                        <View className="flex-row items-center gap-2">
                          <Text className="text-base font-medium text-gray-900">
                            {answer.author?.nickname || "未知用户"}
                          </Text>
                          {answer.isOfficial && (
                            <View className="bg-blue-50 px-1.5 py-0.5 rounded">
                              <Text className="text-xs text-blue-600">官方</Text>
                            </View>
                          )}
                          {answer.isBestAnswer && (
                            <View className="bg-green-50 px-1.5 py-0.5 rounded">
                              <Text className="text-xs text-green-600">最佳</Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-xs text-gray-400">
                          {formatRelativeTime(answer.createdAt)}
                        </Text>
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
                      onPress={() => handleToggleLike(answer.id)}
                    >
                      <ThumbsUp
                        size={16}
                        color={likedAnswers[answer.id] ? "#3B82F6" : "#9CA3AF"}
                        fill={likedAnswers[answer.id] ? "#3B82F6" : "none"}
                      />
                      <Text className={`text-sm ${likedAnswers[answer.id] ? "text-blue-600" : "text-gray-400"}`}>
                        {answer.likes}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row items-center gap-1">
                      <MessageCircle size={16} color="#9CA3AF" />
                      <Text className="text-sm text-gray-400">{answer.repliesCount} 回复</Text>
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
