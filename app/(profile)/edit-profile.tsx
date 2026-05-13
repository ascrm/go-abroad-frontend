import EditProfileTextModal, {
  type EditProfileTextField,
} from "@/components/page/profile/EditProfileTextModal";
import { useAuthStore } from "@/src/stores/authStore";
import { userApi } from "@/src/api/user";
import { User as UserType } from "@/src/types/auth";
import { storage } from "@/src/utils/storage";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Camera, Info, Pencil, X } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { Alert, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/avataaars/png?seed=default";

export default function EditProfileScreen() {
  const [user, setUser] = useState<UserType | null>(null);
  const [avatarUri, setAvatarUri] = useState<string>(DEFAULT_AVATAR);
  const [bgUrl, setBgUrl] = useState<string>("");
  const [nickname, setNickname] = useState("");
  const [username, setUsername] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [modalField, setModalField] = useState<EditProfileTextField>("nickname");

  useEffect(() => {
    const loadUser = async () => {
      const userStr = await storage.getUser();
      if (userStr) {
        try {
          const userData = JSON.parse(userStr) as UserType;
          setUser(userData);
          setAvatarUri(userData.avatar || DEFAULT_AVATAR);
          setBgUrl(userData.bgUrl || "");
          setNickname(userData.nickname || "");
          setUsername(userData.username || "");
        } catch {}
      }
    };
    loadUser();
  }, []);

  const persistUser = useCallback(async (next: UserType) => {
    // 同步到后端，用后端返回的完整用户信息更新本地
    const updated = await userApi.update({
      nickname: next.nickname,
      username: next.username,
      avatar: next.avatar,
      bgUrl: next.bgUrl,
    });
    await storage.setUser(JSON.stringify(updated));
    useAuthStore.setState({ user: updated });
    setUser(updated);
    return updated;
  }, []);

  const handlePickAvatar = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("提示", "需要相册权限才能更换头像");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]?.uri) return;
    const uri = result.assets[0].uri;

    // 上传到MinIO获取URL
    const avatarUrl = await userApi.uploadAvatar(uri);
    const updated = await persistUser({ ...user, avatar: avatarUrl });
    // 用后端返回的avatar确保回显正确
    setAvatarUri(updated.avatar || avatarUrl);
  }, [user, persistUser]);

  const handlePickBg = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("提示", "需要相册权限才能更换背景图");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]?.uri) return;
    const uri = result.assets[0].uri;

    // 上传到MinIO获取URL
    const bgUrlResult = await userApi.uploadAvatar(uri);
    const updated = await persistUser({ ...user, bgUrl: bgUrlResult });
    // 用后端返回的bgUrl确保回显正确
    setBgUrl(updated.bgUrl || bgUrlResult);
  }, [user, persistUser]);

  const openModal = (field: EditProfileTextField) => {
    setModalField(field);
    setModalVisible(true);
  };

  const handleModalSave = async (value: string) => {
    if (!user) {
      setNickname(modalField === "nickname" ? value : nickname);
      setUsername(modalField === "username" ? value : username);
      return;
    }
    if (modalField === "nickname") {
      setNickname(value);
      await persistUser({ ...user, nickname: value });
    } else {
      setUsername(value);
      await persistUser({ ...user, username: value });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.title}>编辑个人资料</Text>
      </View>

      <TouchableOpacity activeOpacity={0.85} style={styles.item} onPress={handlePickAvatar}>
        <View style={styles.itemLeft}>
          <Text style={styles.itemLabel}>照片</Text>
          <Text style={styles.itemSubtitle}>更改你的照片或拍摄新照片</Text>
        </View>

        <View style={styles.avatarWrapper}>
          <Image source={{ uri: avatarUri }} style={styles.avatar} contentFit="cover" />
          <View style={styles.cameraBadge}>
            <Camera size={12} color="#FFFFFF" />
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity activeOpacity={0.85} style={styles.item} onPress={handlePickBg}>
        <View style={styles.itemLeft}>
          <Text style={styles.itemLabel}>背景图</Text>
          <Text style={styles.itemSubtitle}>更改你的个人主页背景图</Text>
        </View>

        <View style={styles.bgPreview}>
          {bgUrl ? (
            <Image source={{ uri: bgUrl }} style={styles.bgImage} contentFit="cover" />
          ) : (
            <View style={styles.bgPlaceholder}>
              <Text style={styles.bgPlaceholderText}>未设置</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity activeOpacity={0.8} style={styles.item} onPress={() => openModal("nickname")}>
        <View style={styles.itemLeft}>
          <Text style={styles.itemLabel}>名称</Text>
          <Text style={styles.itemValue}>{nickname || "未登录用户"}</Text>
        </View>
        <Pencil size={18} color="#111827" />
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity activeOpacity={0.8} style={styles.item} onPress={() => openModal("username")}>
        <View style={styles.itemLeft}>
          <Text style={styles.itemLabel}>标识名</Text>
          <Text style={styles.itemValue}>@{username || "guest_user"}</Text>
        </View>
        <Pencil size={18} color="#111827" />
      </TouchableOpacity>

      <View style={styles.divider} />

      <View style={styles.notice}>
        <Info size={13} color="#9CA3AF" />
        <Text style={styles.noticeText}>
          你公开显示的名称和头像会展示在个人主页中，后续可随时再次修改。
        </Text>
      </View>

      <EditProfileTextModal
        visible={modalVisible}
        field={modalField}
        initialValue={modalField === "nickname" ? nickname : username}
        onClose={() => setModalVisible(false)}
        onSave={handleModalSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: StatusBar.currentHeight || 44,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  closeButton: {
    marginRight: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  itemLeft: {
    flex: 1,
    paddingRight: 12,
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 13,
    color: "#9CA3AF",
    lineHeight: 20,
  },
  itemValue: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
  },
  avatarWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: "hidden",
    position: "relative",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  cameraBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#111827CC",
    alignItems: "center",
    justifyContent: "center",
  },
  bgPreview: {
    width: 64,
    height: 36,
    borderRadius: 6,
    overflow: "hidden",
  },
  bgImage: {
    width: "100%",
    height: "100%",
  },
  bgPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  bgPlaceholderText: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginHorizontal: 20,
  },
  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  noticeText: {
    flex: 1,
    color: "#9CA3AF",
    fontSize: 13,
    lineHeight: 20,
  },
});
