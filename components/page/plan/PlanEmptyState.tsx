import { ClipboardList, Plus, List, ArrowRight } from "lucide-react-native";
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
  onViewPlans?: () => void;
  colors?: Colors;
  /** true = 有规划但没有进行中的, false = 没有任何规划 */
  hasPlans?: boolean;
}

export default function PlanEmptyState({ onCreatePlan, onViewPlans, colors, hasPlans = false }: PlanEmptyStateProps) {
  const c = colors || {
    primary: "#18181B",
    muted: "#F4F4F5",
    textPrimary: "#18181B",
    textSecondary: "#52525B",
    textMuted: "#A1A1AA",
    cardBg: "#FFFFFF",
    border: "#E4E4E7",
    foreground: "#0A0A0A",
    secondary: "#27272A",
    onPrimary: "#FFFFFF",
    destructive: "#18181B",
  };

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrapper, { backgroundColor: c.muted }]}>
        <ClipboardList size={40} color={c.textMuted} />
      </View>

      <Text style={[styles.title, { color: c.textPrimary }]}>
        {hasPlans ? "已经创建了规划，但还没有开始哦" : "你还没有创建任何出国规划哦"}
      </Text>

      <Text style={[styles.subtitle, { color: c.textSecondary }]}>
        {hasPlans
          ? "选择一条规划开始吧"
          : "开始创建你的出国规划，让出国变得更简单"}
      </Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: hasPlans ? "#22C55E" : c.primary }]}
        activeOpacity={0.85}
        onPress={hasPlans ? onViewPlans : onCreatePlan}
      >
        <Text style={[styles.buttonText, { color: "#FFFFFF" }]}>
          {hasPlans ? "查看规划" : "创建规划"}
        </Text>
        <ArrowRight size={18} color="#FFFFFF" />
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
    justifyContent: "center",
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
