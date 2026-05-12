import * as planApi from "@/src/api/plan";
import type { Destination, PlanFormData, PlanType } from "@/src/types/plan";
import EventSource from "react-native-sse";
import { CheckCircle2, Loader2, Sparkles, ChevronRight, AlertCircle, RefreshCw, MapPin } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Markdown from "react-native-markdown-display";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_BASE_URL, API_ENDPOINTS } from "@/src/constants/api";
import { storage } from "@/src/utils/storage";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";

interface GenerateResultProps {
  abroadType: PlanType;
  destination: Destination;
  formData: PlanFormData;
  onComplete?: (planId: number) => void;
}

type Status = "loading" | "streaming" | "ready" | "saving" | "error";

const COLORS = {
  primary: "#0D9488",
  secondary: "#14B8A6",
  accent: "#EA580C",
  background: "#F0FDFA",
  foreground: "#134E4A",
  muted: "#E8F1F4",
  border: "#99F6E4",
  surface: "#FFFFFF",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  error: "#DC2626",
};

export default function GenerateResult({ abroadType, destination, formData, onComplete }: GenerateResultProps) {
  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [displayContent, setDisplayContent] = useState<string>("");
  const [planId, setPlanId] = useState<number | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);
  const contentBufferRef = useRef<string>("");

  // Animation values
  const pulseAnim = useSharedValue(1);
  const dotAnim1 = useSharedValue(0);
  const dotAnim2 = useSharedValue(0);
  const dotAnim3 = useSharedValue(0);
  const shimmerAnim = useSharedValue(0);

  // Auto-scroll when content updates
  useEffect(() => {
    if (displayContent && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 50);
    }
  }, [displayContent]);

  // Loading animations
  useEffect(() => {
    if (status === "loading" || status === "streaming") {
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      dotAnim1.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.3, { duration: 400 })
        ),
        -1,
        false
      );
      dotAnim2.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.3, { duration: 400 })
        ),
        -1,
        false
      );
      dotAnim3.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.3, { duration: 400 })
        ),
        -1,
        false
      );

      shimmerAnim.value = withRepeat(
        withTiming(1, { duration: 1500, easing: Easing.linear }),
        -1,
        false
      );
    }
  }, [status]);

  // Start streaming
  useEffect(() => {
    const esRef: { current: any } = { current: null };

    const startStream = async () => {
      const params = new URLSearchParams({
        type: abroadType,
        destination: JSON.stringify(destination),
        formData: JSON.stringify(formData),
      });
      const token = await storage.getAccessToken();
      const url = `${API_BASE_URL}${API_ENDPOINTS.plan.generateStream}?${params.toString()}`;

      const es = new EventSource(url, {
        headers: { 'Authorization': `Bearer ${token}` },
        autoReconnect: false,
      } as any);
      esRef.current = es;

      (es as any).addEventListener("message", (event: any) => {
        if (event.data) {
          contentBufferRef.current += event.data;
          setDisplayContent(contentBufferRef.current);
          setStatus("streaming");
        }
      });

      (es as any).addEventListener("done", () => {
        setStatus("ready");
        es.close();
      });
    };

    startStream();
    return () => { esRef.current?.close(); };
  }, [abroadType, destination, formData]);

  // Dot animation styles (hooks at component top level)
  const dotStyle1 = useAnimatedStyle(() => ({
    opacity: dotAnim1.value,
    transform: [{ scale: interpolate(dotAnim1.value, [0.3, 1], [0.8, 1], Extrapolation.CLAMP) }],
  }));
  const dotStyle2 = useAnimatedStyle(() => ({
    opacity: dotAnim2.value,
    transform: [{ scale: interpolate(dotAnim2.value, [0.3, 1], [0.8, 1], Extrapolation.CLAMP) }],
  }));
  const dotStyle3 = useAnimatedStyle(() => ({
    opacity: dotAnim3.value,
    transform: [{ scale: interpolate(dotAnim3.value, [0.3, 1], [0.8, 1], Extrapolation.CLAMP) }],
  }));

  // Shimmer style for content area
  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmerAnim.value, [0, 0.5, 1], [0.3, 0.6, 0.3], Extrapolation.CLAMP),
  }));

  // Handle confirm and save
  const handleConfirm = async () => {
    try {
      setStatus("saving");
      const savedPlan = await planApi.saveGeneratedPlan({
        type: abroadType,
        destination,
        formData,
        content: contentBufferRef.current,
      });

      setPlanId(savedPlan.id);

      // Wait for AI resource recommendation generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get full plan with resources
      const fullPlan = await planApi.getPlanDetail(savedPlan.id);
      await storage.setCurrentPlan(fullPlan);

      onComplete?.(savedPlan.id);
    } catch (error) {
      console.error("保存规划失败:", error);
      setErrorMsg("保存失败，请稍后重试");
      setStatus("error");
    }
  };

  const handleRetry = () => {
    contentBufferRef.current = "";
    setDisplayContent("");
    setErrorMsg("");
    setStatus("loading");
  };

  // Loading state with pulsing animation
  const renderLoading = () => (
    <Animated.View entering={FadeIn.duration(500)} style={styles.centerContainer}>
      <Animated.View
        style={[
          styles.iconPulseContainer,
          { transform: [{ scale: pulseAnim }] },
        ]}
      >
        <View style={styles.iconInner}>
          <Sparkles size={40} color={COLORS.primary} />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.textSection}>
        <Text style={styles.titleLarge}>AI 正在为你规划</Text>
        <Text style={styles.subtitle}>
          目的地：{destination.country || "未选择"}
        </Text>
      </Animated.View>

      {/* Loading dots */}
      <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.dotsContainer}>
        <Animated.View style={dotStyle1}>
          <View style={[styles.dot, { backgroundColor: COLORS.primary }]} />
        </Animated.View>
        <Animated.View style={dotStyle2}>
          <View style={[styles.dot, { backgroundColor: COLORS.secondary }]} />
        </Animated.View>
        <Animated.View style={dotStyle3}>
          <View style={[styles.dot, { backgroundColor: COLORS.accent }]} />
        </Animated.View>
      </Animated.View>

      <Text style={styles.hintText}>根据你的信息生成专属规划方案...</Text>
    </Animated.View>
  );

  // Streaming state - showing AI response in real-time
  const renderStreaming = () => (
    <View style={styles.streamingContainer}>
      <Animated.View entering={FadeInDown.duration(300)} style={styles.streamingHeader}>
        <View style={styles.streamingBadge}>
          <Animated.View style={shimmerStyle}>
            <View style={styles.streamingDot} />
          </Animated.View>
          <Text style={styles.streamingBadgeText}>实时生成中</Text>
        </View>
        <Text style={styles.streamingSubtext}>AI 规划助手</Text>
      </Animated.View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.contentScroll}
        contentContainerStyle={styles.contentScrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(300)}>
          <View style={styles.markdownCard}>
            <Markdown
              style={{
                body: { color: COLORS.textPrimary, fontSize: 15, lineHeight: 24 },
                heading1: { fontSize: 22, fontWeight: "700", color: COLORS.textPrimary, marginBottom: 12, marginTop: 8 },
                heading2: { fontSize: 18, fontWeight: "600", color: COLORS.textPrimary, marginBottom: 8, marginTop: 16 },
                heading3: { fontSize: 16, fontWeight: "600", color: COLORS.textPrimary, marginBottom: 6, marginTop: 12 },
                paragraph: { marginBottom: 8 },
                list_item: { marginBottom: 4 },
                strong: { fontWeight: "600" },
                blockquote: { backgroundColor: COLORS.muted, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginVertical: 8 },
              }}
            >
              {displayContent}
            </Markdown>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );

  // Ready state - complete preview
  const renderReady = () => (
    <View style={styles.readyContainer}>
      <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.successHeader}>
        <View style={styles.successIconBg}>
          <CheckCircle2 size={48} color={COLORS.primary} />
        </View>
        <Text style={styles.successTitle}>规划已生成</Text>
        <Text style={styles.successSubtitle}>请预览你的专属规划方案</Text>
      </Animated.View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.previewScroll}
        contentContainerStyle={styles.previewScrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.delay(200).springify()}>
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <MapPin size={18} color={COLORS.primary} />
              <Text style={styles.previewTitle}>
                {destination.country} {abroadType === 'tourism' ? '旅行' : abroadType === 'study' ? '留学' : abroadType === 'work' ? '工作' : '定居'}规划
              </Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.markdownContainer}>
          <View style={styles.markdownCard}>
            <Markdown
              style={{
                body: { color: COLORS.textPrimary, fontSize: 15, lineHeight: 24 },
                heading1: { fontSize: 22, fontWeight: "700", color: COLORS.textPrimary, marginBottom: 12, marginTop: 8 },
                heading2: { fontSize: 18, fontWeight: "600", color: COLORS.textPrimary, marginBottom: 8, marginTop: 16 },
                heading3: { fontSize: 16, fontWeight: "600", color: COLORS.textPrimary, marginBottom: 6, marginTop: 12 },
                paragraph: { marginBottom: 8 },
                list_item: { marginBottom: 4 },
                strong: { fontWeight: "600" },
                blockquote: { backgroundColor: COLORS.muted, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginVertical: 8 },
              }}
            >
              {displayContent}
            </Markdown>
          </View>
        </Animated.View>
      </ScrollView>

      <Animated.View entering={FadeInUp.delay(400).springify()} style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.8}
          onPress={handleConfirm}
        >
          <Text style={styles.primaryButtonText}>确认并保存规划</Text>
          <ChevronRight size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );

  // Saving state
  const renderSaving = () => (
    <Animated.View entering={FadeIn.duration(300)} style={styles.centerContainer}>
      <Animated.View
        style={[
          styles.iconPulseContainer,
          { transform: [{ scale: pulseAnim }] },
        ]}
      >
        <View style={styles.iconInner}>
          <Loader2 size={40} color={COLORS.primary} />
        </View>
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.textSection}>
        <Text style={styles.titleLarge}>正在保存规划</Text>
        <Text style={styles.subtitle}>AI 同时在为你生成资源推荐...</Text>
      </Animated.View>
    </Animated.View>
  );

  // Error state
  const renderError = () => (
    <Animated.View entering={FadeIn.duration(300)} style={styles.centerContainer}>
      <View style={[styles.iconInner, { backgroundColor: "#FEE2E2" }]}>
        <AlertCircle size={40} color={COLORS.error} />
      </View>
      <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.textSection}>
        <Text style={styles.titleLargeError}>生成失败</Text>
        <Text style={styles.subtitleError}>{errorMsg}</Text>
      </Animated.View>
      <Animated.View entering={FadeInUp.delay(400).springify()} style={styles.errorAction}>
        <TouchableOpacity
          style={styles.retryButton}
          activeOpacity={0.8}
          onPress={handleRetry}
        >
          <RefreshCw size={18} color={COLORS.primary} />
          <Text style={styles.retryButtonText}>重新生成</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      {status === "loading" && renderLoading()}
      {(status === "streaming") && renderStreaming()}
      {status === "ready" && renderReady()}
      {status === "saving" && renderSaving()}
      {status === "error" && renderError()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  iconPulseContainer: {
    marginBottom: 32,
  },
  iconInner: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: COLORS.muted,
    alignItems: "center",
    justifyContent: "center",
  },
  textSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  titleLarge: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  dotsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  hintText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
  },
  streamingContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  streamingHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  streamingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.muted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  streamingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  streamingBadgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.primary,
  },
  streamingSubtext: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  contentScroll: {
    flex: 1,
  },
  contentScrollContainer: {
    paddingBottom: 24,
  },
  markdownCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  readyContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  successHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  successIconBg: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  successSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  previewScroll: {
    flex: 1,
  },
  previewScrollContainer: {
    paddingBottom: 16,
  },
  previewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  markdownContainer: {
    marginBottom: 12,
  },
  actionContainer: {
    paddingVertical: 16,
    paddingBottom: 24,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
  titleLargeError: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.error,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitleError: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  errorAction: {
    marginTop: 24,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
  },
});