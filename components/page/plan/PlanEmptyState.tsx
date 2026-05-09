import { ClipboardList, Plus } from "lucide-react-native";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";

interface Colors {
  primary: string;
  onPrimary: string;
  secondary: string;
  background: string;
  foreground: string;
  muted: string;
  border: string;
  cardBg: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  destructive: string;
}

interface PlanEmptyStateProps {
  onCreatePlan?: () => void;
  colors?: Colors;
}

export default function PlanEmptyState({ onCreatePlan, colors }: PlanEmptyStateProps) {
  const c = colors || {
    primary: "#0D9488",
    muted: "#F1F5F9",
    textPrimary: "#0F172A",
    textSecondary: "#475569",
    textMuted: "#94A3B8",
    cardBg: "#FFFFFF",
    border: "#E2E8F0",
    foreground: "#0F172A",
    secondary: "#14B8A6",
    onPrimary: "#FFFFFF",
    destructive: "#DC2626",
  };

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrapper, { backgroundColor: c.muted }]}>
        <ClipboardList size={40} color={c.textMuted} />
      </View>

      <Text style={[styles.title, { color: c.textPrimary }]}>
        你还没有创建任何出国规划哦
      </Text>

      <Text style={[styles.subtitle, { color: c.textSecondary }]}>
        开始创建你的出国规划，让出国变得更简单
      </Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: c.primary }]}
        activeOpacity={0.85}
        onPress={onCreatePlan}
      >
        <Plus size={18} color={c.onPrimary} />
        <Text style={[styles.buttonText, { color: c.onPrimary }]}>创建规划</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
