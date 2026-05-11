import { router } from "expo-router";
import { Alert, FlatList, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Bell, MessageCircle, Pin, PinOff, Trash2, X } from "lucide-react-native";
import React, { useState, useRef } from "react";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";

interface Message {
  id: string;
  title: string;
  content: string;
  time: string;
  avatar?: string;
  isRead: boolean;
  type: "system" | "comment" | "answer";
  isPinned: boolean;
}

const mockMessages: Message[] = [
  {
    id: "1",
    title: "系统通知",
    content: "欢迎使用 Go Abroad，您的账号已激活成功",
    time: "刚刚",
    avatar: undefined,
    isRead: false,
    type: "system",
    isPinned: false,
  },
  {
    id: "2",
    title: "小明 评论了你",
    content: "你好，请问英国留学签证申请需要准备哪些材料？谢谢！",
    time: "10分钟前",
    avatar: "https://api.dicebear.com/7.x/avataaars/png?seed=xiaoming",
    isRead: false,
    type: "comment",
    isPinned: true,
  },
  {
    id: "3",
    title: "小红 回答了你的提问",
    content: "关于英国签证办理流程，我整理了一份详细的攻略，请查看。涵盖了从准备材料到面签的全过程。",
    time: "1小时前",
    avatar: "https://api.dicebear.com/7.x/avataaars/png?seed=xiaohong",
    isRead: true,
    type: "answer",
    isPinned: false,
  },
  {
    id: "4",
    title: "系统通知",
    content: "新功能上线：新增行程规划助手，让您的旅行更轻松",
    time: "昨天",
    avatar: undefined,
    isRead: true,
    type: "system",
    isPinned: false,
  },
  {
    id: "5",
    title: "张三 评论了你",
    content: "请问美国探亲签证的申请流程是怎样的？有没有什么需要注意的地方？希望能够得到详细的解答。",
    time: "2天前",
    avatar: "https://api.dicebear.com/7.x/avataaars/png?seed=zhangsan",
    isRead: true,
    type: "comment",
    isPinned: false,
  },
];

const getTypeColor = (type: Message["type"]) => {
  switch (type) {
    case "system":
      return "#3B82F6";
    case "comment":
      return "#10B981";
    case "answer":
      return "#8B5CF6";
    default:
      return "#6B7280";
  }
};

interface SwipeActionProps {
  isPinned: boolean;
  onTogglePin: () => void;
  onDelete: () => void;
}

function SwipeActions({ isPinned, onTogglePin, onDelete }: SwipeActionProps) {
  const handleTogglePin = () => {
    onTogglePin();
  };

  const handleDelete = () => {
    onDelete();
  };

  return (
    <View style={styles.swipeActions}>
      <TouchableOpacity
        style={[styles.swipeAction, isPinned ? styles.unpinAction : styles.pinAction]}
        onPress={handleTogglePin}
        activeOpacity={0.8}
      >
        {isPinned ? <PinOff size={20} color="white" /> : <Pin size={20} color="white" />}
        <Text style={styles.swipeActionText}>{isPinned ? "取消置顶" : "置顶"}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.swipeAction, styles.deleteAction]}
        onPress={handleDelete}
        activeOpacity={0.8}
      >
        <Trash2 size={20} color="white" />
        <Text style={styles.swipeActionText}>删除</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function MessagesScreen() {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());

  const sortedMessages = [...messages].sort((a, b) => {
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1;
    }
    return 0;
  });

  const handleTogglePin = (id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isPinned: !m.isPinned } : m))
    );
    swipeableRefs.current.get(id)?.close();
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "确认删除",
      "确定要删除这条消息吗？",
      [
        { text: "取消", style: "cancel" },
        {
          text: "删除",
          style: "destructive",
          onPress: () => {
            setMessages((prev) => prev.filter((m) => m.id !== id));
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Message }) => (
    <Swipeable
      ref={(ref) => {
        if (ref) swipeableRefs.current.set(item.id, ref);
      }}
      renderRightActions={() => (
        <SwipeActions
          isPinned={item.isPinned}
          onTogglePin={() => handleTogglePin(item.id)}
          onDelete={() => handleDelete(item.id)}
        />
      )}
      overshootRight={false}
      friction={2}
    >
      <View style={[styles.messageItem, item.isPinned && styles.pinnedItem]}>
        <TouchableOpacity
          style={styles.messageTouchable}
          activeOpacity={0.7}
        >
        <View style={styles.avatarWrapper}>
          {item.type === "system" ? (
            <View style={[styles.avatarContainer, { backgroundColor: getTypeColor(item.type) + "20" }]}>
              <Bell size={24} color={getTypeColor(item.type)} />
            </View>
          ) : (
            <Image
              source={{ uri: item.avatar }}
              style={styles.userAvatar}
            />
          )}
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>

        <View style={styles.messageContent}>
          <View style={styles.titleRow}>
            <View style={styles.titleLeft}>
              {item.isPinned && <Pin size={14} color="#F59E0B" style={styles.pinIcon} />}
              <Text style={[styles.messageTitle, !item.isRead && styles.unreadText]}>
                {item.title}
              </Text>
            </View>
            <Text style={styles.messageTime}>{item.time}</Text>
          </View>
          <Text style={styles.messageDesc} numberOfLines={2}>
            {item.content}
          </Text>
        </View>
        </TouchableOpacity>
      </View>
    </Swipeable>
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <MessageCircle size={64} color="#D1D5DB" />
      <Text style={styles.emptyText}>暂无消息</Text>
      <Text style={styles.emptySubText}>您还没有收到任何消息</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <X size={24} color="#4B5563" />
          </TouchableOpacity>
          <Text style={styles.title}>消息中心</Text>
        </View>
      </View>

      <FlatList
        data={sortedMessages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 16 : 44,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  listContent: {
    flexGrow: 1,
  },
  messageItem: {
    backgroundColor: "white",
  },
  pinnedItem: {
    backgroundColor: "#F0F7FF",
  },
  messageTouchable: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  unreadItem: {},
  avatarWrapper: {
    position: "relative",
    marginRight: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  messageContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  titleLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  pinIcon: {
    marginRight: 4,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    flexShrink: 1,
  },
  unreadText: {
    fontWeight: "700",
    color: "#111827",
  },
  messageTime: {
    fontSize: 14,
    color: "#9CA3AF",
    marginLeft: 8,
  },
  messageDesc: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  unreadDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#EF4444",
    borderWidth: 2,
    borderColor: "white",
  },
  separator: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginLeft: 76,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 8,
  },
  swipeActions: {
    flexDirection: "row",
    alignItems: "center",
    height: "100%",
  },
  swipeAction: {
    width: 70,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  pinAction: {
    backgroundColor: "#F59E0B",
  },
  unpinAction: {
    backgroundColor: "#9CA3AF",
  },
  deleteAction: {
    backgroundColor: "#EF4444",
  },
  swipeActionText: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
  },
});
