import { Stack } from "expo-router";

export default function HomeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="search" options={{ presentation: "card", animation: "slide_from_right" }} />
    </Stack>
  );
}