import { router } from "expo-router";
import { Bell, MessageSquare, Settings, X } from "lucide-react-native";
import React from "react";
import { ScrollView, StatusBar, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

interface NotificationItemProps {
  icon: React.ComponentType<any>;
  title: string;
  value: boolean;
  onToggle: (value: boolean) => void;
}

const NotificationItem = ({ icon: Icon, title, value, onToggle }: NotificationItemProps) => (
  <View style={styles.item}>
    <View style={styles.itemLeft}>
      <View style={styles.iconContainer}>
        <Icon size={20} color="#4B5563" />
      </View>
      <Text style={styles.itemTitle}>{title}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{ false: "#E5E7EB", true: "#3B82F6" }}
      thumbColor="#FFFFFF"
    />
  </View>
);

export default function NotificationSettingsScreen() {
  const [systemNotify, setSystemNotify] = React.useState(true);
  const [commentNotify, setCommentNotify] = React.useState(true);
  const [answerNotify, setAnswerNotify] = React.useState(true);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <X size={24} color="#4B5563" />
          </TouchableOpacity>
          <Text style={styles.title}>通知管理</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <NotificationItem
            icon={Settings}
            title="系统通知"
            value={systemNotify}
            onToggle={setSystemNotify}
          />
          <NotificationItem
            icon={MessageSquare}
            title="评论通知"
            value={commentNotify}
            onToggle={setCommentNotify}
          />
          <NotificationItem
            icon={Bell}
            title="回答通知"
            value={answerNotify}
            onToggle={setAnswerNotify}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingTop: StatusBar.currentHeight || 44,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "white",
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
});
