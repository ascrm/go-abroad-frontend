import { router } from "expo-router";
import { Bell, Globe, Info, Languages, Lock, MessageCircle, Moon, Star, Trash2, Users, X } from "lucide-react-native";
import React from "react";
import { Alert, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface SettingsItemProps {
  icon: React.ComponentType<any>;
  label: string;
  onPress?: () => void;
}

const SettingsItem = ({ icon: Icon, label, onPress }: SettingsItemProps) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.settingItemLeft}>
      <View style={styles.iconContainer}>
        <Icon size={20} color="#4B5563" />
      </View>
      <Text style={styles.settingLabel}>{label}</Text>
    </View>
    <View style={styles.chevron} />
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const handleSwitchAccount = () => {
    router.push("/(profile)/switch-account");
  };

  const handleRateUs = () => {
    Alert.alert("感谢您的支持", "如果您喜欢我们的应用，请随时给我们好评！", [{ text: "确定" }]);
  };

  const handleFeedback = () => {
    Alert.prompt(
      "意见反馈",
      "请输入您的宝贵意见：",
      [
        { text: "取消", style: "cancel" },
        { text: "提交", onPress: (text) => Alert.alert("提交成功", "感谢您的反馈！", [{ text: "确定" }]) },
      ],
      "plain-text"
    );
  };

  const handleClearCache = () => {
    Alert.alert("清除缓存", "确定要清除缓存吗？", [
      { text: "取消", style: "cancel" },
      { text: "确定", onPress: () => Alert.alert("清除成功", "缓存已清除", [{ text: "确定" }]) },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <X size={24} color="#4B5563" />
          </TouchableOpacity>
          <Text style={styles.title}>设置</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>通用</Text>
          <SettingsItem icon={Users} label="账号管理" onPress={handleSwitchAccount} />
          <SettingsItem icon={Bell} label="通知管理" onPress={() => router.push("/(profile)/notification-settings")} />
          <SettingsItem icon={Languages} label="语言" />
          <SettingsItem icon={Moon} label="主题模式" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>关于</Text>
          <SettingsItem icon={Lock} label="隐私政策" onPress={() => router.push("/(profile)/privacy-policy")} />
          <SettingsItem icon={Info} label="关于我们" onPress={() => router.push("/(profile)/about-us")} />
          <SettingsItem icon={Star} label="给我们评分" onPress={handleRateUs} />
          <SettingsItem icon={MessageCircle} label="意见反馈" onPress={handleFeedback} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>存储</Text>
          <SettingsItem icon={Trash2} label="清除缓存" onPress={handleClearCache} />
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
    marginBottom: 16,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9CA3AF",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  settingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
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
  settingLabel: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  chevron: {
    width: 8,
    height: 8,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: "#D1D5DB",
    transform: [{ rotate: "-45deg" }],
  },
});
