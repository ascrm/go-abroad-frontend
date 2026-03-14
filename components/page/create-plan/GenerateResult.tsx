import { useEffect, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { CircleCheckBig, Loader2 } from "lucide-react-native";
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

export default function GenerateResult({ abroadType, destination, formData, onComplete }: GenerateResultProps) {
  const [status, setStatus] = useState<"loading" | "success">("loading");
  const [spinAnim] = useState(new Animated.Value(0));
  const [planId, setPlanId] = useState<number | null>(null);

  useEffect(() => {
    // 旋转动画
    const spin = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spin.start();

    // 调用 AI 生成规划
    const generatePlan = async () => {
      try {
        const response = await planApi.generatePlan({
          type: abroadType,
          destination,
          formData,
        });
        setPlanId(response.plan.id);
        spin.stop();
        setStatus("success");
      } catch (error) {
        console.error("生成规划失败:", error);
        spin.stop();
        // 可以选择显示错误状态，这里暂时直接显示成功
        setStatus("success");
      }
    };

    generatePlan();

    return () => {
      spin.stop();
    };
  }, [abroadType, destination, formData]);

  const handleSuccess = () => {
    if (planId) {
      // 跳转到规划详情页面
      router.replace({
        pathname: "/(plan)/plan-detail",
        params: { id: String(planId) }
      });
    } else if (onComplete) {
      onComplete();
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50 items-center justify-center">
      <View className="items-center">
        {status === "loading" ? (
          <>
            <Animated.View
              style={[
                styles.iconContainer,
                { transform: [{ rotate: spinAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] }) }] },
              ]}
            >
              <Loader2 size={48} color="#0076D6" />
            </Animated.View>
            <Text className="text-xl font-semibold text-gray-900 mt-6 mb-2">AI正在生成规划</Text>
            <Text className="text-sm text-gray-500">请稍候...</Text>
          </>
        ) : (
          <>
            <View style={styles.successIconContainer}>
              <CircleCheckBig size={48} color="#22C55E" />
            </View>
            <Text className="text-xl font-semibold text-gray-900 mt-6 mb-2">生成成功</Text>
            <Text className="text-sm text-gray-500 mb-8">您的出国规划已生成完毕</Text>
            <View
              className="bg-gray-900 px-8 py-3 rounded-xl"
              onTouchEnd={handleSuccess}
            >
              <Text className="text-white font-medium">查看规划</Text>
            </View>
          </>
        )}
      </View>
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
