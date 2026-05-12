import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import * as ImagePicker from "expo-image-picker";
import {
  X,
  Smile,
  Send,
  ThumbsUp,
  ThumbsDown,
  Image as ImageIcon,
} from "lucide-react-native";
import type { Comment } from "@/src/types/home";
import * as homeApi from "@/src/api/home";
import { formatRelativeTime } from "@/src/utils/time";

interface CommentSheetProps {
  visible: boolean;
  answerId: number;
  onClose: () => void;
  onCommentCreated?: (isReply: boolean) => void;
}

export function CommentSheet({ visible, answerId, onClose }: CommentSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [likedComments, setLikedComments] = useState<Record<number, boolean>>({});
  const [dislikedComments, setDislikedComments] = useState<Record<number, boolean>>({});
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const inputContainerAnim = useRef(new Animated.Value(0)).current;

  const snapPoints = useMemo(() => ["50%", "90%"], []);

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await homeApi.getCommentList({ answerId, pageSize: 100 });
      setComments(response.list || []);

      const likeState: Record<number, boolean> = {};
      (response.list || []).forEach((c: Comment) => {
        likeState[c.id] = c.isLiked || false;
      });
      setLikedComments(likeState);
      setDislikedComments({});
    } catch (error) {
      console.error("加载评论失败:", error);
    } finally {
      setLoading(false);
    }
  }, [answerId]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        Animated.timing(inputContainerAnim, {
          toValue: e.endCoordinates.height,
          duration: 250,
          useNativeDriver: false,
        }).start();
      }
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        Animated.timing(inputContainerAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.expand();
      loadComments();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible, loadComments]);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      onClose();
    }
  }, [onClose]);

  const handleCommentPress = (comment: Comment) => {
    setReplyingTo(comment);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleInputPress = () => {
    setReplyingTo(null);
  };

  const handleToggleLike = async (commentId: number) => {
    const currentState = likedComments[commentId] || false;
    setLikedComments((prev) => ({ ...prev, [commentId]: !currentState }));
    if (!currentState) {
      setDislikedComments((prev) => ({ ...prev, [commentId]: false }));
    }
    try {
      await homeApi.toggleLike({
        targetId: commentId,
        targetType: "comment",
        action: "like",
      });
    } catch (error) {
      setLikedComments((prev) => ({ ...prev, [commentId]: currentState }));
      console.error("点赞失败:", error);
    }
  };

  const handleToggleDislike = async (commentId: number) => {
    const currentState = dislikedComments[commentId] || false;
    setDislikedComments((prev) => ({ ...prev, [commentId]: !currentState }));
    if (!currentState) {
      setLikedComments((prev) => ({ ...prev, [commentId]: false }));
    }
    try {
      await homeApi.toggleLike({
        targetId: commentId,
        targetType: "comment",
        action: "dislike",
      });
    } catch (error) {
      setDislikedComments((prev) => ({ ...prev, [commentId]: currentState }));
      console.error("踩失败:", error);
    }
  };

  const getAvatarText = (nickname?: string) => {
    return nickname?.charAt(0) || "游";
  };

  const totalComments = comments.reduce((acc, c) => {
    let count = 1;
    if (c.replies && c.replies.length > 0) {
      count += c.replies.length;
    }
    return acc + count;
  }, 0);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const isReply = !!replyingTo;
    setSending(true);
    try {
      const newComment = await homeApi.createComment({
        answerId,
        parentId: replyingTo?.id,
        content: inputText.trim(),
      });

      if (isReply) {
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === replyingTo.id) {
              return {
                ...c,
                replies: [newComment, ...(c.replies || [])],
                repliesCount: c.repliesCount + 1,
              };
            }
            return c;
          })
        );
      } else {
        setComments((prev) => [newComment, ...prev]);
      }
      setInputText("");
      setReplyingTo(null);
      onCommentCreated?.(isReply);
    } catch (error) {
      console.error("发送评论失败:", error);
    } finally {
      setSending(false);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
    });
    if (!result.canceled && result.assets[0]) {
      setInputText((prev) => prev + `[图片]`);
    }
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  const renderCommentItem = (item: Comment) => {
    const isLiked = likedComments[item.id] || false;
    const isDisliked = dislikedComments[item.id] || false;

    return (
      <View style={styles.commentItem} key={item.id}>
        <TouchableOpacity onPress={() => handleCommentPress(item)}>
          <View style={[styles.avatar, item.author ? styles.avatarBlue : styles.avatarGray]}>
            <Text style={styles.avatarText}>{getAvatarText(item.author?.nickname)}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.commentContent}>
          <TouchableOpacity onPress={() => handleCommentPress(item)}>
            <View style={styles.commentHeader}>
              <Text style={styles.nickname}>{item.author?.nickname || "旅行用户"}</Text>
              <Text style={styles.time}>{formatRelativeTime(item.createdAt)}</Text>
            </View>
            <Text style={styles.commentText}>{item.content}</Text>
          </TouchableOpacity>

          <View style={styles.actionBar}>
            <TouchableOpacity style={styles.actionItem} onPress={() => handleToggleLike(item.id)}>
              <ThumbsUp size={14} color={isLiked ? "#3B82F6" : "#9CA3AF"} />
              {item.likes > 0 ? (
                <Text style={[styles.actionText, isLiked && styles.actionTextActive]}>{item.likes}</Text>
              ) : null}
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={() => handleToggleDislike(item.id)}>
              <ThumbsDown size={14} color={isDisliked ? "#EF4444" : "#9CA3AF"} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleCommentPress(item)}>
              <Text style={styles.replyText}>回复</Text>
            </TouchableOpacity>
          </View>

          {item.replies && item.replies.length > 0 && (
            <View style={styles.subComments}>
              {item.replies.map((reply) => {
                const replyIsLiked = likedComments[reply.id] || false;
                const replyIsDisliked = dislikedComments[reply.id] || false;
                return (
                  <View key={reply.id} style={styles.subCommentItem}>
                    <TouchableOpacity onPress={() => handleCommentPress(reply)}>
                      <View style={styles.subAvatar}>
                        <Text style={styles.subAvatarText}>{getAvatarText(reply.author?.nickname)}</Text>
                      </View>
                    </TouchableOpacity>
                    <View style={styles.subCommentContent}>
                      <TouchableOpacity onPress={() => handleCommentPress(reply)}>
                        <View style={styles.commentHeader}>
                          <Text style={styles.subNickname}>{reply.author?.nickname || "用户"}</Text>
                          <Text style={styles.subTime}>{formatRelativeTime(reply.createdAt)}</Text>
                        </View>
                        <Text style={styles.subCommentText}>{reply.content}</Text>
                      </TouchableOpacity>
                      <View style={styles.actionBar}>
                        <TouchableOpacity style={styles.actionItem} onPress={() => handleToggleLike(reply.id)}>
                          <ThumbsUp size={12} color={replyIsLiked ? "#3B82F6" : "#9CA3AF"} />
                          {reply.likes > 0 ? (
                            <Text style={[styles.actionText, replyIsLiked && styles.actionTextActive]}>
                              {reply.likes}
                            </Text>
                          ) : null}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionItem} onPress={() => handleToggleDislike(reply.id)}>
                          <ThumbsDown size={12} color={replyIsDisliked ? "#EF4444" : "#9CA3AF"} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleCommentPress(reply)}>
                          <Text style={styles.replyText}>回复</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </View>
    );
  };

  if (!visible) return null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{totalComments}条评论</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.listContent} contentContainerStyle={styles.listInner}>
          {loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>加载中...</Text>
            </View>
          ) : comments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>暂无评论</Text>
            </View>
          ) : (
            comments.map(renderCommentItem)
          )}
        </ScrollView>

        <Animated.View style={[styles.inputContainer, { marginBottom: inputContainerAnim }]}>
          {replyingTo && (
            <View style={styles.replyHint}>
              <Text style={styles.replyHintText}>
                回复 <Text style={styles.replyTarget}>{replyingTo.author?.nickname || "用户"}</Text>
              </Text>
              <TouchableOpacity onPress={handleCancelReply}>
                <Text style={styles.cancelReply}>取消</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputRow}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder={replyingTo ? "写下你的回复..." : "写下你的评论..."}
                placeholderTextColor="#9CA3AF"
                value={inputText}
                onChangeText={setInputText}
                multiline
                onPress={handleInputPress}
              />
              <View style={styles.inputActions}>
                <TouchableOpacity style={styles.inputIconBtn} onPress={handlePickImage}>
                  <ImageIcon size={16} color="#6B7280" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.inputIconBtn}>
                  <Smile size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.sendBtn, inputText.trim() && styles.sendBtnActive]}
              onPress={handleSend}
              disabled={!inputText.trim() || sending}
            >
              <Send size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sheetBackground: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleIndicator: {
    backgroundColor: "#D1D5DB",
    width: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  closeBtn: {
    padding: 4,
  },
  listContent: {
    flex: 1,
  },
  listInner: {
    paddingBottom: 16,
  },
  commentItem: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarBlue: {
    backgroundColor: "#DBEAFE",
  },
  avatarGray: {
    backgroundColor: "#F3F4F6",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
  },
  commentContent: {
    flex: 1,
    marginLeft: 12,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  nickname: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  time: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  commentText: {
    fontSize: 14,
    color: "#374151",
    marginTop: 4,
  },
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 8,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  actionTextActive: {
    color: "#3B82F6",
  },
  replyText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  subComments: {
    marginTop: 12,
    marginLeft: 16,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: "#E5E7EB",
  },
  subCommentItem: {
    flexDirection: "row",
    marginBottom: 12,
  },
  subAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  subAvatarText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
  },
  subCommentContent: {
    flex: 1,
    marginLeft: 8,
  },
  subNickname: {
    fontSize: 12,
    fontWeight: "500",
    color: "#111827",
  },
  subTime: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  subCommentText: {
    fontSize: 12,
    color: "#374151",
    marginTop: 2,
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    backgroundColor: "#FFFFFF",
  },
  replyHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  replyHintText: {
    fontSize: 14,
    color: "#6B7280",
  },
  replyTarget: {
    color: "#3B82F6",
  },
  cancelReply: {
    fontSize: 14,
    color: "#3B82F6",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  input: {
    flex: 1,
    backgroundColor: "transparent",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: "#374151",
    maxHeight: 100,
  },
  inputActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingRight: 4,
  },
  inputIconBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnActive: {
    backgroundColor: "#3B82F6",
  },
});
