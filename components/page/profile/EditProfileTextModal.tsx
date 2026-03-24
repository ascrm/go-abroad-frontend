import { Globe, Info, X } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type EditProfileTextField = "nickname" | "username";

interface EditProfileTextModalProps {
  visible: boolean;
  field: EditProfileTextField;
  initialValue: string;
  onClose: () => void;
  onSave: (value: string) => void;
}

const ACCENT = "#2563EB";

export default function EditProfileTextModal({
  visible,
  field,
  initialValue,
  onClose,
  onSave,
}: EditProfileTextModalProps) {
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const [text, setText] = useState(initialValue);

  const isNickname = field === "nickname";
  const maxLength = isNickname ? 50 : 30;
  const headerTitle = isNickname ? "修改名称" : "修改标识名";
  const inputLabel = isNickname ? "名称" : "标识名";

  useEffect(() => {
    if (visible) {
      setText(initialValue);
      const t = setTimeout(() => inputRef.current?.focus(), 300);
      return () => clearTimeout(t);
    }
  }, [visible, initialValue]);

  const handleSave = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSave(trimmed);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={[styles.root, { paddingTop: insets.top }]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} hitSlop={12} style={styles.headerEdge}>
            <X size={22} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} pointerEvents="none">
            {headerTitle}
          </Text>
          <TouchableOpacity onPress={handleSave} hitSlop={12} style={styles.headerEdge}>
            <Text style={styles.saveText}>保存</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerDivider} />

        <View style={styles.body}>
          <Text style={styles.fieldLabel}>{inputLabel}</Text>
          <TextInput
            ref={inputRef}
            value={text}
            onChangeText={setText}
            maxLength={maxLength}
            placeholder={isNickname ? "请输入昵称" : "请输入标识名（不含 @）"}
            placeholderTextColor="#D1D5DB"
            style={styles.input}
            selectionColor={ACCENT}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={styles.inputUnderline} />
          <Text style={styles.counter}>
            {text.length}/{maxLength}
          </Text>

          <View style={styles.infoBlock}>
            <View style={styles.infoRow}>
              <Globe size={16} color="#6B7280" />
              <Text style={styles.infoText}>其他用户可在个人主页看到你的名称与标识名</Text>
            </View>
            <View style={styles.infoRow}>
              <Info size={16} color="#6B7280" />
              <Text style={styles.infoText}>
                请避免使用违规或误导性内容。修改后将在个人资料中立即生效。
                <Text style={styles.link}> 了解详情</Text>
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 48,
    position: "relative",
  },
  headerEdge: {
    minWidth: 48,
    zIndex: 1,
  },
  headerTitle: {
    position: "absolute",
    left: 56,
    right: 56,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600",
    color: ACCENT,
    textAlign: "right",
  },
  headerDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E7EB",
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: ACCENT,
    marginBottom: 8,
  },
  input: {
    fontSize: 17,
    color: "#111827",
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  inputUnderline: {
    height: 1,
    backgroundColor: "#111827",
    opacity: 0.35,
  },
  counter: {
    alignSelf: "flex-end",
    marginTop: 8,
    fontSize: 12,
    color: "#9CA3AF",
  },
  infoBlock: {
    marginTop: 28,
    gap: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: "#6B7280",
  },
  link: {
    color: ACCENT,
    fontWeight: "500",
  },
});
