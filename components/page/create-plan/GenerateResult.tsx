import * as planApi from "@/src/api/plan";
import type { Destination, PlanFormData, PlanType } from "@/src/types/plan";
import EventSource from "react-native-sse";
import { CircleCheckBig, Loader2, Save } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, ScrollView, StyleSheet, Text, View } from "react-native";
import Markdown from "react-native-markdown-display";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_BASE_URL, API_ENDPOINTS } from "@/src/constants/api";
import { storage } from "@/src/utils/storage";

interface GenerateResultProps {
  abroadType: PlanType;
  destination: Destination;
  formData: PlanFormData;
  onComplete?: (planId: number) => void;
}

type Status = "loading" | "ready" | "error";

export default function GenerateResult({ abroadType, destination, formData, onComplete }: GenerateResultProps) {
  const [status, setStatus] = useState<Status>("loading");
  const [spinAnim] = useState(() => new Animated.Value(0));
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [displayContent, setDisplayContent] = useState<string>("");

  const scrollViewRef = useRef<ScrollView>(null);
  const contentBufferRef = useRef<string>("");

  // 用于自动滚动到底部
  useEffect(() => {
    if (displayContent) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [displayContent, status]);

  // 启动旋转动画
  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spin.start();
    return () => spin.stop();
  }, [spinAnim]);

  // 开始流式生成
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
        headers: {'Authorization': `Bearer ${token}`},
        autoReconnect: false,
      } as any);
      esRef.current = es;

      (es as any).addEventListener("message", (event: any) => {
        contentBufferRef.current += event.data;
        setDisplayContent(contentBufferRef.current);
      });

      (es as any).addEventListener("done", () => {
        spinAnim.stopAnimation();
        setStatus("ready");
        es.close();
      });
    };

    startStream();

    return () => {
      esRef.current?.close();
    };
  }, [abroadType, destination, formData]);

  // 确认并保存规划
  const handleConfirm = async () => {
    try {
      const savedPlan = await planApi.saveGeneratedPlan({
        type: abroadType,
        destination,
        formData,
        content: contentBufferRef.current,
      });
      onComplete?.(savedPlan.id);
    } catch (error) {
      console.error("保存规划失败:", error);
      setErrorMsg("保存失败，请重试");
      setStatus("error");
    }
  };

  const handleRetry = () => {
    setStatus("loading");
    contentBufferRef.current = "";
    setDisplayContent("");
    setErrorMsg("");
  };

  // 渲染加载状态
  const renderLoading = () => (
    <View className="items-center px-4">
      <Animated.View
        style={[
          styles.iconContainer,
          { transform: [{ rotate: spinAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] }) }] },
        ]}
      >
        <Loader2 size={48} color="#0076D6" />
      </Animated.View>
      <Text className="text-xl font-semibold text-gray-900 mt-6 mb-2">AI正在生成规划</Text>
      <Text className="text-sm text-gray-500 text-center">
        正在根据您提供的信息{"\n"}生成个性化的出国规划...
      </Text>

      {/* 实时显示已接收的内容 */}
      {displayContent && (
        <View className="mt-8 w-full">
          <Text className="text-sm font-medium text-gray-700 mb-3">生成中...</Text>
          <View className="bg-gray-100 rounded-lg p-4 w-full" style={{ maxHeight: 400 }}>
            <ScrollView ref={scrollViewRef} style={{ maxHeight: 400 }}>
              <Markdown>{displayContent}</Markdown>
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );

  // 渲染就绪状态（预览完整规划）
  const renderReady = () => (
    <View className="flex-1 px-4">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="items-center mb-6">
          <CircleCheckBig size={48} color="#22C55E" />
          <Text className="text-xl font-semibold text-gray-900 mt-3 mb-1">生成完成</Text>
          <Text className="text-sm text-gray-500">请确认以下规划内容</Text>
        </View>

        {/* 规划预览 */}
        <View className="bg-white rounded-xl p-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            {displayContent ? "生成的规划" : `${destination.country} ${abroadType} 规划`}
          </Text>

          <ScrollView ref={scrollViewRef} style={{ maxHeight: 400 }}>
            {displayContent ? (
              <Markdown>{displayContent}</Markdown>
            ) : (
              <Text className="text-sm text-gray-500">暂无内容</Text>
            )}
          </ScrollView>
        </View>
      </ScrollView>

      {/* 确认按钮 */}
      <View className="pb-4">
        <View
          className="bg-gray-900 px-8 py-4 rounded-xl flex-row items-center justify-center"
          onTouchEnd={handleConfirm}
        >
          <Save size={20} color="white" />
          <Text className="text-white font-medium ml-2">确认并保存规划</Text>
        </View>
      </View>
    </View>
  );

  // 渲染错误状态
  const renderError = () => (
    <View className="items-center px-4">
      <View style={[styles.iconContainer, { backgroundColor: "#FEE2E2" }]}>
        <Text className="text-2xl">!</Text>
      </View>
      <Text className="text-xl font-semibold text-gray-900 mt-6 mb-2">生成失败</Text>
      <Text className="text-sm text-gray-500 text-center mb-8">{errorMsg}</Text>
      <View
        className="bg-gray-900 px-8 py-3 rounded-xl"
        onTouchEnd={handleRetry}
      >
        <Text className="text-white font-medium">重新生成</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-gray-50">
      {status === "loading" && renderLoading()}
      {status === "ready" && renderReady()}
      {status === "error" && renderError()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
});
