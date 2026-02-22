import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import PlanEmptyState from "../../components/page/plan/PlanEmptyState";

export default function PlanScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* 空状态 */}
      <PlanEmptyState onCreatePlan={() => router.push("/create-plan")} />
    </SafeAreaView>
  );
}
