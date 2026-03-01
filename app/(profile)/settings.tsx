import { useAuthStore } from "@/src/stores/authStore";
import { router } from "expo-router";
import { Bell, HelpCircle, Info, Lock, Moon, Users, X } from "lucide-react-native";
import React from "react";
import { StatusBar, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

interface SettingsItemProps {
  icon: React.ComponentType<any>;
  label: string;
  type?: "navigate" | "toggle";
  value?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
}

const SettingsItem = ({ icon: Icon, label, type = "navigate", value = false, onToggle, onPress }: SettingsItemProps) => (
  <TouchableOpacity 
    style={styles.settingItem} 
    onPress={type === "toggle" ? () => onToggle && onToggle(!value) : onPress}
    activeOpacity={type === "toggle" ? 0.7 : 1}
  >
    <View style={styles.settingItemLeft}>
      <View style={styles.iconContainer}>
        <Icon size={20} color="#4B5563" />
      </View>
      <Text style={styles.settingLabel}>{label}</Text>
    </View>
    
    {type === "toggle" ? (
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: "#E5E7EB", true: "#3B82F6" }}
        thumbColor="#FFFFFF"
      />
    ) : (
      <View style={styles.chevron} />
    )}
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const [isNotificationOn, setIsNotificationOn] = React.useState(true);
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  
  const { user } = useAuthStore();

  const handleSwitchAccount = () => {
    router.push("/(profile)/switch-account");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <X size={24} color="#4B5563" />
          </TouchableOpacity>
          <Text style={styles.title}>设置</Text>
        </View>
      </View>

      <View style={styles.content}>
        <SettingsItem 
          icon={Bell} 
          label="接收通知" 
          type="toggle" 
          value={isNotificationOn} 
          onToggle={setIsNotificationOn} 
        />
        <SettingsItem 
          icon={Moon} 
          label="深色模式" 
          type="toggle" 
          value={isDarkMode} 
          onToggle={setIsDarkMode} 
        />
        
        <View style={styles.divider} />

        {/* 切换账号 - 仅登录后显示 */}
        {user && (
          <SettingsItem 
            icon={Users} 
            label="切换账号" 
            onPress={handleSwitchAccount}
          />
        )}
        
        <SettingsItem icon={Lock} label="隐私政策" />
        <SettingsItem icon={HelpCircle} label="帮助中心" />
        <SettingsItem icon={Info} label="关于我们" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
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
    fontWeight: 'bold',
    color: '#111827',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 16,
  },
  chevron: {
    width: 10,
    height: 10,
  },
});
