import { router } from "expo-router";
import { BookOpen, ChevronRight, HelpCircle, MessageCircle, Phone, X } from "lucide-react-native";
import React from "react";
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface HelpItemProps {
  icon: React.ComponentType<any>;
  title: string;
  description?: string;
  onPress?: () => void;
}

const HelpItem = ({ icon: Icon, title, description, onPress }: HelpItemProps) => (
  <TouchableOpacity style={styles.helpItem} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.helpItemLeft}>
      <View style={styles.iconContainer}>
        <Icon size={20} color="#3B82F6" />
      </View>
      <View style={styles.helpItemText}>
        <Text style={styles.helpItemTitle}>{title}</Text>
        {description && <Text style={styles.helpItemDesc}>{description}</Text>}
      </View>
    </View>
    <ChevronRight size={20} color="#9CA3AF" />
  </TouchableOpacity>
);

export default function HelpCenterScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <X size={24} color="#4B5563" />
        </TouchableOpacity>
        <Text style={styles.title}>帮助中心</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>常见问题</Text>

        <HelpItem
          icon={BookOpen}
          title="如何使用旅行规划功能"
          description="了解如何创建和管理您的旅行计划"
        />
        <HelpItem
          icon={MessageCircle}
          title="账户相关问题"
          description="登录、注册、找回密码等常见问题"
        />
        <HelpItem
          icon={Phone}
          title="联系客服"
          description="获取人工客服帮助"
        />

        <Text style={styles.sectionTitle}>功能指南</Text>

        <HelpItem
          icon={BookOpen}
          title="新手入门指南"
          description="快速了解APP核心功能"
        />
        <HelpItem
          icon={BookOpen}
          title="目的地探索"
          description="如何浏览和搜索目的地"
        />
        <HelpItem
          icon={BookOpen}
          title="行程管理"
          description="创建、编辑和分享您的行程"
        />

        <Text style={styles.sectionTitle}>更多帮助</Text>

        <HelpItem
          icon={MessageCircle}
          title="意见反馈"
          description="提交您的建议或问题"
        />
        <HelpItem
          icon={HelpCircle}
          title="常见问题FAQ"
          description="查看更多常见问题解答"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: StatusBar.currentHeight || 44,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 12,
    marginTop: 8,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  helpItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  helpItemText: {
    flex: 1,
  },
  helpItemTitle: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  helpItemDesc: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
});
