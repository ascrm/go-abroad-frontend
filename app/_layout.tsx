import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";
import SplashScreenComponent from "./SplashScreen";
import { QueryProvider } from "@/src/hooks/queryProvider";
import { router } from "expo-router";
import {
  requestNotificationPermissions,
  addNotificationResponseListener,
} from "@/src/utils/notifications";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 准备完成后隐藏原生启动屏
    SplashScreen.hideAsync();
  }, []);

  // 请求通知权限并设置通知点击监听
  useEffect(() => {
    const setupNotifications = async () => {
      const granted = await requestNotificationPermissions();
      if (granted) {
        // 添加通知点击监听，点击后跳转到任务详情页
        addNotificationResponseListener((taskId) => {
          router.push({ pathname: "/(plan)/task-detail", params: { id: String(taskId) } });
        });
      }
    };
    setupNotifications();
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(home)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}
