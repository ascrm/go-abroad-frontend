import { router, useLocalSearchParams } from "expo-router";
import { Bookmark, BookmarkCheck, ChevronLeft, MessageCircle, Plus, Send, Share2, ThumbsUp } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as homeApi from "@/src/api/home";
import { HtmlRenderer } from "@/src/components/HtmlRenderer";
import type { Question, Answer, Comment } from "@/src/types/home";
import { formatDate } from "@/src/utils/time";

export default function QADetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [likedAnswers, setLikedAnswers] = useState<Record<number, boolean>>({});
  const [bookmarkedAnswers, setBookmarkedAnswers] = useState<Record<number, boolean>>({});
  const [isFavorite, setIsFavorite] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [loading, setLoading] = useState(true);

  // 评论相关状态
  const [commentsMap, setCommentsMap] = useState<Record<number, Comment[]>>({});
  const [commentsLoading, setCommentsLoading] = useState<Record<number, boolean>>({});
  const [expandedAnswers, setExpandedAnswers] = useState<Record<number, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [replyingTo, setReplyingTo] = useState<Record<number, number | null>>({});

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
      setAnswers(answersData?.list || []);
      setIsFavorite(questionData.isFavorited || false);

      const likeState: Record<number, boolean> = {};
      const bookmarkState: Record<number, boolean> = {};
      (answersData?.list || []).forEach((answer) => {
        likeState[answer.id] = answer.isLiked || false;
        bookmarkState[answer.id] = false;
      });
      setLikedAnswers(likeState);
      setBookmarkedAnswers(bookmarkState);
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

  // 加载评论
  const loadComments = useCallback(async (answerId: number) => {
    setCommentsLoading(prev => ({ ...prev, [answerId]: true }));
    try {
      const response = await homeApi.getCommentList({ answerId, pageSize: 50 });
      setCommentsMap(prev => ({ ...prev, [answerId]: response.list || [] }));
    } catch (error) {
      console.error("加载评论失败:", error);
    } finally {
      setCommentsLoading(prev => ({ ...prev, [answerId]: false }));
    }
  }, []);

  // 切换评论区
  const toggleComments = (answerId: number) => {
    const isExpanded = expandedAnswers[answerId];
    if (!isExpanded) {
      loadComments(answerId);
    }
    setExpandedAnswers(prev => ({ ...prev, [answerId]: !isExpanded }));
  };

  // 切换收藏问题
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

  // 切换点赞回答
  const handleToggleLike = async (answerId: number) => {
    const currentState = likedAnswers[answerId] || false;
    setLikedAnswers((prev) => ({ ...prev, [answerId]: !currentState }));
    try {
      await homeApi.toggleLike({
        targetId: answerId,
        targetType: "answer",
        action: "like",
      });
    } catch (error) {
      setLikedAnswers((prev) => ({ ...prev, [answerId]: currentState }));
      console.error("点赞操作失败:", error);
    }
  };

  // 切换收藏回答
  const handleToggleBookmark = async (answerId: number) => {
    const currentState = bookmarkedAnswers[answerId] || false;
    setBookmarkedAnswers((prev) => ({ ...prev, [answerId]: !currentState }));
    try {
      await homeApi.toggleFavorite({
        targetId: answerId,
        targetType: "answer",
        action: "favorite",
      });
    } catch (error) {
      setBookmarkedAnswers((prev) => ({ ...prev, [answerId]: currentState }));
      console.error("收藏操作失败:", error);
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

  // 提交评论
  const handleSubmitComment = async (answerId: number) => {
    const content = commentInputs[answerId]?.trim();
    if (!content) return;
    const parentId = replyingTo[answerId];
    try {
      const newComment = await homeApi.createComment({
        answerId,
        parentId: parentId || undefined,
        content,
      });
      setCommentsMap(prev => {
        const currentComments = prev[answerId] || [];
        if (parentId) {
          const updatedComments = addReplyToComment(currentComments, parentId, newComment);
          return { ...prev, [answerId]: updatedComments };
        } else {
          return { ...prev, [answerId]: [newComment, ...currentComments] };
        }
      });
      setCommentInputs(prev => ({ ...prev, [answerId]: "" }));
      setReplyingTo(prev => ({ ...prev, [answerId]: null }));
      setAnswers(prev => prev.map(a =>
        a.id === answerId ? { ...a, repliesCount: a.repliesCount + 1 } : a
      ));
    } catch (error) {
      console.error("提交评论失败:", error);
    }
  };

  // 递归添加回复
  const addReplyToComment = (comments: Comment[], parentId: number, newReply: Comment): Comment[] => {
    return comments.map(comment => {
      if (comment.id === parentId) {
        return { ...comment, replies: [newReply, ...(comment.replies || [])], repliesCount: comment.repliesCount + 1 };
      }
      if (comment.replies && comment.replies.length > 0) {
        return { ...comment, replies: addReplyToComment(comment.replies, parentId, newReply) };
      }
      return comment;
    });
  };

  // 设置回复目标
  const setReplyTarget = (answerId: number, commentId: number | null) => {
    setReplyingTo(prev => ({ ...prev, [answerId]: commentId }));
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
        <View className="flex-row items-center gap-4">
          <TouchableOpacity onPress={handleToggleFavorite} className="p-1">
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

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* 问题区域 */}
        <View className="px-4 py-5">
          {/* 第一行：问题标题 */}
          <Text className="text-2xl font-bold text-gray-900 leading-tight">
            {question.title}
          </Text>

          {/* 第二行：回答数和关注数 */}
          <View className="flex-row items-center gap-4 mt-3">
            <Text className="text-sm text-gray-500">
              {question.repliesCount} 个回答
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
                <TouchableOpacity className="flex-row items-center gap-1 px-3 py-1.5 border border-blue-500 rounded-full">
                  <Plus size={14} color="#3B82F6" />
                  <Text className="text-sm text-blue-500 font-medium">关注</Text>
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
                    收藏
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-row items-center gap-1"
                  onPress={() => toggleComments(answer.id)}
                >
                  <MessageCircle size={18} color="#9CA3AF" />
                  <Text className="text-sm text-gray-400">{answer.repliesCount}</Text>
                </TouchableOpacity>
              </View>

              {/* 评论区域 */}
              {expandedAnswers[answer.id] && (
                <View className="bg-gray-50 rounded-xl p-4 mb-4">
                  {commentsLoading[answer.id] ? (
                    <Text className="text-sm text-gray-400 text-center">加载中...</Text>
                  ) : (
                    <View className="gap-4">
                      {(commentsMap[answer.id] || []).map((comment) => (
                        <CommentItem
                          key={comment.id}
                          comment={comment}
                          answerId={answer.id}
                          replyingTo={replyingTo[answer.id]}
                          setReplyTarget={(commentId) => setReplyTarget(answer.id, commentId)}
                          getAvatarText={getAvatarText}
                        />
                      ))}
                    </View>
                  )}
                  {/* 评论输入框 */}
                  <View className="mt-3 flex-row items-end gap-2">
                    {replyingTo[answer.id] && (
                      <TouchableOpacity onPress={() => setReplyTarget(answer.id, null)}>
                        <Text className="text-xs text-blue-500">取消回复</Text>
                      </TouchableOpacity>
                    )}
                    <TextInput
                      className="flex-1 bg-white rounded-xl px-3 py-2 text-gray-700 text-sm"
                      placeholder={replyingTo[answer.id] ? "写下你的回复..." : "写下你的评论..."}
                      placeholderTextColor="#9CA3AF"
                      value={commentInputs[answer.id] || ""}
                      onChangeText={(text) => setCommentInputs(prev => ({ ...prev, [answer.id]: text }))}
                      multiline
                    />
                    <TouchableOpacity
                      className="w-8 h-8 bg-blue-600 rounded-full items-center justify-center"
                      onPress={() => handleSubmitComment(answer.id)}
                    >
                      <Send size={14} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

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

      {/* 底部输入框 */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View className="bg-white px-4 py-3 border-t border-gray-100">
          {showReplyInput ? (
            <View className="flex-row items-end gap-2">
              <TextInput
                className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 text-gray-700 text-sm max-h-32"
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// 评论项组件
interface CommentItemProps {
  comment: Comment;
  answerId: number;
  replyingTo: number | null;
  setReplyTarget: (commentId: number | null) => void;
  getAvatarText: (nickname?: string) => string;
}

function CommentItem({ comment, answerId, replyingTo, setReplyTarget, getAvatarText }: CommentItemProps) {
  return (
    <View>
      <View className="flex-row items-start gap-2">
        <View className="w-8 h-8 bg-gray-200 rounded-full items-center justify-center">
          <Text className="text-xs text-gray-600 font-medium">
            {getAvatarText(comment.author?.nickname)}
          </Text>
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-sm font-medium text-gray-900">
              {comment.author?.nickname || "用户"}
            </Text>
            <Text className="text-xs text-gray-400">
              {formatDate(comment.createdAt)}
            </Text>
          </View>
          <Text className="text-sm text-gray-700 mt-1">{comment.content}</Text>
          <TouchableOpacity className="mt-1" onPress={() => setReplyTarget(comment.id)}>
            <Text className="text-xs text-blue-500">回复</Text>
          </TouchableOpacity>

          {/* 子评论 */}
          {comment.replies && comment.replies.length > 0 && (
            <View className="mt-3 ml-4 pl-3 border-l-2 border-gray-200">
              {comment.replies.map((reply) => (
                <View key={reply.id} className="mt-2">
                  <View className="flex-row items-center gap-2">
                    <View className="w-6 h-6 bg-gray-100 rounded-full items-center justify-center">
                      <Text className="text-xs text-gray-500 font-medium">
                        {getAvatarText(reply.author?.nickname)}
                      </Text>
                    </View>
                    <Text className="text-xs font-medium text-gray-900">
                      {reply.author?.nickname || "用户"}
                    </Text>
                    <Text className="text-xs text-gray-400">
                      {formatDate(reply.createdAt)}
                    </Text>
                  </View>
                  <Text className="text-sm text-gray-700 mt-1 ml-8">{reply.content}</Text>
                  <TouchableOpacity className="mt-1 ml-8" onPress={() => setReplyTarget(reply.id)}>
                    <Text className="text-xs text-blue-500">回复</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}