import { authApi } from "@/src/api/auth";
import { useAuthStore } from "@/src/stores/authStore";
import { storage } from "@/src/utils/storage";
import { User as UserType } from "@/src/types/auth";
import { Image } from "expo-image";
import { router } from "expo-router";
import { CheckCheck, KeyRound, LogOut, UserRoundPlus, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Alert, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface HistoricalAccount {
  user: UserType;
  accountType: number;
  accountValue: string;
}

interface AccountItem {
  user: UserType;
  isSelected: boolean;
  accountType: number;
  accountValue: string;
}

export default function SwitchAccountScreen() {
  const { user: currentUser, logout, checkAuth } = useAuthStore();
  const [accounts, setAccounts] = useState<AccountItem[]>([]);

  useEffect(() => {
    loadHistoryAccounts();
  }, []);

  const loadHistoryAccounts = async () => {
    const historyAccounts = await storage.getHistoryAccounts();
    const accountItems: AccountItem[] = historyAccounts.map((acc: HistoricalAccount) => ({
      user: acc.user,
      isSelected: acc.user.userId === currentUser?.userId,
      accountType: acc.accountType,
      accountValue: acc.accountValue,
    }));
    setAccounts(accountItems);
  };

  const handleSelectAccount = async (index: number) => {
    const selectedAccount = accounts[index];

    // 如果选中的就是当前账号，不需要切换
    if (selectedAccount.isSelected) return;

    // 保存当前账号到临时存储（用于可能的情况）
    const currentHistoryAccounts = await storage.getHistoryAccounts();

    // 调用切换账号API（后端需要支持）或直接重新登录
    try {
      // 调用后端切换账号接口
      await authApi.switchAccount({
        accountType: selectedAccount.accountType,
        accountValue: selectedAccount.accountValue,
      });

      // 重新加载认证状态
      await checkAuth();
      loadHistoryAccounts();
    } catch (error) {
      console.log('切换账号失败:', error);
    }
  };

  const handleAddAccount = () => {
    router.push("/(auth)/welcome");
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
              await authApi.logout();
            } catch (error) {
              console.log('Logout API error:', error);
            } finally {
              await logout();
              router.replace("/(auth)/welcome");
            }
          },
        },
      ]
    );
  };

  const getAccountTypeLabel = (accountType: number, accountValue: string) => {
    switch (accountType) {
      case 1: return '第三方登录';
      case 2: return accountValue;
      case 3: return accountValue.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
      default: return accountValue;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

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

      <View style={styles.accountList}>
        {accounts.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.accountItem}
            onPress={() => handleSelectAccount(index)}
            activeOpacity={0.7}
          >
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: item.user.avatar }}
                style={styles.avatar}
              />
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.nickname}>{item.user.nickname}</Text>
              <Text style={styles.accountType}>{getAccountTypeLabel(item.accountType, item.accountValue)}</Text>
            </View>

            {item.isSelected && (
              <CheckCheck size={24} color="#10B981" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.actionItem}
          onPress={() => router.push("/(profile)/reset-password-account")}
          activeOpacity={0.7}
        >
          <View style={styles.actionIconContainer}>
            <KeyRound size={20} color="#4B5563" />
          </View>
          <Text style={styles.actionText}>修改密码</Text>
        </TouchableOpacity>

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
  accountType: {
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
