import { router, useLocalSearchParams } from "expo-router";
import { Bookmark, ChevronLeft, MessageCircle, Plus, Send, ThumbsUp, UserCheck } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as homeApi from "@/src/api/home";
import { HtmlRenderer } from "@/src/components/HtmlRenderer";
import { CommentSheet } from "@/components/page/home/CommentSheet";
import type { Question, Answer } from "@/src/types/home";

export default function QADetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [likedAnswers, setLikedAnswers] = useState<Record<number, boolean>>({});
  const [bookmarkedAnswers, setBookmarkedAnswers] = useState<Record<number, boolean>>({});
  const [followedAuthors, setFollowedAuthors] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);

  // 评论面板状态
  const [commentSheetVisible, setCommentSheetVisible] = useState(false);
  const [currentAnswerId, setCurrentAnswerId] = useState<number | null>(null);

  // 评论创建回调 - 更新本地回答的评论数
  const handleCommentCreated = (_isReply: boolean) => {
    if (!currentAnswerId) return;
    setAnswers(prev => prev.map(a => {
      if (a.id === currentAnswerId) {
        return {
          ...a,
          repliesCount: (a.repliesCount || 0) + 1
        };
      }
      return a;
    }));
  };

  // 加载问题详情和回答列表
  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [questionData, answersData] = await Promise.all([
        homeApi.getQuestionDetail(Number(id)),
        homeApi.getAnswerList({ questionId: Number(id), pageSize: 20 }),
      ]);
      setQuestion(questionData);
      const sortedAnswers = (answersData?.list || []).sort((a, b) => b.likes - a.likes);
      setAnswers(sortedAnswers);

      const likeState: Record<number, boolean> = {};
      const bookmarkState: Record<number, boolean> = {};
      const followState: Record<number, boolean> = {};
      (answersData?.list || []).forEach((answer) => {
        likeState[answer.id] = answer.isLiked || false;
        bookmarkState[answer.id] = answer.isFavorited || false;
        followState[answer.authorId] = answer.isFollowed || false;
      });
      setLikedAnswers(likeState);
      setBookmarkedAnswers(bookmarkState);
      setFollowedAuthors(followState);
    } catch (error) {
      console.error("加载问答详情失败:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

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

  // 打开评论面板
  const openCommentSheet = (answerId: number) => {
    setCurrentAnswerId(answerId);
    setCommentSheetVisible(true);
  };

  // 关闭评论面板
  const closeCommentSheet = () => {
    setCommentSheetVisible(false);
    setCurrentAnswerId(null);
  };

  // 切换点赞回答
  const handleToggleLike = async (answerId: number) => {
    const answer = answers.find(a => a.id === answerId);
    if (!answer) return;

    const currentState = likedAnswers[answerId] || false;
    setLikedAnswers((prev) => ({ ...prev, [answerId]: !currentState }));
    setAnswers(prev => prev.map(a =>
      a.id === answerId ? { ...a, likes: currentState ? a.likes - 1 : a.likes + 1 } : a
    ));

    try {
      await homeApi.toggleLike({
        targetId: answerId,
        targetType: "answer",
        action: "like",
      });
    } catch (error) {
      setLikedAnswers((prev) => ({ ...prev, [answerId]: currentState }));
      setAnswers(prev => prev.map(a =>
        a.id === answerId ? { ...a, likes: answer.likes } : a
      ));
      console.error("点赞操作失败:", error);
    }
  };

  // 切换收藏回答
  const handleToggleBookmark = async (answerId: number) => {
    const answer = answers.find(a => a.id === answerId);
    if (!answer) return;

    const currentState = bookmarkedAnswers[answerId] || false;
    setBookmarkedAnswers((prev) => ({ ...prev, [answerId]: !currentState }));
    setAnswers(prev => prev.map(a =>
      a.id === answerId ? { ...a, favorites: currentState ? a.favorites - 1 : a.favorites + 1 } : a
    ));

    try {
      await homeApi.toggleFavorite({
        targetId: answerId,
        targetType: "answer",
        action: "favorite",
      });
    } catch (error) {
      setBookmarkedAnswers((prev) => ({ ...prev, [answerId]: currentState }));
      setAnswers(prev => prev.map(a =>
        a.id === answerId ? { ...a, favorites: answer.favorites } : a
      ));
      console.error("收藏操作失败:", error);
    }
  };

  // 切换关注用户
  const handleToggleFollow = async (authorId: number) => {
    const currentState = followedAuthors[authorId] || false;
    setFollowedAuthors((prev) => ({ ...prev, [authorId]: !currentState }));
    try {
      await homeApi.toggleFollow({
        targetId: authorId,
        targetType: "user",
        action: "follow",
      });
      Alert.alert(currentState ? "已取消关注" : "关注成功");
    } catch (error) {
      setFollowedAuthors((prev) => ({ ...prev, [authorId]: currentState }));
      console.error("关注操作失败:", error);
    }
  };

  // 获取头像首字
  const getAvatarText = (nickname?: string) => {
    return nickname?.charAt(0) || "游";
  };

  // 格式化日期
  const formatAnswerDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  if (loading || !question) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-white">
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
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      {/* 头部 */}
      <View className="px-4 py-3 flex-row items-center justify-between border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* 问题区域 */}
        <View className="px-4 py-5">
          <Text className="text-2xl font-bold text-gray-900 leading-tight">
            {question.title}
          </Text>
          <View className="flex-row items-center gap-4 mt-3">
            <Text className="text-sm text-gray-500">
              {answers.length} 个回答
            </Text>
            <Text className="text-sm text-gray-400">|</Text>
            <Text className="text-sm text-gray-500">
              {question.views} 浏览
            </Text>
          </View>
        </View>

        {/* 分割线 */}
        <View className="h-px bg-gray-100 mx-4" />

        {/* 回答列表 */}
        <View className="px-4">
          {answers.map((answer, index) => (
            <View key={answer.id}>
              {/* 回答者信息 */}
              <View className="flex-row items-center justify-between py-4">
                <View className="flex-row items-center gap-3">
                  <View className={`w-10 h-10 rounded-full items-center justify-center ${
                    answer.isOfficial ? "bg-blue-100" : "bg-gray-100"
                  }`}>
                    <Text className={`text-base font-medium ${
                      answer.isOfficial ? "text-blue-600" : "text-gray-600"
                    }`}>
                      {getAvatarText(answer.author?.nickname)}
                    </Text>
                  </View>
                  <View>
                    <View className="flex-row items-center gap-2">
                      <Text className="text-base font-medium text-gray-900">
                        {answer.author?.nickname || "旅行用户"}
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
                  </View>
                </View>
                <TouchableOpacity
                  className={`flex-row items-center gap-1 px-3 py-1.5 rounded-full ${
                    followedAuthors[answer.authorId]
                      ? "bg-gray-100 border border-gray-300"
                      : "border border-blue-500"
                  }`}
                  onPress={() => handleToggleFollow(answer.authorId)}
                >
                  {followedAuthors[answer.authorId] ? (
                    <>
                      <UserCheck size={14} color="#6B7280" />
                      <Text className="text-sm text-gray-500 font-medium">已关注</Text>
                    </>
                  ) : (
                    <>
                      <Plus size={14} color="#3B82F6" />
                      <Text className="text-sm text-blue-500 font-medium">关注</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* 回答内容 */}
              <View className="mb-3">
                <HtmlRenderer html={answer.content} />
              </View>

              {/* 日期 */}
              <Text className="text-sm text-gray-400 mb-3">
                {formatAnswerDate(answer.createdAt)}
              </Text>

              {/* 操作栏：点赞、收藏、评论 */}
              <View className="flex-row items-center justify-end gap-5 pb-4">
                <TouchableOpacity
                  className="flex-row items-center gap-1"
                  onPress={() => handleToggleLike(answer.id)}
                >
                  <ThumbsUp
                    size={18}
                    color={likedAnswers[answer.id] ? "#3B82F6" : "#9CA3AF"}
                    fill={likedAnswers[answer.id] ? "#3B82F6" : "none"}
                  />
                  <Text className={`text-sm ${likedAnswers[answer.id] ? "text-blue-600" : "text-gray-400"}`}>
                    {answer.likes}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-row items-center gap-1"
                  onPress={() => handleToggleBookmark(answer.id)}
                >
                  <Bookmark
                    size={18}
                    color={bookmarkedAnswers[answer.id] ? "#3B82F6" : "#9CA3AF"}
                    fill={bookmarkedAnswers[answer.id] ? "#3B82F6" : "none"}
                  />
                  <Text className={`text-sm ${bookmarkedAnswers[answer.id] ? "text-blue-600" : "text-gray-400"}`}>
                    {answer.favorites || 0}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-row items-center gap-1"
                  onPress={() => openCommentSheet(answer.id)}
                >
                  <MessageCircle size={18} color="#9CA3AF" />
                  <Text className="text-sm text-gray-400">{answer.repliesCount}</Text>
                </TouchableOpacity>
              </View>

              {/* 回答之间的分割线 */}
              {index < answers.length - 1 && (
                <View className="h-px bg-gray-100" />
              )}
            </View>
          ))}
        </View>

        {/* 底部空隙 */}
        <View className="h-20" />
      </ScrollView>

      {/* 评论面板 */}
      {currentAnswerId && (
        <CommentSheet
          visible={commentSheetVisible}
          answerId={currentAnswerId}
          onClose={closeCommentSheet}
          onCommentCreated={handleCommentCreated}
        />
      )}
    </SafeAreaView>
  );
}