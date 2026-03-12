import { useEffect, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { CircleCheckBig, Loader2 } from "lucide-react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

interface GenerateResultProps {
  onComplete?: () => void;
}

export default function GenerateResult({ onComplete }: GenerateResultProps) {
  const [status, setStatus] = useState<"loading" | "success">("loading");
  const [spinAnim] = useState(new Animated.Value(0));

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

    // 3秒后切换到成功状态
    const timer = setTimeout(() => {
      spin.stop();
      setStatus("success");
    }, 3000);

    return () => {
      spin.stop();
      clearTimeout(timer);
    };
  }, []);

  const handleSuccess = () => {
    if (onComplete) {
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
