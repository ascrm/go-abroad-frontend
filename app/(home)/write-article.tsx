import { router } from "expo-router";
import { ChevronLeft, ImagePlus, Send, X } from "lucide-react-native";
import { useCallback, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { RichEditor, RichToolbar, actions } from "react-native-pell-rich-editor";
import * as homeApi from "@/src/api/home";

const TAGS = ["留学攻略", "语言考试", "申请经验", "生活分享", "奖学金", "租房指南"];

export default function WriteArticleScreen() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const richText = useRef<RichEditor>(null);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handlePickCoverImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("提示", "需要相册权限才能添加封面图片");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setCoverImage(result.assets[0].uri);
    }
  }, []);

  const handleRemoveCoverImage = () => {
    setCoverImage(null);
  };

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) return;
    setPublishing(true);
    try {
      let imageUrl = coverImage;

      // 如果有封面图，先上传到 MinIO
      if (coverImage) {
        const fileName = coverImage.split('/').pop() || 'cover.jpg';
        imageUrl = await homeApi.uploadImage({
          uri: coverImage,
          name: fileName,
          type: 'image/jpeg',
        });
      }

      await homeApi.createArticle({
        title: title.trim(),
        content: content.trim(),
        tag: selectedTags[0] || undefined,
        image: imageUrl || undefined,
      });
      router.back();
    } catch (error) {
      console.error("发布失败:", error);
    } finally {
      setPublishing(false);
    }
  };

  const canPublish = title.trim().length > 0 && content.trim().length > 0 && !publishing;

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>写文章</Text>
        <TouchableOpacity
          onPress={handlePublish}
          disabled={!canPublish}
          style={[styles.publishBtn, !canPublish && styles.publishBtnDisabled]}
        >
          {publishing ? (
            <Text style={styles.publishText}>发布中...</Text>
          ) : (
            <Send size={18} color={canPublish ? "#FFFFFF" : "#9CA3AF"} />
          )}
        </TouchableOpacity>
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* 标题输入 */}
          <Animated.View entering={FadeInDown.duration(400).delay(50)}>
            <TextInput
              style={styles.titleInput}
              placeholder="标题"
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
          </Animated.View>

          {/* 标签选择 */}
          <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.tagsSection}>
            <Text style={styles.sectionLabel}>添加标签</Text>
            <View style={styles.tagsContainer}>
              {TAGS.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  onPress={() => toggleTag(tag)}
                  style={[styles.tag, selectedTags.includes(tag) && styles.tagSelected]}
                >
                  <Text style={[styles.tagText, selectedTags.includes(tag) && styles.tagTextSelected]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* 内容输入 */}
          <Animated.View entering={FadeInDown.duration(400).delay(150)} style={styles.contentSection}>
            <Text style={styles.sectionLabel}>正文</Text>
            <View style={styles.editorContainer}>
              <RichToolbar
                editor={richText}
                actions={[
                  actions.setBold,
                  actions.setItalic,
                  actions.setUnderline,
                  actions.setStrikethrough,
                  actions.heading1,
                  actions.heading2,
                  actions.heading3,
                  actions.insertBulletsList,
                  actions.insertOrderedList,
                  actions.setBlockquote,
                  actions.code,
                  actions.indent,
                  actions.outdent,
                  actions.alignLeft,
                  actions.alignCenter,
                  actions.alignRight,
                  actions.undo,
                  actions.redo,
                ]}
                style={styles.toolbar}
                iconTint="#6B7280"
                selectedIconTint="#3B82F6"
              />
              <RichEditor
                ref={richText}
                style={styles.richEditor}
                placeholder="分享你的出国经历..."
                onChange={setContent}
                initialContentHTML={contentHtml}
                initialHeight={200}
              />
            </View>
          </Animated.View>

          {/* 添加图片按钮或封面预览 */}
          <Animated.View entering={FadeInDown.duration(400).delay(200)}>
            {coverImage ? (
              <View style={styles.coverImageContainer}>
                <Image source={{ uri: coverImage }} style={styles.coverImagePreview} contentFit="cover" />
                <Pressable style={styles.removeCoverBtn} onPress={handleRemoveCoverImage}>
                  <X size={18} color="#FFFFFF" />
                </Pressable>
              </View>
            ) : (
              <TouchableOpacity style={styles.addImageBtn} onPress={handlePickCoverImage}>
                <ImagePlus size={22} color="#6B7280" />
                <Text style={styles.addImageText}>添加封面图片</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { width: 44, height: 44, alignItems: "flex-start", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "600", color: "#111827" },
  publishBtn: {
    minWidth: 70,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  publishBtnDisabled: { backgroundColor: "#E5E7EB" },
  publishText: { fontSize: 14, fontWeight: "600", color: "#FFFFFF" },
  keyboardView: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20 },
  titleInput: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tagsSection: { marginTop: 24 },
  sectionLabel: { fontSize: 15, fontWeight: "600", color: "#374151", marginBottom: 12 },
  tagsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tagSelected: { backgroundColor: "#EFF6FF", borderColor: "#3B82F6" },
  tagText: { fontSize: 14, fontWeight: "500", color: "#6B7280" },
  tagTextSelected: { color: "#3B82F6" },
  contentSection: { marginTop: 24 },
  editorContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  toolbar: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    paddingVertical: 8,
  },
  toolbarRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  toolbarBtn: {
    width: 36,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  toolbarBtnText: { fontSize: 14, fontWeight: "700", color: "#374151" },
  italic: { fontStyle: "italic" },
  strike: { textDecorationLine: "line-through" },
  richEditor: {
    minHeight: 200,
    backgroundColor: "#FFFFFF",
  },
  contentInput: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
    minHeight: 200,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  addImageBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    marginTop: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  addImageText: { fontSize: 15, fontWeight: "500", color: "#6B7280" },
  coverImageContainer: { marginTop: 20, position: "relative" },
  coverImagePreview: { width: "100%", height: 180, borderRadius: 12 },
  removeCoverBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
});