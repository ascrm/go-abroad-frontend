import { router } from "expo-router";
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Bell, MessageCircle, Pin, PinOff, Trash2, X } from "lucide-react-native";
import React, { useState, useRef, useCallback } from "react";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { useFocusEffect } from "expo-router";
import {Image} from 'expo-image'
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getNotificationList,
  getSystemNotificationList,
  markAsRead,
  togglePin,
  deleteNotification,
  type NotificationResponse
} from "@/src/api/notification";

const getTypeColor = (type: string) => {
  switch (type) {
    case "system":
      return "#3B82F6";
    case "like":
      return "#EF4444";
    case "favorite":
      return "#F59E0B";
    case "comment":
      return "#10B981";
    case "reply":
      return "#8B5CF6";
    default:
      return "#6B7280";
  }
};

const getTypeText = (type: string) => {
  switch (type) {
    case "like":
      return "点赞";
    case "favorite":
      return "收藏";
    case "comment":
      return "评论";
    case "reply":
      return "回复";
    default:
      return "通知";
  }
};

const getRelatedTypeText = (relatedType?: string) => {
  switch (relatedType) {
    case "article":
      return "文章";
    case "question":
      return "提问";
    case "comment":
      return "评论";
    default:
      return "内容";
  }
};

const getNotificationTitle = (item: NotificationResponse): string => {
  if (item.type === "system") {
    return "系统通知";
  }
  const actorName = item.actor?.nickname || "有人";
  const action = getTypeText(item.type);
  const target = getRelatedTypeText(item.relatedType);
  return `${actorName}${action}了你的${target}`;
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
        {isPinned ? <PinOff size={20} color="white" /> : <Pin size={20} color="white" />}
        <Text style={styles.swipeActionText}>{isPinned ? "取消置顶" : "置顶"}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.swipeAction, styles.deleteAction]}
        onPress={onDelete}
        activeOpacity={0.8}
      >
        <Trash2 size={20} color="white" />
        <Text style={styles.swipeActionText}>删除</Text>
      </TouchableOpacity>
    </View>
  );
}

function SystemNotificationCard({ latestContent, onPress }: { latestContent?: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.systemNotificationItem} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.messageItemRow}>
        <View style={styles.avatarWrapper}>
          <View style={[styles.avatarContainer, { backgroundColor: getTypeColor("system") + "20" }]}>
            <Bell size={24} color={getTypeColor("system")} />
          </View>
        </View>
        <View style={styles.messageContent}>
          <View style={styles.row1}>
            <Text style={styles.systemNotificationTitle} numberOfLines={1}>
              系统通知
            </Text>
          </View>
          <Text style={styles.systemNotificationDesc} numberOfLines={1}>
            {latestContent || "暂无系统通知"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function MessagesScreen() {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [systemNotifications, setSystemNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const swipeableRefs = useRef<Map<number, Swipeable>>(new Map());

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      // 加载非系统通知
      const res = await getNotificationList(1, 50);
      if (res && res.list) {
        setNotifications(res.list);
        swipeableRefs.current.forEach((ref, id) => {
          const exists = res.list.some(item => item.id === id);
          if (!exists) swipeableRefs.current.delete(id);
        });
      }
      // 加载系统通知
      const systemRes = await getSystemNotificationList(1, 1);
      if (systemRes && systemRes.list && systemRes.list.length > 0) {
        setSystemNotifications(systemRes.list);
      }
    } catch (error) {
      console.error("加载通知失败:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications])
  );

  const handleTogglePin = async (id: number) => {
    try {
      await togglePin(id);
      await loadNotifications();
    } catch (error) {
      console.error("置顶失败:", error);
    }
    swipeableRefs.current.get(id)?.close();
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      "确认删除",
      "确定要删除这条消息吗？",
      [
        { text: "取消", style: "cancel" },
        {
          text: "删除",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteNotification(id);
              await loadNotifications();
            } catch (error) {
              console.error("删除失败:", error);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: NotificationResponse }) => (
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
      <TouchableOpacity
        style={[styles.messageItem, item.isPinned && styles.pinnedItem]}
        activeOpacity={0.7}
        onPress={async () => {
          if (!item.isRead) {
            try {
              await markAsRead(item.id);
              await loadNotifications();
            } catch (error) {
              console.error("标记已读失败:", error);
            }
          }
          if (item.relatedType === "article" && item.relatedId) {
            router.push(`/article-detail?id=${item.relatedId}`);
          } else if (item.relatedType === "question" && item.relatedId) {
            router.push(`/qa-detail?id=${item.relatedId}`);
          }
        }}
      >
        <View style={styles.messageItemRow}>
        <View style={styles.avatarWrapper}>
          {item.actor?.avatar ? (
            <Image source={{ uri: item.actor.avatar }} style={styles.userAvatar} />
          ) : (
            <View style={[styles.avatarContainer, { backgroundColor: getTypeColor(item.type) + "20" }]}>
              <Bell size={24} color={getTypeColor(item.type)} />
            </View>
          )}
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>

        <View style={styles.messageContent}>
          <View style={styles.row1}>
            <Text style={[styles.notificationTitle, !item.isRead && styles.unreadText]} numberOfLines={1}>
              {getNotificationTitle(item)}
            </Text>
            {item.isPinned && <Pin size={12} color="#F59E0B" style={styles.pinIcon} />}
            <Text style={styles.messageTime}>{item.time}</Text>
          </View>
          <Text style={styles.messageDesc} numberOfLines={1}>
            {item.content}
          </Text>
        </View>
      </View>
      </TouchableOpacity>
    </Swipeable>
  );

  const ListHeaderComponent = () => (
    <SystemNotificationCard
      latestContent={systemNotifications[0]?.content}
      onPress={() => router.push("/system-notifications")}
    />
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <MessageCircle size={64} color="#D1D5DB" />
      <Text style={styles.emptyText}>暂无消息</Text>
      <Text style={styles.emptySubText}>您还没有收到任何通知</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
        style={styles.listContainer}
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshing={loading}
        onRefresh={loadNotifications}
      />
    </SafeAreaView>
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
    backgroundColor: "#F9FAFB",
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
  listContainer: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  systemNotificationItem: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  systemNotificationTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#92400E",
    flexShrink: 1,
  },
  systemNotificationDesc: {
    fontSize: 14,
    color: "#B45309",
    flex: 1,
  },
  messageItem: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  messageItemRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  pinnedItem: {
    backgroundColor: "#F0F7FF",
  },
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
  row1: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  pinIcon: {
    marginLeft: 6,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    flexShrink: 1,
  },
  unreadText: {
    fontWeight: "700",
    color: "#111827",
  },
  messageTime: {
    fontSize: 13,
    color: "#9CA3AF",
    marginLeft: 8,
    flexShrink: 0,
  },
  messageDesc: {
    fontSize: 14,
    color: "#6B7280",
    flex: 1,
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