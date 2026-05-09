import { router } from "expo-router";
import { Image } from "expo-image";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { useRegisterFlowStore } from "../../src/stores/registerFlowStore";

const AVATAR_POOL = [
  "Felix", "Aneka", "Bailey", "Coco", "Daisy", "Ella",
  "Fred", "Ginger", "Honey", "Ivy", "Jasper", "Kiki",
  "Luna", "Milo", "Nala", "Oreo", "Pepper", "Quinn",
];

const AVATAR_URLS = AVATAR_POOL.map(
  (seed) => `https://api.dicebear.com/7.x/avataaars/png?seed=${seed}&backgroundColor=c0aede,d1d4f9,ffd5dc,ffdfbf,b6e3f4`
);

function AvatarItem({ url, isSelected, onSelect }: { url: string; isSelected: boolean; onSelect: () => void }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    scale.value = withSpring(0.9, { damping: 15 });
    setTimeout(() => { scale.value = withSpring(1, { damping: 15 }); }, 100);
    onSelect();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <Animated.View style={[styles.avatarItem, isSelected && styles.avatarItemSelected, animatedStyle]}>
        <Image source={{ uri: url }} style={styles.avatarImage} contentFit="cover" />
        {isSelected && (
          <View style={styles.checkBadge}><Text style={styles.checkIcon}>✓</Text></View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function RegisterAvatarScreen() {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const { setAvatar } = useRegisterFlowStore();

  const handleNext = () => {
    if (selectedAvatar) setAvatar(selectedAvatar);
    router.push("/(auth)/register-age");
  };

  const handleSkip = () => { router.push("/(auth)/register-age"); };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressContainer}>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <View key={i} style={[styles.progressDot, i === 4 ? styles.progressDotActive : styles.progressDotInactive]} />
        ))}
      </View>

      <Animated.View entering={FadeInDown.duration(500).springify()} style={styles.titleSection}>
        <Text style={styles.title}>选择头像</Text>
        <Text style={styles.subtitle}>从头像库中挑选一个喜欢的吧</Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(500).delay(100).springify()} style={styles.gridSection}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.gridContent}>
          <View style={styles.avatarGrid}>
            {AVATAR_URLS.map((url, i) => (
              <AvatarItem key={i} url={url} isSelected={selectedAvatar === url} onSelect={() => setSelectedAvatar(url)} />
            ))}
          </View>
        </ScrollView>
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(500).delay(200).springify()} style={styles.buttonSection}>
        <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8} onPress={handleNext}>
          <Text style={styles.primaryButtonText}>{selectedAvatar ? "确认头像" : "下一步"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip} activeOpacity={0.7}>
          <Text style={styles.skipText}>暂时跳过</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  progressContainer: { flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 12, marginBottom: 28 },
  progressDot: { height: 3, borderRadius: 1.5 },
  progressDotActive: { width: 28, backgroundColor: "#000000" },
  progressDotInactive: { width: 6, backgroundColor: "#D1D5DB" },
  titleSection: { paddingHorizontal: 24, marginBottom: 28 },
  title: { fontSize: 36, fontWeight: "800", color: "#000000", letterSpacing: -1 },
  subtitle: { fontSize: 15, color: "#6B7280", marginTop: 10 },
  gridSection: { flex: 1, marginHorizontal: 24 },
  gridContent: { paddingBottom: 16 },
  avatarGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16, justifyContent: "center" },
  avatarItem: { width: 72, height: 72, borderRadius: 36, borderWidth: 2, borderColor: "#E5E7EB", overflow: "hidden", backgroundColor: "#FFFFFF" },
  avatarItemSelected: { borderColor: "#000000", shadowColor: "#000000", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 5 },
  avatarImage: { width: "100%", height: "100%" },
  checkBadge: { position: "absolute", bottom: 0, right: 0, width: 22, height: 22, borderRadius: 11, backgroundColor: "#000000", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#FFFFFF" },
  checkIcon: { color: "#FFFFFF", fontSize: 11, fontWeight: "700" },
  buttonSection: { paddingHorizontal: 24, paddingBottom: 24, gap: 12 },
  primaryButton: { backgroundColor: "#000000", borderRadius: 14, paddingVertical: 17, alignItems: "center", shadowColor: "#000000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4 },
  primaryButtonText: { color: "#FFFFFF", fontSize: 17, fontWeight: "600" },
  skipButton: { paddingVertical: 12, alignItems: "center" },
  skipText: { fontSize: 14, color: "#9CA3AF" },
});
