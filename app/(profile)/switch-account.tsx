import { authApi } from "@/src/api/auth";
import { useAuthStore } from "@/src/stores/authStore";
import { User as UserType } from "@/src/types/auth";
import { router } from "expo-router";
import { CheckCheck, LogOut, User, UserRoundPlus, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Alert, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// 历史账号信息
interface AccountItem {
  user: UserType;
  isSelected: boolean;
}

export default function SwitchAccountScreen() {
  const { user: currentUser, logout } = useAuthStore();
  const [accounts, setAccounts] = useState<AccountItem[]>([]);

  useEffect(() => {
    // TODO: 从存储中获取历史账号列表
    // 模拟数据，实际应该从 storage 或 API 获取
    if (currentUser) {
      setAccounts([
        { user: currentUser, isSelected: true },
      ]);
    }
  }, [currentUser]);

  const handleSelectAccount = (index: number) => {
    const newAccounts = accounts.map((item, i) => ({
      ...item,
      isSelected: i === index,
    }));
    setAccounts(newAccounts);
  };

  const handleAddAccount = () => {
    router.push("/(auth)/login");
  };

  const handleLogout = () => {
    Alert.alert(
      "退出登录",
      "确定要退出当前账号吗？",
      [
        { text: "取消", style: "cancel" },
        {
          text: "确定",
          onPress: async () => {
            try {
              // 调用退出登录 API
              await authApi.logout();
            } catch (error) {
              // API 调用失败不影响本地退出流程
              console.log('Logout API error:', error);
            } finally {
              // 清除本地存储的登录状态
              await logout();
              router.replace("/(auth)/login");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* 顶部标题栏 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <X size={24} color="#4B5563" />
          </TouchableOpacity>
          <Text style={styles.title}>切换账号</Text>
        </View>
      </View>

      {/* 账号列表 */}
      <View style={styles.accountList}>
        {accounts.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.accountItem}
            onPress={() => handleSelectAccount(index)}
            activeOpacity={0.7}
          >
            {/* 头像 */}
            <View style={styles.avatarContainer}>
              {item.user.avatar ? (
                <Image
                  source={{ uri: item.user.avatar }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <User size={32} color="#9CA3AF" />
                </View>
              )}
            </View>

            {/* 用户信息 */}
            <View style={styles.userInfo}>
              <Text style={styles.nickname}>{item.user.nickname}</Text>
              <Text style={styles.username}>@{item.user.username}</Text>
            </View>

            {/* 选中标识 */}
            {item.isSelected && (
              <CheckCheck size={24} color="#10B981" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* 底部操作选项 */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.actionItem}
          onPress={handleAddAccount}
          activeOpacity={0.7}
        >
          <View style={styles.actionIconContainer}>
            <UserRoundPlus size={20} color="#4B5563" />
          </View>
          <Text style={styles.actionText}>添加账号</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionItem}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <View style={styles.actionIconContainer}>
            <LogOut size={20} color="#4B5563" />
          </View>
          <Text style={styles.actionText}>退出登录</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: StatusBar.currentHeight || 44,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  accountList: {
    paddingHorizontal: 20,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  nickname: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  username: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  bottomActions: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  actionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
});
