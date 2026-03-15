import { useEffect, useState, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View, ScrollView } from "react-native";
import { CircleCheckBig, Loader2, Save } from "lucide-react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as planApi from "@/src/api/plan";
import type { PlanType, Destination, PlanFormData } from "@/src/types/plan";

interface GenerateResultProps {
  abroadType: PlanType;
  destination: Destination;
  formData: PlanFormData;
  onComplete?: () => void;
}

type Status = "loading" | "ready" | "saving" | "success" | "error";

export default function GenerateResult({ abroadType, destination, formData, onComplete }: GenerateResultProps) {
  const [status, setStatus] = useState<Status>("loading");
  const [spinAnim] = useState(new Animated.Value(0));
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [displayContent, setDisplayContent] = useState<string>("");
  const scrollViewRef = useRef<ScrollView>(null);
  const previewScrollRef = useRef<ScrollView>(null);

  // 用于自动滚动到底部
  useEffect(() => {
    if (status === "loading" && displayContent) {
      // 延迟一下确保内容渲染完成后再滚动
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
    // 生成完成后也滚动到预览区域底部
    if (status === "ready" && displayContent) {
      setTimeout(() => {
        previewScrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [displayContent, status]);

  // 用于累积显示内容
  const contentBufferRef = useRef<string>("");

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
    const startStream = async () => {
      try {
        await planApi.generatePlanStream(
          {
            type: abroadType,
            destination,
            formData,
          },
          // onChunk - 每次收到内容，直接显示
          (chunk: string) => {
            contentBufferRef.current += chunk;
            setDisplayContent(contentBufferRef.current);
          },
          // onComplete - 完成
          () => {
            spinAnim.stopAnimation();
            setStatus("ready");
          },
          // onError - 错误
          (error: Error) => {
            console.error("流式生成失败:", error);
            spinAnim.stopAnimation();
            setErrorMsg(error.message);
            setStatus("error");
          }
        );
      } catch (error) {
        console.error("生成规划失败:", error);
        spinAnim.stopAnimation();
        setErrorMsg(error instanceof Error ? error.message : "未知错误");
        setStatus("error");
      }
    };

    startStream();
  }, [abroadType, destination, formData, spinAnim]);

  // 确认并保存规划
  const handleConfirm = async () => {
    if (!displayContent) return;

    // TODO: 目前 displayContent 是原始文本，需要解析成结构化数据后才能保存
    // 暂时显示提示
    setErrorMsg("请等待内容生成完成后再保存");
    setStatus("ready");
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
          <View className="bg-gray-100 rounded-lg p-4 w-full max-h-64">
            <ScrollView ref={scrollViewRef}>
              <Text className="text-sm text-gray-800 font-mono whitespace-pre-wrap">
                {displayContent}
              </Text>
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
            {displayContent ? '生成的规划' : `${destination.country} ${abroadType} 规划`}
          </Text>
          
          <ScrollView ref={previewScrollRef} style={{ maxHeight: 400 }}>
            <Text className="text-sm text-gray-700 whitespace-pre-wrap">
              {displayContent || '暂无内容'}
            </Text>
          </ScrollView>
        </View>
      </ScrollView>

      {/* 确认按钮 */}
      <View className="mt-4 pb-4">
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

  // 渲染保存中状态
  const renderSaving = () => (
    <View className="items-center">
      <Animated.View
        style={[
          styles.iconContainer,
          { transform: [{ rotate: spinAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] }) }] },
        ]}
      >
        <Loader2 size={48} color="#0076D6" />
      </Animated.View>
      <Text className="text-xl font-semibold text-gray-900 mt-6 mb-2">保存中</Text>
      <Text className="text-sm text-gray-500">正在保存您的规划...</Text>
    </View>
  );

  // 渲染成功状态
  const renderSuccess = () => (
    <View className="items-center">
      <View style={styles.successIconContainer}>
        <CircleCheckBig size={48} color="#22C55E" />
      </View>
      <Text className="text-xl font-semibold text-gray-900 mt-6 mb-2">保存成功</Text>
      <Text className="text-sm text-gray-500 mb-8">正在跳转到规划详情...</Text>
    </View>
  );

  // 渲染错误状态
  const renderError = () => (
    <View className="items-center px-4">
      <View style={[styles.iconContainer, { backgroundColor: '#FEE2E2' }]}>
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
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
      {status === "loading" && renderLoading()}
      {status === "ready" && renderReady()}
      {status === "saving" && renderSaving()}
      {status === "success" && renderSuccess()}
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
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
  },
});
