import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import "../global.css";
import SplashScreenComponent from "./SplashScreen";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 准备完成后隐藏原生启动屏
    SplashScreen.hideAsync();
  }, []);

  const handleSplashReady = () => {
    setIsReady(true);
  };

  if (!isReady) {
    return (
      <>
        <StatusBar hidden />
        <SplashScreenComponent onReady={handleSplashReady} />
      </>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
