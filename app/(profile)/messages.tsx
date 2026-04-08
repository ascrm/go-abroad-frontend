import { router } from "expo-router";
import { CheckCircle, MessageSquare, X } from "lucide-react-native";
import React, { useState } from "react";
import { FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";

interface Message {
  id: string;
  title: string;
  content: string;
  time: string;
  avatar: string;
  isRead: boolean;
  type: "system" | "order" | "activity";
  isPinned: boolean;
}

const mockMessages: Message[] = [
  {
    id: "1",
    title: "系统通知",
    content: "欢迎使用 Go Abroad，您的账号已激活成功",
    time: "刚刚",
    avatar: "https://api.dicebear.com/7.x/identicon/png?seed=system",
    isRead: false,
    type: "system",
    isPinned: false,
  },
  {
    id: "2",
    title: "订单状态更新",
    content: "您的英国留学签证申请已进入审核阶段，预计3个工作日内完成",
    time: "10分钟前",
    avatar: "https://api.dicebear.com/7.x/identicon/png?seed=order",
    isRead: false,
    type: "order",
    isPinned: true,
  },
  {
    id: "3",
    title: "活动提醒",
    content: "2024秋季国际教育展即将开始，点击查看详情",
    time: "1小时前",
    avatar: "https://api.dicebear.com/7.x/identicon/png?seed=activity",
    isRead: true,
    type: "activity",
    isPinned: false,
  },
  {
    id: "4",
    title: "优惠活动",
    content: "新用户首单立减100元，立即查看",
    time: "昨天",
    avatar: "https://api.dicebear.com/7.x/identicon/png?seed=discount",
    isRead: true,
    type: "activity",
    isPinned: false,
  },
  {
    id: "5",
    title: "订单完成",
    content: "您的美国探亲签证申请已通过审核，祝旅途愉快！",
    time: "2天前",
    avatar: "https://api.dicebear.com/7.x/identicon/png?seed=order-complete",
    isRead: true,
    type: "order",
    isPinned: false,
  },
];

const getTypeColor = (type: Message["type"]) => {
  switch (type) {
    case "system":
      return "#3B82F6";
    case "order":
      return "#10B981";
    case "activity":
      return "#F59E0B";
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
  return (
    <View style={styles.swipeActions}>
      <TouchableOpacity
        style={[styles.swipeAction, isPinned ? styles.unpinAction : styles.pinAction]}
        onPress={onTogglePin}
        activeOpacity={0.8}
      >
        <Text style={styles.swipeActionText}>{isPinned ? "取消置顶" : "置顶"}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.swipeAction, styles.deleteAction]}
        onPress={onDelete}
        activeOpacity={0.8}
      >
        <Text style={styles.swipeActionText}>删除</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function MessagesScreen() {
  const [messages, setMessages] = useState<Message[]>(mockMessages);

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
  };

  const handleDelete = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const renderItem = ({ item }: { item: Message }) => (
    <Swipeable
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
        <View style={[styles.avatarContainer, { backgroundColor: getTypeColor(item.type) + "20" }]}>
          {item.type === "system" ? (
            <CheckCircle size={24} color={getTypeColor(item.type)} />
          ) : item.type === "order" ? (
            <MessageSquare size={24} color={getTypeColor(item.type)} />
          ) : (
            <MessageSquare size={24} color={getTypeColor(item.type)} />
          )}
        </View>

        <View style={styles.messageContent}>
          <View style={styles.titleRow}>
            <View style={styles.titleLeft}>
              {item.isPinned && <Text style={styles.pinIcon}>📌</Text>}
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

        {!item.isRead && <View style={styles.unreadDot} />}
        </TouchableOpacity>
      </View>
    </Swipeable>
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <MessageSquare size={64} color="#D1D5DB" />
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
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
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
    fontSize: 12,
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
    fontSize: 12,
    color: "#9CA3AF",
    marginLeft: 8,
  },
  messageDesc: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#EF4444",
    marginLeft: 8,
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
