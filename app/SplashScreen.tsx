import { useEffect, useState } from "react";
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";

const { width } = Dimensions.get("window");

export default function SplashScreenComponent({ onReady }: { onReady: () => void }) {
  const [scaleAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // X 软件启动动画：先缩小再放大超出屏幕
    const shrinkAnimation = Animated.timing(scaleAnim, {
      toValue: 0.6,
      duration: 800,
      useNativeDriver: true,
    });

    const expandAnimation = Animated.timing(scaleAnim, {
      toValue: 15,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    Animated.sequence([
      shrinkAnimation,
      expandAnimation,
    ]).start(() => {
      onReady();
    });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
            contentFit="contain"
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F4FE",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
});
