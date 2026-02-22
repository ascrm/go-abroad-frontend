import { Bell, HelpCircle, Info, Lock, Moon, X } from "lucide-react-native";
import React from "react";
import { Modal, StatusBar, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

const SettingsItem = ({ icon: Icon, label, type = "navigate", value = false, onToggle }: any) => (
  <TouchableOpacity 
    style={styles.settingItem} 
    onPress={type === "toggle" ? () => onToggle(!value) : undefined}
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
      <View style={styles.chevron}>
         {/* Placeholder for navigate arrow if needed, or just rely on touch */}
      </View>
    )}
  </TouchableOpacity>
);

export const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose }) => {
  const [isNotificationOn, setIsNotificationOn] = React.useState(true);
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalView}>
        <StatusBar barStyle="dark-content" />
        
        {/* Header */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>设置</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#4B5563" />
          </TouchableOpacity>
        </View>

        <View style={styles.modalContent}>
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

          <SettingsItem icon={Lock} label="隐私政策" />
          <SettingsItem icon={HelpCircle} label="帮助中心" />
          <SettingsItem icon={Info} label="关于我们" />
        </View>

      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalView: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: StatusBar.currentHeight || 44, // Ensure content starts below status bar
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
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
  }
});
