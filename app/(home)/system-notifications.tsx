import { router } from "expo-router";
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Bell, MessageCircle, X } from "lucide-react-native";
import React, { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getSystemNotificationList,
  deleteNotification,
  type NotificationResponse
} from "@/src/api/notification";

export default function SystemNotificationsScreen() {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSystemNotificationList(1, 100);
      if (res && res.list) {
        setNotifications(res.list);
      }
    } catch (error) {
      console.error("加载系统通知失败:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications])
  );

  const handleDelete = (id: number) => {
    Alert.alert(
      "确认删除",
      "确定要删除这条系统通知吗？",
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
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onLongPress={() => handleDelete(item.id)}
    >
      {/* Header Row */}
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Bell size={20} color="#3B82F6" />
        </View>
        <Text style={styles.cardTitle}>系统通知</Text>
        <Text style={styles.cardTime}>{item.time}</Text>
      </View>

      {/* Content */}
      <Text style={styles.cardContent}>{item.content}</Text>
    </TouchableOpacity>
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <MessageCircle size={64} color="#D1D5DB" />
      <Text style={styles.emptyText}>暂无系统通知</Text>
      <Text style={styles.emptySubText}>您还没有收到任何系统通知</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <X size={24} color="#4B5563" />
        </TouchableOpacity>
        <Text style={styles.title}>系统通知</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        style={styles.listContainer}
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
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
    backgroundColor: "#F3F4F6",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#F9FAFB",
  },
  backButton: {
    padding: 4,
    width: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  placeholder: {
    width: 40,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#3B82F610",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    flex: 1,
  },
  cardTime: {
    fontSize: 13,
    color: "#9CA3AF",
    flexShrink: 0,
  },
  cardContent: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 22,
  },
  separator: {
    height: 12,
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
});